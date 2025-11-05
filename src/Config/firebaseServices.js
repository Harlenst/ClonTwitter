// src/Config/firebaseServices.js
import { app } from './firebaseConfig';
import {
  initializeFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  startAfter,
  limit,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  documentId,
} from 'firebase/firestore';

// Firestore para RN, forzando long-polling (evita cuelgues por red)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
  useFetchStreams: false,
});

// === Util de timeout para evitar loaders infinitos ===
const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_FIRESTORE')), ms)
    ),
  ]);

/* =========================
   LISTAS: SIGUIENDO / SEGUIDORES
   ========================= */

export const getFollowingUsers = async (userId, lastDocCursor = null, pageSize = 10) => {
  try {
    const me = await withTimeout(getDoc(doc(db, 'users', userId)));
    if (!me.exists()) throw new Error('Usuario no encontrado');

    const followingIds = Array.isArray(me.data().following) ? me.data().following : [];
    if (followingIds.length === 0) return { users: [], lastVisible: null };

    const cursor = typeof lastDocCursor === 'number' ? lastDocCursor : 0;
    const slice = followingIds.slice(cursor, cursor + pageSize);
    if (slice.length === 0) return { users: [], lastVisible: null };

    const snap = await withTimeout(
      getDocs(query(collection(db, 'users'), where(documentId(), 'in', slice)))
    );

    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    users.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

    const nextCursor = cursor + slice.length < followingIds.length ? cursor + slice.length : null;
    return { users, lastVisible: nextCursor };
  } catch (error) {
    console.error('Error getFollowingUsers:', error);
    throw error;
  }
};

export const getFollowersUsers = async (userId, lastFullName = null, pageSize = 10) => {
  try {
    let qBase = query(
      collection(db, 'users'),
      where('following', 'array-contains', userId),
      orderBy('fullName'),
      limit(pageSize)
    );
    if (lastFullName) {
      qBase = query(
        collection(db, 'users'),
        where('following', 'array-contains', userId),
        orderBy('fullName'),
        startAfter(lastFullName),
        limit(pageSize)
      );
    }
    const snap = await withTimeout(getDocs(qBase));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const next = users.length > 0 ? users[users.length - 1].fullName : null;
    const lastVisible = users.length === pageSize ? next : null;
    return { users, lastVisible };
  } catch (error) {
    console.error('Error getFollowersUsers:', error);
    throw error;
  }
};

/* =========================
   FOLLOW / UNFOLLOW
   ========================= */

export const followUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId || !targetUserId) throw new Error('Ids inválidos');
    if (currentUserId === targetUserId) throw new Error('No puedes seguirte a ti mismo');

    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);

    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayUnion(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayUnion(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) {
    console.error('Error followUser:', error);
    throw error;
  }
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    if (!currentUserId || !targetUserId) return;
    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);

    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayRemove(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayRemove(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) {
    console.error('Error unfollowUser:', error);
    throw error;
  }
};

/* =========================
   PERFIL / LOGIN (sin Auth)
   ========================= */

