import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../../contexts/AuthContext';
import { TabNavigator } from './TabNavigator';
import { WelcomeScreen } from '../../app/auth/WelcomeScreen';
import { LoginScreen } from '../../app/auth/LoginScreen';
import { SignupScreen } from '../../app/auth/SignupScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

export function RootNavigator() {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // If user is authenticated or has chosen guest mode, show main app
  if (user || isGuest) {
    return <TabNavigator />;
  }

  // Otherwise show auth screens
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#059669',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: 'Create Account' }}
      />
    </Stack.Navigator>
  );
}