import { useState, useEffect } from 'react';
import { getSubscription, updateSubscription, SubscriptionData } from '../services/storage';

const DAILY_FREE_SCANS = 10;

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [remainingScans, setRemainingScans] = useState<number | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    const sub = await getSubscription();

    // Reset daily scans if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (sub.lastScanDate !== today) {
      sub.scansToday = 0;
      sub.lastScanDate = today;
      await updateSubscription(sub);
    }

    setSubscription(sub);

    if (sub.type === 'free') {
      setRemainingScans(DAILY_FREE_SCANS - sub.scansToday);
    } else {
      setRemainingScans(Infinity);
    }
  };

  const canScan = (): boolean => {
    if (!subscription) return false;
    if (subscription.type !== 'free') return true;
    return subscription.scansToday < DAILY_FREE_SCANS;
  };

  const incrementScanCount = async () => {
    if (!subscription) return;

    const updated = await updateSubscription({
      scansToday: subscription.scansToday + 1,
    });

    setSubscription(updated);

    if (updated.type === 'free') {
      setRemainingScans(DAILY_FREE_SCANS - updated.scansToday);
    }
  };

  const upgradeToPremium = async () => {
    const updated = await updateSubscription({
      type: 'premium',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
    setSubscription(updated);
    setRemainingScans(Infinity);
  };

  return {
    subscription,
    remainingScans,
    canScan,
    incrementScanCount,
    upgradeToPremium,
  };
}