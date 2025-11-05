// src/Screens/LogIn.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import styles from '../Styles/stylesLogin';
import { signInWithEmail } from '../Config/firebaseServices';

const LogIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormValid(email.trim() !== '' && password.trim() !== '');
  }, [email, password]);

  const handleLogin = async () => {
    if (!formValid) return Alert.alert('Error', 'Completa los campos');

    setLoading(true);
    try {
      const profile = await signInWithEmail({ email, password });
      if (!profile?.id) throw new Error('Error al cargar perfil');
      navigation.replace('TweetList', { profile });
    } catch (e) {
      Alert.alert('Error', e.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logoX}>HY</Text>
        <Text style={styles.title}>Iniciar Sesión</Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="* Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="* Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={styles.input}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={hidePassword ? 'eye' : 'eye-off'}
                  onPress={() => setHidePassword((v) => !v)}
                />
              }
            />
            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={!formValid || loading}
              loading={loading}
              labelStyle={{ fontWeight: '700' }}
            >
              Iniciar sesión
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.link}
            >
              Crear una nueva cuenta
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default LogIn;
