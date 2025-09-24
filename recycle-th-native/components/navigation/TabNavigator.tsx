import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { RootTabParamList, ScannerStackParamList, LocationsStackParamList, ProfileStackParamList } from '../../types/navigation';

// Import screens
import { ScannerScreen } from '../../app/scanner/ScannerScreen';
import { ScanResultScreen } from '../../app/scanner/ScanResultScreen';
import { BarcodeScannerScreen } from '../../app/scanner/BarcodeScannerScreen';
import { HistoryScreen } from '../../app/scanner/HistoryScreen';

import { LocationsScreen } from '../../app/locations/LocationsScreen';
import { LocationDetailScreen } from '../../app/locations/LocationDetailScreen';
import { MapScreen } from '../../app/locations/MapScreen';
import { DirectionsScreen } from '../../app/locations/DirectionsScreen';

import { ChatScreen } from '../../app/chat/ChatScreen';

import { ProfileScreen } from '../../app/profile/ProfileScreen';
import { SettingsScreen } from '../../app/profile/SettingsScreen';
import { SubscriptionScreen } from '../../app/profile/SubscriptionScreen';
import { AchievementsScreen } from '../../app/profile/AchievementsScreen';
import { AboutScreen } from '../../app/profile/AboutScreen';
import { PrivacyScreen } from '../../app/profile/PrivacyScreen';
import { TermsScreen } from '../../app/profile/TermsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ScannerStack = createNativeStackNavigator<ScannerStackParamList>();
const LocationsStack = createNativeStackNavigator<LocationsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function ScannerStackNavigator() {
  return (
    <ScannerStack.Navigator
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
      <ScannerStack.Screen
        name="ScannerHome"
        component={ScannerScreen}
        options={{ title: 'Scanner' }}
      />
      <ScannerStack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{ title: 'Scan Result' }}
      />
      <ScannerStack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ title: 'Barcode Scanner' }}
      />
      <ScannerStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Scan History' }}
      />
    </ScannerStack.Navigator>
  );
}

function LocationsStackNavigator() {
  return (
    <LocationsStack.Navigator
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
      <LocationsStack.Screen
        name="LocationsList"
        component={LocationsScreen}
        options={{ title: 'Recycling Locations' }}
      />
      <LocationsStack.Screen
        name="LocationDetail"
        component={LocationDetailScreen}
        options={{ title: 'Location Details' }}
      />
      <LocationsStack.Screen
        name="Map"
        component={MapScreen}
        options={{ title: 'Map View' }}
      />
      <LocationsStack.Screen
        name="Directions"
        component={DirectionsScreen}
        options={{ title: 'Directions' }}
      />
    </LocationsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
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
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <ProfileStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
      <ProfileStack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ title: 'Achievements' }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About' }}
      />
      <ProfileStack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ title: 'Privacy Policy' }}
      />
      <ProfileStack.Screen
        name="Terms"
        component={TermsScreen}
        options={{ title: 'Terms of Service' }}
      />
    </ProfileStack.Navigator>
  );
}

export function TabNavigator() {
  return (
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
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        headerShown: false,
        tabBarAccessibilityLabel: `${route.name}, tab, ${getTabIndex(route.name)} of 4`,
      })}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerStackNavigator}
        options={{
          tabBarLabel: 'Scanner',
        }}
      />
      <Tab.Screen
        name="Locations"
        component={LocationsStackNavigator}
        options={{
          tabBarLabel: 'Locations',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#059669',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'Recycling Assistant',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function getTabIndex(routeName: string): number {
  switch (routeName) {
    case 'Scanner': return 1;
    case 'Locations': return 2;
    case 'Chat': return 3;
    case 'Profile': return 4;
    default: return 1;
  }
}