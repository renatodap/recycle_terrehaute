import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileScreenProps } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserStats } from '../../services/supabaseDb';
import { useNavigation } from '@react-navigation/native';

export function ProfileScreen({ navigation }: ProfileScreenProps<'ProfileHome'>) {
  const { user, profile, isGuest, signOut } = useAuth();
  const rootNav = useNavigation<any>();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (user?.id) {
      const userStats = await getUserStats(user.id);
      setStats(userStats);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleSignIn = () => {
    rootNav.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const menuItems = [
    { title: 'Subscription', icon: 'diamond-outline', screen: 'Subscription' },
    { title: 'Achievements', icon: 'trophy-outline', screen: 'Achievements' },
    { title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    { title: 'About', icon: 'information-circle-outline', screen: 'About' },
    { title: 'Privacy Policy', icon: 'shield-checkmark-outline', screen: 'Privacy' },
    { title: 'Terms of Service', icon: 'document-text-outline', screen: 'Terms' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#059669" />
        </View>
        <Text style={styles.userName}>
          {isGuest ? 'Guest User' : (profile?.name || 'Recycling Champion')}
        </Text>
        <Text style={styles.userEmail}>
          {isGuest ? 'Not signed in' : (user?.email || 'user@example.com')}
        </Text>

        {isGuest && (
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
          >
            <Text style={styles.signInButtonText}>Sign In for Full Features</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.total_scans || 0}</Text>
          <Text style={styles.statLabel}>Items Scanned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.items_recycled || 0}</Text>
          <Text style={styles.statLabel}>Recycled</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats?.streak_days || 0}</Text>
          <Text style={styles.statLabel}>Streak Days</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen as any)}
          >
            <Ionicons name={item.icon as any} size={24} color="#374151" />
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {!isGuest && (
          <TouchableOpacity
            style={[styles.menuItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 2,
    paddingVertical: 20,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  menuContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 16,
  },
  signInButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#059669',
    borderRadius: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  signOutItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
  },
  signOutText: {
    color: '#ef4444',
  },
});