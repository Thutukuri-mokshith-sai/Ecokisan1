import React, { useState } from 'react';
import { 
  View, TextInput, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Easing 
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '../config';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const fadeAnim = useState(new Animated.Value(0))[0];

  const animateMessage = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const requestOTP = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password/request-otp`, { email });
      setMessage(res.data.message || 'OTP Sent');
      animateMessage();
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      animateMessage();
    }
  };

  const resetPassword = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password/reset`, { email, otp, newPassword });
      setMessage(res.data.message || 'Password reset successful');
      animateMessage();
      navigation.replace('Login');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      animateMessage();
    }
  };

  return (
    <LinearGradient colors={['#A8E6CF', '#DCEDC1']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Text style={styles.title}>Forgot Password</Text>

        {step === 1 ? (
          <>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={requestOTP}>
              <FontAwesome5 name="paper-plane" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Request OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="vpn-key" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="OTP"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                keyboardType="numeric"
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={resetPassword}>
              <FontAwesome5 name="check-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}

        {message ? (
          <Animated.View style={{ ...styles.messageContainer, opacity: fadeAnim }}>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>
        ) : null}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingVertical: 8,
    color: '#4CAF50',
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  messageContainer: { marginTop: 20, padding: 10, borderRadius: 10, backgroundColor: 'rgba(76,175,80,0.2)' },
  message: { color: '#33691E', textAlign: 'center', fontWeight: 'bold' },
});
