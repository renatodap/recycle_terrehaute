import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { saveScan as saveToSupabase, getUserScanHistory } from './supabaseDb';

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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Save to Supabase for authenticated users
      const { data, error } = await saveToSupabase({
        user_id: user.id,
        item_name: scan.analysis.item,
        recyclable: scan.analysis.recyclable,
        instructions: scan.analysis.instructions,
        materials: scan.analysis.materials,
        confidence: scan.analysis.confidence || 0.8,
        barcode: scan.barcode,
      });

      if (error) {
        console.error('Error saving to Supabase:', error);
        // Fall back to local storage
      } else if (data) {
        return {
          ...scan,
          id: data.id,
        };
      }
    }

    // Save locally for guest users or as fallback
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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Get from Supabase for authenticated users
      const supabaseHistory = await getUserScanHistory(user.id);

      if (supabaseHistory && supabaseHistory.length > 0) {
        return supabaseHistory.map(item => ({
          id: item.id,
          imageUri: item.image_url,
          barcode: item.barcode,
          analysis: {
            item: item.item_name,
            recyclable: item.recyclable,
            instructions: item.instructions,
            confidence: item.confidence,
            materials: item.materials,
          },
          timestamp: item.created_at,
        }));
      }
    }

    // Get from local storage for guest users
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
  reminderTime?: string;
  zone?: string;
  imageQuality?: 'low' | 'medium' | 'high';
  dataSaver?: boolean;
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
      imageQuality: 'medium',
      dataSaver: false,
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      notifications: true,
      locationTracking: true,
      imageQuality: 'medium',
      dataSaver: false,
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