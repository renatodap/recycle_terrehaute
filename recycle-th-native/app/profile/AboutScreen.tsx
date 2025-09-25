import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export function AboutScreen() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const features = [
    {
      icon: 'camera',
      title: 'Smart Scanning',
      description: 'AI-powered image recognition to identify recyclable items',
    },
    {
      icon: 'location',
      title: 'Location Finder',
      description: 'Find recycling centers and drop-off points near you',
    },
    {
      icon: 'chatbubbles',
      title: 'Chat Assistant',
      description: 'Get instant answers to your recycling questions',
    },
    {
      icon: 'trending-up',
      title: 'Track Progress',
      description: 'Monitor your recycling habits and environmental impact',
    },
    {
      icon: 'people',
      title: 'Community Driven',
      description: 'Join thousands making Terre Haute more sustainable',
    },
    {
      icon: 'leaf',
      title: 'Environmental Impact',
      description: 'See how your actions contribute to a greener future',
    },
  ];


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="refresh-circle" size={80} color="#059669" />
        </View>
        <Text style={styles.appName}>SnapCycle</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
        <Text style={styles.tagline}>Making recycling easier for everyone</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          We're committed to making Terre Haute a cleaner, greener city by empowering
          residents with the knowledge and tools they need to recycle correctly. Through
          technology and community engagement, we're reducing waste and protecting our
          environment for future generations.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon as any} size={24} color="#059669" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acknowledgments</Text>
        <Text style={styles.acknowledgeText}>
          This app was developed as part of a community initiative to promote sustainable
          living in Terre Haute. Special thanks to all our beta testers, contributors,
          and the environmental organizations that provided valuable feedback.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with 💚 in Terre Haute, Indiana</Text>
        <Text style={styles.copyright}>© 2024 Recycle Terre Haute. All rights reserved.</Text>
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
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#059669',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  missionText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  acknowledgeText: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  footer: {
    padding: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
