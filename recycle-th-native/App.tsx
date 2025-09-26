import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ScannerScreen } from './app/scanner/ScannerScreen';
import { LocationsScreen } from './app/locations/LocationsScreen';
import { ProfileScreen } from './app/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

// Temporary placeholder for Chat screen
function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat Screen</Text>
    </View>
  );
}

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
          <Tab.Screen name="Scanner" component={ScannerScreen} />
          <Tab.Screen name="Locations" component={LocationsScreen} />
          <Tab.Screen name="Chat" component={ChatScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="light" backgroundColor="#059669" />
    </SafeAreaProvider>
  );
}