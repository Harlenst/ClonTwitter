// src/Screens/SignUp.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert, Text, Keyboard } from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import styles from '../Styles/stylesSignUp';
import { createProfile } from '../Config/firebaseServices';

const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (email.includes('@') && username.trim().length < 3) {
      const generated = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
      setUsername(generated);
    }
  }, [email]); 

  useEffect(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isValid =
      name.trim() !== '' &&
      lastName.trim() !== '' &&
      emailValid &&
      password.length >= 6 &&
      username.trim().length >= 3;
    setFormValid(isValid);
  }, [name, lastName, email, password, username]);

  const buildProfilePayload = () => ({
    name: name.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    password,
    username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
    phone: phone.trim(),
    description: description.trim(),
  });

  const handleSave = useCallback(async () => {
    if (loading) return; 
    if (!formValid) {
      Alert.alert('Error', 'Completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    Keyboard.dismiss();

    try {
      const profile = await createProfile(buildProfilePayload());
      if (!profile?.id) throw new Error('No se pudo crear el perfil');
      navigation.replace('TweetList', { profile });
    } catch (error) {
      let msg = error?.message || 'No se pudo crear la cuenta';
   
      if (msg === 'TIMEOUT_FIRESTORE') {
        msg = 'No se logró conectar con Firestore en este momento. Revisa tu Internet e inténtalo de nuevo';
      } else if (/correo|email/i.test(msg)) {
        msg = 'Este correo ya está en uso';
      } else if (/usuario|username/i.test(msg)) {
        msg = 'Este nombre de usuario no está disponible';
      } else if (/Usuario no encontrado/i.test(msg)) {
        msg = 'No fue posible validar la información. Inténtalo nuevamente';
      }
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }, [loading, formValid, name, lastName, email, password, username, phone, description, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear Cuenta</Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="* Nombre"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              autoCapitalize="words"
              disabled={loading}
              returnKeyType="next"
            />

            <TextInput
              label="* Apellido"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.input}
              autoCapitalize="words"
              disabled={loading}
              returnKeyType="next"
            />

            <TextInput
              label="* Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
              disabled={loading}
              returnKeyType="next"
            />

            <TextInput
              label="* Nombre de usuario"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              left={<TextInput.Icon icon="at" />}
              disabled={loading}
              returnKeyType="next"
            />

            <TextInput
              label="* Contraseña (mín. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={hidePassword}
              error={password.length > 0 && password.length < 6}
              right={
                <TextInput.Icon
                  icon={hidePassword ? 'eye' : 'eye-off'}
                  onPress={() => setHidePassword(v => !v)}
                />
              }
              disabled={loading}
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <TextInput
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              disabled={loading}
            />

            <TextInput
              label="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              disabled={!formValid || loading}
              loading={loading}
              contentStyle={{ height: 50 }}
              labelStyle={{ fontWeight: '700' }}
            >
              Registrarse
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default SignUp;
