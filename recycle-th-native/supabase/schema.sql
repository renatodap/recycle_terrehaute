-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  recyclable BOOLEAN DEFAULT false,
  special_handling BOOLEAN DEFAULT false,
  instructions TEXT NOT NULL,
  tips TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recycling_locations table
CREATE TABLE recycling_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  hours TEXT,
  materials_accepted TEXT[],
  special_instructions TEXT,
  is_drop_off BOOLEAN DEFAULT true,
  is_curbside BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scan_history table
CREATE TABLE scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  barcode TEXT,
  item_name TEXT NOT NULL,
  recyclable TEXT NOT NULL CHECK (recyclable IN ('Yes', 'No', 'Special')),
  instructions TEXT NOT NULL,
  materials TEXT[],
  confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_scans INTEGER DEFAULT 0,
  items_recycled INTEGER DEFAULT 0,
  items_not_recycled INTEGER DEFAULT 0,
  items_special INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_scan_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_scan_history_user_id ON scan_history(user_id);
CREATE INDEX idx_scan_history_created_at ON scan_history(created_at DESC);
CREATE INDEX idx_recycling_locations_location ON recycling_locations USING GIST(location);
CREATE INDEX idx_recycling_locations_city_state ON recycling_locations(city, state);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_recyclable ON materials(recyclable);

-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Scan history policies
CREATE POLICY "Users can view their own scan history" ON scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans" ON scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Public access for locations and materials
CREATE POLICY "Anyone can view recycling locations" ON recycling_locations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view materials" ON materials
  FOR SELECT USING (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recycling_locations_updated_at BEFORE UPDATE ON recycling_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample materials data
INSERT INTO materials (name, category, recyclable, special_handling, instructions, tips) VALUES
  ('Plastic Bottles', 'Plastic', true, false, 'Empty and rinse. Replace cap. Place in recycling bin.', 'Look for recycling numbers 1-7 on the bottom'),
  ('Glass Bottles', 'Glass', true, false, 'Empty and rinse. Remove lids. Place in recycling bin.', 'Separate by color if required in your area'),
  ('Aluminum Cans', 'Metal', true, false, 'Empty and rinse. Crush if desired. Place in recycling bin.', 'No need to remove labels'),
  ('Cardboard', 'Paper', true, false, 'Flatten boxes. Remove tape and staples. Keep dry.', 'Pizza boxes should be grease-free'),
  ('Batteries', 'Electronics', false, true, 'Take to special collection point. Never put in regular trash.', 'Many stores offer battery recycling programs'),
  ('Electronics', 'Electronics', false, true, 'Take to e-waste collection center. Do not put in regular recycling.', 'Check for manufacturer take-back programs'),
  ('Styrofoam', 'Plastic', false, true, 'Check local guidelines. Many areas do not accept styrofoam.', 'Consider reusing for packaging or crafts'),
  ('Plastic Bags', 'Plastic', false, true, 'Return to store collection bins. Do not put in curbside recycling.', 'Reuse bags when possible'),
  ('Paper', 'Paper', true, false, 'Place in recycling bin. Keep dry and clean.', 'Shredded paper may need special handling'),
  ('Food Waste', 'Organic', false, false, 'Compost if possible. Otherwise, place in regular trash.', 'Consider starting a home compost bin');

-- Insert sample Terre Haute recycling locations
INSERT INTO recycling_locations (
  name, address, city, state, zip,
  latitude, longitude,
  phone, website, hours,
  materials_accepted,
  is_drop_off, is_curbside,
  special_instructions
) VALUES
  ('Terre Haute Recycling Center', '3325 S 3rd St', 'Terre Haute', 'IN', '47802',
   39.4167, -87.4139,
   '(812) 232-2255', 'https://www.terrehaute.in.gov', 'Mon-Fri 8am-4pm, Sat 8am-12pm',
   ARRAY['Plastic', 'Glass', 'Metal', 'Paper', 'Cardboard'],
   true, false,
   'Free drop-off for residents. ID required.'),

  ('Republic Services', '2950 Maple Ave', 'Terre Haute', 'IN', '47804',
   39.5167, -87.3639,
   '(812) 234-5555', 'https://www.republicservices.com', 'Mon-Fri 6am-6pm',
   ARRAY['All recyclables'],
   false, true,
   'Curbside pickup available for residential customers'),

  ('Best Buy Electronics Recycling', '3401 S US Highway 41', 'Terre Haute', 'IN', '47802',
   39.4283, -87.4139,
   '(812) 234-2574', 'https://www.bestbuy.com/recycling', 'Mon-Sat 10am-9pm, Sun 11am-7pm',
   ARRAY['Electronics', 'Batteries', 'Cables'],
   true, false,
   'Free electronics recycling. Some restrictions apply.'),

  ('Vigo County Household Hazardous Waste', '3350 S US Highway 41', 'Terre Haute', 'IN', '47802',
   39.4250, -87.4139,
   '(812) 462-3226', NULL, 'First Saturday of each month, 8am-12pm',
   ARRAY['Paint', 'Chemicals', 'Batteries', 'Oil', 'Pesticides'],
   true, false,
   'Vigo County residents only. ID required.');