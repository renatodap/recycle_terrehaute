import { supabase, Profile, ScanHistory, RecyclingLocation, Material, UserStats } from './supabase';

// Re-export types for other modules
export type { Profile, ScanHistory, RecyclingLocation, Material, UserStats };

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile functions
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

// Scan history functions
export const saveScan = async (scan: Omit<ScanHistory, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('scan_history')
    .insert([scan])
    .select()
    .single();

  if (!error) {
    // Update user stats
    await updateUserStatsAfterScan(scan.user_id, scan.recyclable);
  }

  return { data, error };
};

export const getUserScanHistory = async (userId: string): Promise<ScanHistory[]> => {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching scan history:', error);
    return [];
  }
  return data || [];
};

export const deleteScan = async (scanId: string) => {
  const { error } = await supabase
    .from('scan_history')
    .delete()
    .eq('id', scanId);

  return { error };
};

// User stats functions
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
  return data;
};

const updateUserStatsAfterScan = async (userId: string, recyclable: string) => {
  const stats = await getUserStats(userId);
  if (!stats) return;

  const updates: Partial<UserStats> = {
    total_scans: (stats.total_scans || 0) + 1,
    last_scan_date: new Date().toISOString(),
  };

  if (recyclable === 'Yes') {
    updates.items_recycled = (stats.items_recycled || 0) + 1;
  } else if (recyclable === 'No') {
    updates.items_not_recycled = (stats.items_not_recycled || 0) + 1;
  } else if (recyclable === 'Special') {
    updates.items_special = (stats.items_special || 0) + 1;
  }

  // Update streak
  const lastScan = stats.last_scan_date ? new Date(stats.last_scan_date) : null;
  const today = new Date();
  const daysDiff = lastScan ? Math.floor((today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (daysDiff === 1) {
    updates.streak_days = (stats.streak_days || 0) + 1;
  } else if (daysDiff > 1) {
    updates.streak_days = 1;
  }

  await supabase
    .from('user_stats')
    .update(updates)
    .eq('user_id', userId);
};

// Recycling locations functions
export const getRecyclingLocations = async (
  city?: string,
  state?: string,
  materialsAccepted?: string[]
): Promise<RecyclingLocation[]> => {
  let query = supabase.from('recycling_locations').select('*');

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  if (state) {
    query = query.eq('state', state);
  }
  if (materialsAccepted && materialsAccepted.length > 0) {
    query = query.contains('materials_accepted', materialsAccepted);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching recycling locations:', error);
    return [];
  }
  return data || [];
};

export const getNearbyLocations = async (
  latitude: number,
  longitude: number,
  radiusMiles: number = 10
): Promise<RecyclingLocation[]> => {
  // Using PostGIS ST_DWithin for proximity search
  const radiusMeters = radiusMiles * 1609.34;

  const { data, error } = await supabase.rpc('get_nearby_locations', {
    lat: latitude,
    lng: longitude,
    radius: radiusMeters
  });

  if (error) {
    console.error('Error fetching nearby locations:', error);
    return [];
  }
  return data || [];
};

// Materials functions
export const getMaterials = async (recyclable?: boolean): Promise<Material[]> => {
  let query = supabase.from('materials').select('*');

  if (recyclable !== undefined) {
    query = query.eq('recyclable', recyclable);
  }

  const { data, error } = await query.order('category').order('name');

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data || [];
};

export const getMaterialByName = async (name: string): Promise<Material | null> => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .ilike('name', `%${name}%`)
    .single();

  if (error) {
    console.error('Error fetching material:', error);
    return null;
  }
  return data;
};

// Upload image to Supabase Storage
export const uploadScanImage = async (imageUri: string, userId: string): Promise<string | null> => {
  try {
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create unique filename
    const filename = `${userId}/${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('scan-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('scan-images')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadScanImage:', error);
    return null;
  }
};

// Subscription functions
export const updateSubscription = async (userId: string, tier: 'free' | 'premium') => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

export const checkDailyScanLimit = async (userId: string): Promise<{ canScan: boolean; scansToday: number; limit: number }> => {
  const profile = await getProfile(userId);
  const isPremium = profile?.subscription_tier === 'premium';

  if (isPremium) {
    return { canScan: true, scansToday: 0, limit: Infinity };
  }

  // Check today's scan count for free users
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('scan_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  const scansToday = count || 0;
  const dailyLimit = 5; // Free users get 5 scans per day

  return {
    canScan: scansToday < dailyLimit,
    scansToday,
    limit: dailyLimit
  };
};