export const createProfile = async (profileData) => {
  try {
    const { email, password, username, name, lastName } = profileData;

    if (!email || !password) throw new Error('Email y contraseña son obligatorios');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    if (!username || username.length < 3) throw new Error('El nombre de usuario debe tener al menos 3 caracteres');

    const emailLower = email.trim().toLowerCase();
    const usernameLower = username.toLowerCase().replace(/[^a-z0-9]/g, '');

    // keywords
    const keywords = new Set();
    const fullName = `${name?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    const fullNameLower = fullName.toLowerCase();
    fullNameLower.split(' ').filter(Boolean).forEach(w => {
      for (let i = 1; i <= w.length; i++) keywords.add(w.substring(0, i));
    });
    for (let i = 1; i <= usernameLower.length; i++) keywords.add(usernameLower.substring(0, i));

    // Validaciones de unicidad con timeout
    const [emailSnap, usernameSnap] = await withTimeout(Promise.all([
      getDocs(query(collection(db, 'users'), where('email', '==', emailLower), limit(1))),
      getDocs(query(collection(db, 'users'), where('username', '==', usernameLower), limit(1))),
    ]));

    if (!emailSnap.empty) throw new Error('Este email ya está registrado');
    if (!usernameSnap.empty) throw new Error('Este nombre de usuario no está disponible');

    // Crear usuario
    const userRef = await withTimeout(addDoc(collection(db, 'users'), {
      ...profileData,
      email: emailLower,
      username: usernameLower,
      password, // texto plano (sin Auth, como pediste)
      fullName: fullName || usernameLower,
      keywords: Array.from(keywords),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      following: [],
      followers: [],
    }));

    const finalDoc = await withTimeout(getDoc(userRef));
    if (!finalDoc.exists()) throw new Error('Error al crear el perfil');

    return { id: userRef.id, ...finalDoc.data() };
  } catch (error) {
    console.error('Error en createProfile:', error);
    throw error;
  }
};

export const signInWithEmail = async ({ email, password }) => {
  try {
    const emailLower = (email || '').trim().toLowerCase();
    const snap = await withTimeout(getDocs(query(collection(db, 'users'), where('email', '==', emailLower), limit(1))));
    if (snap.empty) throw new Error('Usuario no encontrado');

    const userDoc = snap.docs[0];
    const user = userDoc.data();
    if (user.password !== password) throw new Error('Contraseña incorrecta');

    return { id: userDoc.id, ...user };
  } catch (error) {
    console.error('Error en signInWithEmail:', error);
    throw error;
  }
};

/* =========================
   TWEETS / FEED
   ========================= */

export const addTweet = async (tweetData) => {
  try {
    await withTimeout(addDoc(collection(db, 'tweets'), {
      ...tweetData,
      timestamp: serverTimestamp(),
    }));
  } catch (error) {
    console.error('Error addTweet:', error);
    throw error;
  }
};

import {
  // …tus imports…
  Timestamp,
} from 'firebase/firestore';

// …

/**
 * Feed con cursor por timestamp (ms).
 * - Primera página: lastTimestamp === null
 * - Siguientes: lastTimestamp = número en ms del último tweet mostrado
 * Soporta >10 seguidos haciendo queries por lotes de 10 IDs.
 */
export const getFeedTweets = async (userId, lastTimestamp = null, pageSize = 10) => {
  try {
    if (!userId) throw new Error('userId es requerido');

    const me = await getDoc(doc(db, 'users', userId));
    if (!me.exists()) throw new Error('Usuario no encontrado');

    const following = Array.isArray(me.data().following) ? me.data().following : [];
    const allIds = [...new Set([userId, ...following])];
    if (allIds.length === 0) return { tweets: [], lastVisible: null };

    // Partir en lotes de 10 para 'in'
    const idBatches = [];
    for (let i = 0; i < allIds.length; i += 10) idBatches.push(allIds.slice(i, i + 10));

    const collected = [];
    for (const ids of idBatches) {
      // Base query
      let qBase = query(
        collection(db, 'tweets'),
        where('authorId', 'in', ids),
        orderBy('timestamp', 'desc'),
        limit(pageSize) // cada lote devuelve máx pageSize
      );

      // Si es siguiente página, filtrar por timestamp <
      if (lastTimestamp) {
        qBase = query(
          collection(db, 'tweets'),
          where('authorId', 'in', ids),
          where('timestamp', '<', Timestamp.fromMillis(lastTimestamp)),
          orderBy('timestamp', 'desc'),
          limit(pageSize)
        );
      }

      const snap = await getDocs(qBase);
      snap.docs.forEach(d => {
        const data = d.data();
        collected.push({
          id: d.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || new Date(0),
        });
      });
    }

    // Unificar, ordenar y paginar en cliente
    const uniq = Array.from(new Map(collected.map(t => [t.id, t])).values());
    uniq.sort((a, b) => b.timestamp - a.timestamp);

    const page = uniq.slice(0, pageSize);
    const nextCursor = page.length > 0 ? page[page.length - 1].timestamp.getTime() : null;

    return { tweets: page, lastVisible: nextCursor };
  } catch (error) {
    // Si Firestore te pide índice compuesto, va a caer aquí.
    // Muestra el error arriba para que la UI lo capture.
    console.error('getFeedTweets error:', error);
    throw error;
  }
};
