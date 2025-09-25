import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { ProfileScreenProps } from '../../types/navigation';

export function PrivacyScreen({ navigation }: ProfileScreenProps<'Privacy'>) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: September 24, 2025</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          SnapCycle collects information to provide and improve our recycling assistance services. This includes:
        </Text>
        <Text style={styles.bullet}>• Camera data when you scan items for recycling analysis</Text>
        <Text style={styles.bullet}>• Location data to find nearby recycling centers</Text>
        <Text style={styles.bullet}>• Scan history to track your recycling habits</Text>
        <Text style={styles.bullet}>• Account information (email, name) for registered users</Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the collected information to:
        </Text>
        <Text style={styles.bullet}>• Analyze items and provide recycling instructions</Text>
        <Text style={styles.bullet}>• Find recycling centers near your location</Text>
        <Text style={styles.bullet}>• Send collection day reminders</Text>
        <Text style={styles.bullet}>• Track your environmental impact</Text>
        <Text style={styles.bullet}>• Improve our recycling detection algorithms</Text>

        <Text style={styles.heading}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely using industry-standard encryption. Scan history is stored locally on your device for guest users, and synced to our secure servers for registered users. We implement appropriate security measures to protect your personal information.
        </Text>

        <Text style={styles.heading}>4. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share aggregated, anonymized data for research purposes to improve recycling practices in Terre Haute.
        </Text>

        <Text style={styles.heading}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bullet}>• Access your personal data</Text>
        <Text style={styles.bullet}>• Request data deletion</Text>
        <Text style={styles.bullet}>• Opt-out of data collection</Text>
        <Text style={styles.bullet}>• Use the app in guest mode without creating an account</Text>

        <Text style={styles.heading}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is suitable for all ages. We do not knowingly collect personal information from children under 13 without parental consent.
        </Text>

        <Text style={styles.heading}>7. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last Updated" date.
        </Text>

        <Text style={styles.heading}>8. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this privacy policy, please contact us at:
        </Text>
        <Text style={styles.contact}>support@recycleterrehaute.com</Text>
        <Text style={styles.contact}>Terre Haute, Indiana</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginLeft: 16,
    marginBottom: 8,
  },
  contact: {
    fontSize: 16,
    color: '#059669',
    lineHeight: 24,
    marginLeft: 16,
  },
});
