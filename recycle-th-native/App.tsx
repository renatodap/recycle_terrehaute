import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Ultra simple dummy screens - NO IMPORTS
function DummyScreen({ title }: { title: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Build 13 - Testing Navigation</Text>
    </View>
  );
}

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
          <Tab.Screen name="Scanner">
            {() => <DummyScreen title="Scanner" />}
          </Tab.Screen>
          <Tab.Screen name="Locations">
            {() => <DummyScreen title="Locations" />}
          </Tab.Screen>
          <Tab.Screen name="Chat">
            {() => <DummyScreen title="Chat" />}
          </Tab.Screen>
          <Tab.Screen name="Profile">
            {() => <DummyScreen title="Profile" />}
          </Tab.Screen>
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
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
});