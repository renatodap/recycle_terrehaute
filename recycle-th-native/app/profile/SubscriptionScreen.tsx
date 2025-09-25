import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSubscription, updateSubscription, SubscriptionData } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

export function SubscriptionScreen() {
  const { isGuest } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planType: 'premium' | 'business') => {
    if (isGuest) {
      Alert.alert(
        'Account Required',
        'Please sign up for an account to upgrade your subscription.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Coming Soon',
      'Premium subscriptions will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  const plans = [
    {
      name: 'Free',
      price: '$0/month',
      current: subscription?.type === 'free',
      features: [
        '5 scans per day',
        'Basic recycling info',
        'Location finder',
        'Chat assistant',
      ],
      color: '#6b7280',
      icon: 'leaf-outline',
    },
    {
      name: 'Premium',
      price: '$2.99/month',
      current: subscription?.type === 'premium',
      features: [
        'Unlimited scans',
        'Advanced AI analysis',
        'Priority support',
        'No ads',
        'Offline mode',
      ],
      color: '#059669',
      icon: 'star-outline',
      action: () => handleUpgrade('premium'),
    },
    {
      name: 'Business',
      price: '$9.99/month',
      current: subscription?.type === 'business',
      features: [
        'Everything in Premium',
        'Multiple users',
        'Analytics dashboard',
        'API access',
        'Custom branding',
        'Dedicated support',
      ],
      color: '#7c3aed',
      icon: 'business-outline',
      action: () => handleUpgrade('business'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock powerful features to maximize your recycling impact
        </Text>
      </View>

      <View style={styles.currentPlan}>
        <Text style={styles.currentPlanLabel}>Current Plan</Text>
        <Text style={styles.currentPlanName}>
          {subscription?.type ? subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1) : 'Free'}
        </Text>
        <Text style={styles.scansToday}>
          Scans today: {subscription?.scansToday || 0} / {subscription?.type === 'free' ? 5 : 'Unlimited'}
        </Text>
      </View>

      {plans.map((plan) => (
        <View
          key={plan.name}
          style={[
            styles.planCard,
            plan.current && styles.currentPlanCard,
          ]}
        >
          <View style={styles.planHeader}>
            <Ionicons
              name={plan.icon as any}
              size={32}
              color={plan.color}
            />
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
            </View>
            {plan.current && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT</Text>
              </View>
            )}
          </View>

          <View style={styles.features}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={plan.color}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {!plan.current && plan.action && (
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: plan.color }]}
              onPress={plan.action}
            >
              <Text style={styles.upgradeButtonText}>
                {plan.name === 'Premium' ? 'Upgrade to Premium' : 'Contact Sales'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cancel anytime. No hidden fees.
        </Text>
        <Text style={styles.footerText}>
          Prices in USD. Taxes may apply.
        </Text>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  currentPlan: {
    backgroundColor: '#ecfdf5',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#059669',
  },
  currentPlanLabel: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  scansToday: {
    fontSize: 14,
    color: '#047857',
    marginTop: 8,
  },
  planCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  currentPlanCard: {
    borderWidth: 2,
    borderColor: '#059669',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginLeft: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  planPrice: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  features: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  upgradeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});
