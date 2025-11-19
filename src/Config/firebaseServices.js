import { app, db } from '../Config/firebaseConfig';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { Platform } from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  arrayUnion,
  arrayRemove,
  documentId,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch
} from 'firebase/firestore';

// Storage global
export const storage = getStorage(app);

// Helper de timeout
const withTimeout = (promise, ms = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT_FIRESTORE')), ms)
    ),
  ]);

// ... (Mantén tus funciones de USUARIOS: getUserById, createProfile, signInWithUsername) ...
// ... (Mantén tus funciones de SIGUIENDO: getFollowingUsers, getFollowersUsers, follow, unfollow) ...

// =======================
// 🔹 STORAGE: SUBIR IMAGEN (OPTIMIZADO)
// =======================
export const uploadImageToStorage = async (imageAsset, pathInStorage) => {
  try {
    if (!imageAsset) throw new Error('No hay imagen para subir');

    const storageRef = ref(storage, pathInStorage);

    // ESTRATEGIA 1: BASE64 (Recomendada para React Native sin módulos extra)
    // Requiere que en el picker uses includeBase64: true
    if (imageAsset.base64) {
      // 'data_url' maneja prefijos automáticamente, pero 'base64' es raw.
      // Usamos 'base64' directo.
      await uploadString(storageRef, imageAsset.base64, 'base64');
    } 
    // ESTRATEGIA 2: BLOB vía FETCH (Fallback estándar)
    else if (imageAsset.uri) {
      let uri = imageAsset.uri;
      
      // Parche para Android: asegurar protocolo file:// si es local y no content://
      if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
          uri = `file://${uri}`;
      }

      const response = await fetch(uri);
      if (!response.ok) throw new Error('Fallo al leer la imagen local');
      
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      
      // Forzar limpieza de memoria (opcional)
      // @ts-ignore
      blob.close && blob.close(); 
    } else {
      throw new Error('La imagen no tiene datos válidos (ni URI ni Base64)');
    }

    // Obtener la URL pública
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;

  } catch (error) {
    console.error('Error uploadImageToStorage:', error);
    throw error;
  }
};

// ... (Mantén tus funciones de TWEETS: addTweet, getTweet, getFeedTweets) ...
// ... (Mantén tus funciones de INTERACCIONES: toggleLikeTweet, toggleRetweet) ...
// ... (Mantén tus funciones de REPLIES: addReply, getTweetReplies) ...

// NOTA: Asegúrate de exportar todas las funciones necesarias que tenías antes.
// Aquí solo he reescrito uploadImageToStorage para brevedad, pero el archivo debe contener todo.

// =======================
// 🔹 TWEETS (FEED)
// =======================
export const addTweet = async (tweetData) => {
  try {
    await withTimeout(addDoc(collection(db, 'tweets'), {
      ...tweetData,
      imageUrl: tweetData.imageUrl || null,
      timestamp: serverTimestamp(),
      likes: 0,
      retweets: 0,
      replies: 0,
      likesList: [],
      retweetsList: []
    }));
  } catch (error) {
    console.error('Error addTweet:', error);
    throw error;
  }
};

export const getTweet = async (tweetId) => {
    try {
        const docRef = doc(db, 'tweets', tweetId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            return {
                id: snap.id,
                ...data,
                timestamp: data.timestamp?.toDate?.() || new Date(),
            };
        }
        return null;
    } catch (error) {
        console.error('Error getTweet:', error);
        return null;
    }
};

