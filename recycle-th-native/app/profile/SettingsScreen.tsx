import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSettings, updateSettings, Settings } from '../../services/storage';
import { clearScanHistory } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

export function SettingsScreen() {
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    locationTracking: true,
    imageQuality: 'medium',
    dataSaver: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof Settings, value: boolean) => {
    // Handle permission requests for specific settings
    if (key === 'notifications' && value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (key === 'locationTracking' && value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable location access in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings({ [key]: value });
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Scan History',
      'Are you sure you want to delete all your scan history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearScanHistory();
            Alert.alert('Success', 'Scan history has been cleared.');
          },
        },
      ]
    );
  };


  const settingsSections = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          description: 'Get reminders for collection days',
          value: settings.notifications,
          onToggle: (value: boolean) => handleToggle('notifications', value),
          icon: 'notifications-outline',
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          label: 'Location Tracking',
          description: 'Find nearby recycling centers',
          value: settings.locationTracking,
          onToggle: (value: boolean) => handleToggle('locationTracking', value),
          icon: 'location-outline',
        },
      ],
    },
    {
      title: 'Performance',
      items: [
        {
          label: 'Data Saver Mode',
          description: 'Reduce image quality for faster uploads',
          value: settings.dataSaver || false,
          onToggle: (value: boolean) => handleToggle('dataSaver', value),
          icon: 'cellular-outline',
        },
      ],
    },
  ];

  const actionButtons = [
    {
      title: 'Clear Scan History',
      icon: 'trash-outline',
      color: '#ef4444',
      onPress: handleClearHistory,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {settingsSections.map((section) => (
        <View key={section.title}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.settingItem,
                  index < section.items.length - 1 && styles.settingItemBorder,
                ]}
              >
                <View style={styles.settingInfo}>
                  <View style={styles.settingHeader}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="#059669"
                      style={styles.settingIcon}
                    />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#d1d5db', true: '#86efac' }}
                  thumbColor={item.value ? '#059669' : '#f3f4f6'}
                />
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.sectionContent}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                index < actionButtons.length - 1 && styles.actionButtonBorder,
              ]}
              onPress={button.onPress}
            >
              <Ionicons
                name={button.icon as any}
                size={24}
                color={button.color}
              />
              <Text style={[styles.actionButtonText, { color: button.color }]}>
                {button.title}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.accountInfo}>
        <Text style={styles.accountLabel}>Account Status</Text>
        <Text style={styles.accountValue}>
          {isGuest ? 'Guest User' : user?.email}
        </Text>
        {isGuest && (
          <Text style={styles.accountNote}>
            Sign up to sync settings across devices
          </Text>
        )}
      </View>

      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.versionSubtext}>SnapCycle</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 36,
  },
  actionsSection: {
    marginTop: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionButtonBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  accountInfo: {
    backgroundColor: '#fff',
    marginTop: 32,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  accountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  accountNote: {
    fontSize: 12,
    color: '#059669',
    marginTop: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginVertical: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});