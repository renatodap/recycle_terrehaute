import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// Placeholder screens - no external dependencies
function ScannerScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons name="camera" size={48} color="#059669" />
      <Text style={styles.title}>Scanner</Text>
      <Text style={styles.subtitle}>Scan recyclable items</Text>
    </View>
  );
}

function LocationsScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons name="location" size={48} color="#059669" />
      <Text style={styles.title}>Locations</Text>
      <Text style={styles.subtitle}>Find recycling centers</Text>
    </View>
  );
}

function ChatScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons name="chatbubbles" size={48} color="#059669" />
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Recycling assistant</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Ionicons name="person" size={48} color="#059669" />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your account</Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});