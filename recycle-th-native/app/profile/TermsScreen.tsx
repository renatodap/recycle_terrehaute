import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { ProfileScreenProps } from '../../types/navigation';

export function TermsScreen({ navigation }: ProfileScreenProps<'Terms'>) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.date}>Effective Date: September 24, 2025</Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By downloading, installing, or using SnapCycle ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.
        </Text>

        <Text style={styles.heading}>2. Use of the Service</Text>
        <Text style={styles.paragraph}>
          SnapCycle provides recycling information and guidance for residents of Terre Haute, Indiana. The App is intended for:
        </Text>
        <Text style={styles.bullet}>• Personal, non-commercial use</Text>
        <Text style={styles.bullet}>• Educational purposes about recycling</Text>
        <Text style={styles.bullet}>• Environmental awareness and improvement</Text>

        <Text style={styles.heading}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          You may use the App as a guest or create an account. If you create an account:
        </Text>
        <Text style={styles.bullet}>• You must provide accurate information</Text>
        <Text style={styles.bullet}>• You are responsible for maintaining account security</Text>
        <Text style={styles.bullet}>• You must notify us of any unauthorized access</Text>
        <Text style={styles.bullet}>• One account per person is permitted</Text>

        <Text style={styles.heading}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bullet}>• Use the App for illegal purposes</Text>
        <Text style={styles.bullet}>• Misrepresent recycling information</Text>
        <Text style={styles.bullet}>• Attempt to hack or disrupt the service</Text>
        <Text style={styles.bullet}>• Upload malicious content</Text>
        <Text style={styles.bullet}>• Violate any applicable laws or regulations</Text>

        <Text style={styles.heading}>5. Accuracy of Information</Text>
        <Text style={styles.paragraph}>
          While we strive to provide accurate recycling information, guidelines may change. Users should verify critical information with local authorities. The App's AI-based analysis is meant as guidance, not definitive classification.
        </Text>

        <Text style={styles.heading}>6. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          All content, features, and functionality of the App are owned by SnapCycle and are protected by copyright, trademark, and other intellectual property laws.
        </Text>

        <Text style={styles.heading}>7. Subscription Plans</Text>
        <Text style={styles.paragraph}>
          The App offers free and premium subscription plans:
        </Text>
        <Text style={styles.bullet}>• Free: Limited daily scans</Text>
        <Text style={styles.bullet}>• Premium: Unlimited scans, advanced features</Text>
        <Text style={styles.bullet}>• Business: For commercial entities</Text>
        <Text style={styles.paragraph}>
          Subscription fees are non-refundable except as required by law.
        </Text>

        <Text style={styles.heading}>8. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          The App is provided "as is" without warranties. We are not liable for any damages arising from your use of the App, including incorrect recycling guidance or missed collection days.
        </Text>

        <Text style={styles.heading}>9. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless SnapCycle from any claims arising from your use of the App or violation of these terms.
        </Text>

        <Text style={styles.heading}>10. Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to terminate or suspend your account for violations of these terms. You may delete your account at any time through the App settings.
        </Text>

        <Text style={styles.heading}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.
        </Text>

        <Text style={styles.heading}>12. Governing Law</Text>
        <Text style={styles.paragraph}>
          These terms are governed by the laws of Indiana, United States. Any disputes shall be resolved in the courts of Vigo County, Indiana.
        </Text>

        <Text style={styles.heading}>13. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these terms, contact us at:
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
