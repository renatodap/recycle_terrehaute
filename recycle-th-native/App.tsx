import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import simple screens that don't have crash-causing dependencies
import { SimpleScannerScreen } from './app/scanner/SimpleScannerScreen';
import { SimpleLocationsScreen } from './app/locations/SimpleLocationsScreen';
import { SimpleChatScreen } from './app/chat/SimpleChatScreen';
import { SimpleProfileScreen } from './app/profile/SimpleProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'home';

              if (route.name === 'Scanner') {
                iconName = focused ? 'camera' : 'camera-outline';
              } else if (route.name === 'Locations') {
                iconName = focused ? 'location' : 'location-outline';
              } else if (route.name === 'Chat') {
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#059669',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#059669',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen name="Scanner" component={SimpleScannerScreen} />
          <Tab.Screen name="Locations" component={SimpleLocationsScreen} />
          <Tab.Screen name="Chat" component={SimpleChatScreen} />
          <Tab.Screen name="Profile" component={SimpleProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" backgroundColor="#059669" />
    </SafeAreaProvider>
  );
}