import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getScanHistory } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { getUserStats } from '../../services/supabaseDb';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unlocked: boolean;
  category: 'scans' | 'streak' | 'materials' | 'impact';
  color: string;
}

export function AchievementsScreen() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<any>({ total_scans: 0, streak_days: 0, items_recycled: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // Load user stats
      if (user?.id) {
        const userStats = await getUserStats(user.id);
        if (userStats) {
          setStats(userStats);
        }
      } else {
        // For guest users, use local scan history
        const history = await getScanHistory();
        setStats({
          total_scans: history.length,
          streak_days: 0,
          items_recycled: history.filter(h => h.analysis.recyclable === 'Yes').length,
        });
      }

      // Define achievements
      const achievementsList: Achievement[] = [
        {
          id: '1',
          title: 'First Scan',
          description: 'Complete your first scan',
          icon: 'camera',
          target: 1,
          current: stats.total_scans || 0,
          unlocked: (stats.total_scans || 0) >= 1,
          category: 'scans',
          color: '#059669',
        },
        {
          id: '2',
          title: 'Scanner Pro',
          description: 'Complete 10 scans',
          icon: 'camera',
          target: 10,
          current: stats.total_scans || 0,
          unlocked: (stats.total_scans || 0) >= 10,
          category: 'scans',
          color: '#059669',
        },
        {
          id: '3',
          title: 'Recycling Champion',
          description: 'Complete 50 scans',
          icon: 'trophy',
          target: 50,
          current: stats.total_scans || 0,
          unlocked: (stats.total_scans || 0) >= 50,
          category: 'scans',
          color: '#fbbf24',
        },
        {
          id: '4',
          title: 'Week Warrior',
          description: '7-day scanning streak',
          icon: 'flame',
          target: 7,
          current: stats.streak_days || 0,
          unlocked: (stats.streak_days || 0) >= 7,
          category: 'streak',
          color: '#ef4444',
        },
        {
          id: '5',
          title: 'Month Master',
          description: '30-day scanning streak',
          icon: 'flame',
          target: 30,
          current: stats.streak_days || 0,
          unlocked: (stats.streak_days || 0) >= 30,
          category: 'streak',
          color: '#ef4444',
        },
        {
          id: '6',
          title: 'Plastic Expert',
          description: 'Scan 20 plastic items',
          icon: 'water',
          target: 20,
          current: 0, // Would need to track material types
          unlocked: false,
          category: 'materials',
          color: '#3b82f6',
        },
        {
          id: '7',
          title: 'Paper Protector',
          description: 'Scan 20 paper items',
          icon: 'document-text',
          target: 20,
          current: 0,
          unlocked: false,
          category: 'materials',
          color: '#a78bfa',
        },
        {
          id: '8',
          title: 'Green Hero',
          description: 'Recycle 100 items correctly',
          icon: 'earth',
          target: 100,
          current: stats.items_recycled || 0,
          unlocked: (stats.items_recycled || 0) >= 100,
          category: 'impact',
          color: '#10b981',
        },
      ];

      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: 'apps' },
    { id: 'scans', name: 'Scans', icon: 'camera' },
    { id: 'streak', name: 'Streaks', icon: 'flame' },
    { id: 'materials', name: 'Materials', icon: 'cube' },
    { id: 'impact', name: 'Impact', icon: 'earth' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = (unlockedCount / totalCount) * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {unlockedCount} / {totalCount} Achievements Unlocked
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={category.icon as any}
              size={20}
              color={selectedCategory === category.id ? '#fff' : '#6b7280'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.achievementsList}>
        {filteredAchievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementCard,
              !achievement.unlocked && styles.achievementLocked,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: achievement.unlocked ? achievement.color + '20' : '#f3f4f6' },
              ]}
            >
              <Ionicons
                name={achievement.icon as any}
                size={32}
                color={achievement.unlocked ? achievement.color : '#9ca3af'}
              />
              {achievement.unlocked && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                </View>
              )}
            </View>

            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.lockedText,
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              <View style={styles.progressSection}>
                <Text style={styles.progressNumbers}>
                  {achievement.current} / {achievement.target}
                </Text>
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      {
                        width: `${Math.min((achievement.current / achievement.target) * 100, 100)}%`,
                        backgroundColor: achievement.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {!user && (
        <View style={styles.signUpPrompt}>
          <Ionicons name="information-circle" size={24} color="#059669" />
          <Text style={styles.signUpText}>
            Sign up to track your achievements across devices and unlock exclusive badges!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 4,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: '#059669',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  achievementsList: {
    padding: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  lockedText: {
    color: '#9ca3af',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressSection: {
    marginTop: 8,
  },
  progressNumbers: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  signUpPrompt: {
    flexDirection: 'row',
    backgroundColor: '#ecfdf5',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#047857',
  },
});