import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase project credentials (hardcoded for production builds)
const SUPABASE_URL = 'https://fjzxjbmkdrpfiyudpvuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqenhqYm1rZHJwZml5dWRwdnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc3NDIsImV4cCI6MjA3NDMxMzc0Mn0.2YpuA6SS9MSLWo2ZAOjirNiVNaZ9Vwy9GIw4NJ5A0D4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  image_url?: string;
  barcode?: string;
  item_name: string;
  recyclable: 'Yes' | 'No' | 'Special';
  instructions: string;
  materials?: string[];
  confidence: number;
  created_at: string;
}

export interface RecyclingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  hours?: string;
  materials_accepted: string[];
  special_instructions?: string;
  is_drop_off: boolean;
  is_curbside: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  recyclable: boolean;
  special_handling: boolean;
  instructions: string;
  tips?: string;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  total_scans: number;
  items_recycled: number;
  items_not_recycled: number;
  items_special: number;
  streak_days: number;
  last_scan_date?: string;
  created_at: string;
  updated_at: string;
}