export const getFeedTweets = async (userId, lastTimestamp = null, pageSize = 10) => {
  try {
    if (!userId) throw new Error('userId es requerido');
    const me = await getDoc(doc(db, 'users', userId));
    if (!me.exists()) throw new Error('Usuario no encontrado');

    const following = me.data().following || [];
    const allIds = [...new Set([userId, ...following])];
    const idBatches = [];
    for (let i = 0; i < allIds.length; i += 10) {
      idBatches.push(allIds.slice(i, i + 10));
    }

    const collected = [];
    for (const ids of idBatches) {
      let qBase = query(
        collection(db, 'tweets'),
        where('authorId', 'in', ids),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );
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
    const uniq = Array.from(new Map(collected.map(t => [t.id, t])).values());
    uniq.sort((a, b) => b.timestamp - a.timestamp);
    const page = uniq.slice(0, pageSize);
    const nextCursor = page.length > 0 ? page[page.length - 1].timestamp.getTime() : null;
    return { tweets: page, lastVisible: nextCursor };
  } catch (error) {
    console.error('getFeedTweets error:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await withTimeout(getDoc(docRef));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  } catch (error) {
    console.error('Error getUserById:', error);
    throw error;
  }
};

export const createProfile = async (profileData) => {
  try {
    const { email, password, username } = profileData;
    const userRef = await withTimeout(addDoc(collection(db, 'users'), {
      ...profileData,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      createdAt: serverTimestamp(),
      following: [],
      followers: [],
    }));
    return { id: userRef.id, ...profileData };
  } catch (e) { throw e; }
};

export const signInWithUsername = async ({ username, password }) => {
   try {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Usuario no encontrado');
    const user = snap.docs[0].data();
    if (user.password !== password) throw new Error('Contraseña incorrecta');
    return { id: snap.docs[0].id, ...user };
   } catch(e) { throw e; }
};

export const getFollowingUsers = async (userId, lastDocCursor = null, pageSize = 10) => {
  try {
    const me = await withTimeout(getDoc(doc(db, 'users', userId)));
    if (!me.exists()) throw new Error('Usuario no encontrado');
    const followingIds = Array.isArray(me.data().following) ? me.data().following : [];
    if (followingIds.length === 0) return { users: [], lastVisible: null };
    const cursor = typeof lastDocCursor === 'number' ? lastDocCursor : 0;
    const slice = followingIds.slice(cursor, cursor + pageSize);
    if (slice.length === 0) return { users: [], lastVisible: null };
    const snap = await withTimeout(getDocs(query(collection(db, 'users'), where(documentId(), 'in', slice))));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    users.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
    const nextCursor = cursor + slice.length < followingIds.length ? cursor + slice.length : null;
    return { users, lastVisible: nextCursor };
  } catch (error) { console.error(error); throw error; }
};

export const getFollowersUsers = async (userId, lastFullName = null, pageSize = 10) => {
  try {
    let qBase = query(collection(db, 'users'), where('following', 'array-contains', userId), orderBy('fullName'), limit(pageSize));
    if (lastFullName) {
      qBase = query(collection(db, 'users'), where('following', 'array-contains', userId), orderBy('fullName'), startAfter(lastFullName), limit(pageSize));
    }
    const snap = await withTimeout(getDocs(qBase));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const next = users.length > 0 ? users[users.length - 1].fullName : null;
    return { users, lastVisible: users.length === pageSize ? next : null };
  } catch (error) { console.error(error); throw error; }
};

export const followUser = async (currentUserId, targetUserId) => {
  try {
    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);
    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayUnion(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayUnion(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) { console.error(error); throw error; }
};

export const unfollowUser = async (currentUserId, targetUserId) => {
  try {
    const currentRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);
    await Promise.all([
      withTimeout(updateDoc(currentRef, { following: arrayRemove(targetUserId), updatedAt: serverTimestamp() })),
      withTimeout(updateDoc(targetRef, { followers: arrayRemove(currentUserId), updatedAt: serverTimestamp() })),
    ]);
  } catch (error) { console.error(error); throw error; }
};

export const toggleLikeTweet = async (tweetId, userId, isLiked) => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId);
    if (isLiked) {
      await updateDoc(tweetRef, { likesList: arrayRemove(userId), likes: increment(-1) });
    } else {
      await updateDoc(tweetRef, { likesList: arrayUnion(userId), likes: increment(1) });
    }
  } catch (error) { console.error('Error toggleLikeTweet:', error); throw error; }
};

export const toggleRetweet = async (tweetId, userId, isRetweeted) => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId);
    if (isRetweeted) {
      await updateDoc(tweetRef, { retweetsList: arrayRemove(userId), retweets: increment(-1) });
    } else {
      await updateDoc(tweetRef, { retweetsList: arrayUnion(userId), retweets: increment(1) });
    }
  } catch (error) { console.error('Error toggleRetweet:', error); throw error; }
};

export const addReply = async (tweetId, replyData) => {
  try {
    const batch = writeBatch(db);
    const tweetRef = doc(db, 'tweets', tweetId);
    const repliesCollection = collection(db, 'tweets', tweetId, 'replies');
    const newReplyRef = doc(repliesCollection);
    batch.set(newReplyRef, { ...replyData, timestamp: serverTimestamp() });
    batch.update(tweetRef, { replies: increment(1) });
    await batch.commit();
    return newReplyRef.id;
  } catch (error) { console.error('Error addReply:', error); throw error; }
};

export const getTweetReplies = async (tweetId) => {
  try {
    const q = query(collection(db, 'tweets', tweetId, 'replies'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || new Date() }));
  } catch (error) { console.error('Error getTweetReplies:', error); return []; }
};