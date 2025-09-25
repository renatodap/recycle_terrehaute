// Quick test to verify Supabase connection
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fjzxjbmkdrpfiyudpvuj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqenhqYm1rZHJwZml5dWRwdnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Mzc3NDIsImV4cCI6MjA3NDMxMzc0Mn0.2YpuA6SS9MSLWo2ZAOjirNiVNaZ9Vwy9GIw4NJ5A0D4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test 1: Check materials table
    const { data: materials, error: materialsError } = await supabase
      .from('materials')
      .select('*')
      .limit(3);

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
    } else {
      console.log('✅ Materials fetched successfully:', materials?.length, 'items');
    }

    // Test 2: Check recycling locations
    const { data: locations, error: locationsError } = await supabase
      .from('recycling_locations')
      .select('*')
      .limit(3);

    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
    } else {
      console.log('✅ Locations fetched successfully:', locations?.length, 'items');
    }

    console.log('\nSupabase connection test complete!');
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();