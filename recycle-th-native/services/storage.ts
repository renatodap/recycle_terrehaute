import AsyncStorage from '@react-native-async-storage/async-storage';

const SCAN_HISTORY_KEY = '@scan_history';
const SUBSCRIPTION_KEY = '@subscription';
const SETTINGS_KEY = '@settings';

export interface ScanHistoryItem {
  id: string;
  imageUri?: string;
  barcode?: string;
  analysis: {
    item: string;
    recyclable: 'Yes' | 'No' | 'Special';
    instructions: string;
    confidence?: number;
    materials?: string[];
  };
  timestamp: string;
}

export async function saveScanToHistory(scan: Omit<ScanHistoryItem, 'id'>) {
  try {
    const history = await getScanHistory();
    const newScan: ScanHistoryItem = {
      ...scan,
      id: Date.now().toString(),
    };

    const updatedHistory = [newScan, ...history].slice(0, 100); // Keep last 100 scans
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updatedHistory));
    return newScan;
  } catch (error) {
    console.error('Error saving scan to history:', error);
    throw error;
  }
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const historyJson = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
}

export async function clearScanHistory() {
  try {
    await AsyncStorage.removeItem(SCAN_HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing scan history:', error);
  }
}

export interface SubscriptionData {
  type: 'free' | 'premium' | 'business';
  expiresAt?: string;
  scansToday: number;
  lastScanDate: string;
}

export async function getSubscription(): Promise<SubscriptionData> {
  try {
    const subJson = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (subJson) {
      return JSON.parse(subJson);
    }
    return {
      type: 'free',
      scansToday: 0,
      lastScanDate: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      type: 'free',
      scansToday: 0,
      lastScanDate: new Date().toISOString().split('T')[0],
    };
  }
}

export async function updateSubscription(data: Partial<SubscriptionData>) {
  try {
    const current = await getSubscription();
    const updated = { ...current, ...data };
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export interface Settings {
  notifications: boolean;
  locationTracking: boolean;
  darkMode: boolean;
  reminderTime?: string;
  zone?: string;
}

export async function getSettings(): Promise<Settings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return {
      notifications: true,
      locationTracking: true,
      darkMode: false,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      notifications: true,
      locationTracking: true,
      darkMode: false,
    };
  }
}

export async function updateSettings(settings: Partial<Settings>) {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}