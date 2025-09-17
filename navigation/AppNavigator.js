import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all screens used in the navigator
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketHomeScreen from '../screens/MarketHomeScreen';
import WeatherDashboard from '../screens/WeatherDashboard';
import SoilDashboard from '../screens/SoilDashboard';
// You'll need to create the screens for these:
// import AnalyticsScreen from '../screens/AnalyticsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
import MarketPriceFetcher from '../screens/MarketPriceFetcher';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setInitialRoute('Home'); // If token exists, navigate to the Home screen
        } else {
          setInitialRoute('Home'); // Otherwise, send the user to the Login screen
        }
      } catch (error) {
        console.error('Error reading token:', error);
        setInitialRoute('Login'); // Fallback to Login in case of an error
      }
    };

    checkToken();
  }, []);

  // Return a null component while the initial route is being determined
  if (initialRoute === null) {
    return null; 
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      
      {/* Main App Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Market" component={MarketHomeScreen} />
      
      {/* Feature Screens */}
      <Stack.Screen name="WeatherDashboard" component={WeatherDashboard} />
      <Stack.Screen name="SoilDashboard" component={SoilDashboard} />
      <Stack.Screen name='CropPrices' component={MarketPriceFetcher}/>
      {/* Placeholder for future screens */}
      {/* <Stack.Screen name="Analytics" component={AnalyticsScreen} /> */}
      {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
    </Stack.Navigator>
  );
}