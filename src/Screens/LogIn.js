// src/Screens/LogIn.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button } from 'react-native-paper';
import styles from '../Styles/stylesLogin';
// Note: We import 'signIn' instead of 'signInWithUsername'
import { signIn } from '../Config/firebaseServices'; 

const LogIn = ({ navigation }) => {
  // We use 'identifier' because it can be username OR email
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [formValid, setFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Validation
  useEffect(() => {
    setFormValid(identifier.trim() !== '' && password.trim() !== '');
  }, [identifier, password]);

  const handleLogin = async () => {
    if (!formValid) return Alert.alert('Error', 'Please complete all fields');

    setLoading(true);
    try {
      // Send identifier (email/user) and password
      const profile = await signIn({ identifier, password });
      
      if (!profile?.id) throw new Error('Incorrect username or password');
      
      // Success -> Navigate to Feed
      navigation.replace('TweetList', { profile });
    } catch (e) {
      // Translate error messages for the user
      let msg = e.message || 'Invalid credentials';
      if (msg.includes('User not found')) msg = 'Account not found';
      if (msg.includes('Incorrect password')) msg = 'Wrong password';
      
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logoX}>HY</Text>
        <Text style={styles.title}>Log in to HY</Text>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="* Username or Email"
              value={identifier}
              onChangeText={setIdentifier}
              style={styles.input}
              mode="outlined"
              autoCapitalize="none"
              keyboardType="email-address" // Helps with @ symbol
              disabled={loading}
            />
            
            <TextInput
              label="* Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              style={styles.input}
              mode="outlined"
              disabled={loading}
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
              contentStyle={{ height: 48 }}
            >
              Log In
            </Button>
            
            <Button
              mode="text"
              onPress={() => navigation.navigate('SignUp')}
              style={styles.link}
              uppercase={false}
            >
              Create a new account
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

export default LogIn;