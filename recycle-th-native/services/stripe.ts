import { Alert } from 'react-native';
import { supabase } from './supabase';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

// Price IDs from your Stripe Dashboard
const PRICE_IDS = {
  premium: 'price_premium_monthly', // Replace with your actual price ID
  business: 'price_business_monthly', // Replace with your actual price ID
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  features: string[];
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'premium',
    name: 'Premium',
    price: '$2.99/month',
    priceId: PRICE_IDS.premium,
    features: [
      'Unlimited scans',
      'Advanced AI analysis',
      'Priority support',
      'Export scan history',
      'No ads',
      'Offline mode',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$9.99/month',
    priceId: PRICE_IDS.business,
    features: [
      'Everything in Premium',
      'Multiple users',
      'Analytics dashboard',
      'API access',
      'Custom branding',
      'Dedicated support',
    ],
  },
];

/**
 * Initialize Stripe checkout session
 */
export const createCheckoutSession = async (
  planId: 'premium' | 'business',
  userId: string,
  email: string
): Promise<{ sessionUrl?: string; error?: string }> => {
  try {
    // Call Supabase Edge Function to create Stripe checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId: PRICE_IDS[planId],
        userId,
        email,
      },
    });

    if (error) throw error;

    return { sessionUrl: data.sessionUrl };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { error: 'Failed to create checkout session' };
  }
};

/**
 * Check subscription status
 */
export const checkSubscriptionStatus = async (
  userId: string
): Promise<{ tier: 'free' | 'premium' | 'business'; status: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, stripe_subscription_status')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      tier: data?.subscription_tier || 'free',
      status: data?.stripe_subscription_status,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { tier: 'free', status: null };
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId },
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
};

/**
 * Restore purchases (for app store purchases)
 */
export const restorePurchases = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // This would integrate with RevenueCat or app store APIs
    // For now, we check Stripe subscription status
    const { data, error } = await supabase.functions.invoke('restore-purchases', {
      body: { userId },
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return { success: false, error: 'Failed to restore purchases' };
  }
};

/**
 * Get customer portal URL for managing subscriptions
 */
export const getCustomerPortalUrl = async (userId: string): Promise<{ url?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId },
    });

    if (error) throw error;

    return { url: data.url };
  } catch (error) {
    console.error('Error getting customer portal:', error);
    return { error: 'Failed to get customer portal' };
  }
};

/**
 * Handle subscription success
 */
export const handleSubscriptionSuccess = async (userId: string, tier: 'premium' | 'business') => {
  try {
    // Update local state
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_start_date: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    Alert.alert('Success!', `You've been upgraded to ${tier} plan!`, [{ text: 'OK' }]);
  } catch (error) {
    console.error('Error handling subscription success:', error);
    Alert.alert('Error', 'Failed to update subscription status', [{ text: 'OK' }]);
  }
};

/**
 * Validate subscription for feature access
 */
export const hasFeatureAccess = async (
  userId: string,
  feature: 'unlimited_scans' | 'export' | 'offline' | 'analytics' | 'api'
): Promise<boolean> => {
  const { tier } = await checkSubscriptionStatus(userId);

  const featureMatrix = {
    unlimited_scans: ['premium', 'business'],
    export: ['premium', 'business'],
    offline: ['premium', 'business'],
    analytics: ['business'],
    api: ['business'],
  };

  return featureMatrix[feature].includes(tier);
};

/**
 * Get subscription benefits for current user
 */
export const getSubscriptionBenefits = async (userId: string): Promise<{
  scanLimit: number;
  hasAds: boolean;
  hasOffline: boolean;
  hasExport: boolean;
  hasAnalytics: boolean;
  hasAPI: boolean;
  hasPriority: boolean;
}> => {
  const { tier } = await checkSubscriptionStatus(userId);

  switch (tier) {
    case 'business':
      return {
        scanLimit: -1, // Unlimited
        hasAds: false,
        hasOffline: true,
        hasExport: true,
        hasAnalytics: true,
        hasAPI: true,
        hasPriority: true,
      };
    case 'premium':
      return {
        scanLimit: -1, // Unlimited
        hasAds: false,
        hasOffline: true,
        hasExport: true,
        hasAnalytics: false,
        hasAPI: false,
        hasPriority: true,
      };
    default:
      return {
        scanLimit: 5,
        hasAds: true,
        hasOffline: false,
        hasExport: false,
        hasAnalytics: false,
        hasAPI: false,
        hasPriority: false,
      };
  }
};