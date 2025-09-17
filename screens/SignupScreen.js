import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Animated, Easing 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { BASE_URL } from '../config';

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = details, 2 = OTP
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'user',
    address: '',
    district: '',
    state: '',
    language: ''
  });
  const [otp, setOtp] = useState('');
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

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/signup/request-otp`, form);
      setMessage(res.data.message || 'OTP Sent');
      animateMessage();
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || err.message);
      animateMessage();
    }
  };

  const verifyOTP = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/signup/verify-otp`, {
        email: form.email,
        otp
      });
      const token = res.data.token;
      if (token) await AsyncStorage.setItem('token', token);
      setMessage('Signup successful');
      animateMessage();
      navigation.replace('Home');
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
        <Text style={styles.title}>Signup</Text>

        {step === 1 ? (
          <>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="person" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="Name"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                value={form.name}
                onChangeText={text => setForm({...form, name:text})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="email" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                value={form.email}
                onChangeText={text => setForm({...form, email:text})}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                secureTextEntry
                value={form.password}
                onChangeText={text => setForm({...form, password:text})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialIcons name="phone" size={24} color="#4CAF50" style={styles.icon} />
              <TextInput
                placeholder="Phone"
                placeholderTextColor="#4CAF50"
                style={styles.input}
                value={form.phone_number}
                onChangeText={text => setForm({...form, phone_number:text})}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <FontAwesome5 name="leaf" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Signup</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.otpText}>Enter OTP sent to your email</Text>
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

            <TouchableOpacity style={styles.button} onPress={verifyOTP}>
              <FontAwesome5 name="check-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Verify OTP</Text>
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
  container: { flex:1, justifyContent:'center', padding:20 },
  title: { fontSize:32, fontWeight:'bold', color:'#4CAF50', textAlign:'center', marginBottom:40 },
  inputWrapper: { flexDirection:'row', alignItems:'center', marginVertical:10 },
  icon: { marginRight:10 },
  input: {
    flex:1,
    borderBottomWidth:2,
    borderBottomColor:'#4CAF50',
    paddingVertical:8,
    color:'#4CAF50',
    fontSize:16
  },
  button: {
    flexDirection:'row',
    backgroundColor:'#4CAF50',
    padding:15,
    borderRadius:25,
    marginVertical:10,
    justifyContent:'center',
    alignItems:'center',
    shadowColor:'#000',
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.3,
    shadowRadius:4,
    elevation:6,
  },
  buttonText: { color:'#fff', fontWeight:'bold', fontSize:18 },
  link: { color:'#33691E', textAlign:'center', marginTop:5, textDecorationLine:'underline' },
  otpText: { color:'#33691E', textAlign:'center', marginBottom:15, fontSize:16 },
  messageContainer: { marginTop:20, padding:10, borderRadius:10, backgroundColor:'rgba(76,175,80,0.2)' },
  message: { color:'#33691E', textAlign:'center', fontWeight:'bold' },
});
