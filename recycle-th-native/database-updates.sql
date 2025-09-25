-- Database Updates for Enhanced App Features
-- Run these updates in your Supabase SQL editor

-- 1. Add business tier to subscription options
ALTER TABLE public.profiles
ALTER COLUMN subscription_tier
SET DEFAULT 'free'::text,
DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier = ANY (ARRAY['free'::text, 'premium'::text, 'business'::text]));

-- 2. Add settings storage for user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id uuid NOT NULL,
  notifications boolean DEFAULT true,
  location_tracking boolean DEFAULT true,
  dark_mode boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Add achievements tracking
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['scans'::text, 'streak'::text, 'materials'::text, 'impact'::text])),
  target_value integer NOT NULL,
  icon text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT achievements_pkey PRIMARY KEY (id)
);

-- 4. Track user achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL,
  unlocked_at timestamp with time zone DEFAULT now(),
  current_progress integer DEFAULT 0,
  CONSTRAINT user_achievements_pkey PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE
);

-- 5. Add material-specific scan tracking for achievements
ALTER TABLE public.user_stats
ADD COLUMN IF NOT EXISTS plastic_items_scanned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS paper_items_scanned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS glass_items_scanned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS metal_items_scanned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS organic_items_scanned integer DEFAULT 0;

-- 6. Add subscription tracking fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS daily_scan_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scan_reset_date date DEFAULT CURRENT_DATE;

-- 7. Create function to reset daily scan counts
CREATE OR REPLACE FUNCTION reset_daily_scan_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET daily_scan_count = 0,
      last_scan_reset_date = CURRENT_DATE
  WHERE last_scan_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to check scan limits
CREATE OR REPLACE FUNCTION check_scan_limit(p_user_id uuid)
RETURNS TABLE(can_scan boolean, scans_today integer, daily_limit integer) AS $$
DECLARE
  v_subscription_tier text;
  v_daily_scan_count integer;
  v_last_reset_date date;
BEGIN
  SELECT subscription_tier, daily_scan_count, last_scan_reset_date
  INTO v_subscription_tier, v_daily_scan_count, v_last_reset_date
  FROM public.profiles
  WHERE id = p_user_id;

  -- Reset count if it's a new day
  IF v_last_reset_date < CURRENT_DATE THEN
    UPDATE public.profiles
    SET daily_scan_count = 0,
        last_scan_reset_date = CURRENT_DATE
    WHERE id = p_user_id;
    v_daily_scan_count := 0;
  END IF;

  -- Check limits based on subscription
  IF v_subscription_tier IN ('premium', 'business') THEN
    RETURN QUERY SELECT true, v_daily_scan_count, 999999; -- Unlimited
  ELSE
    RETURN QUERY SELECT (v_daily_scan_count < 5), v_daily_scan_count, 5; -- Free tier limit
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Insert default achievements
INSERT INTO public.achievements (name, description, category, target_value, icon, color) VALUES
('First Scan', 'Complete your first scan', 'scans', 1, 'camera', '#059669'),
('Scanner Pro', 'Complete 10 scans', 'scans', 10, 'camera', '#059669'),
('Recycling Champion', 'Complete 50 scans', 'scans', 50, 'trophy', '#fbbf24'),
('Recycling Master', 'Complete 100 scans', 'scans', 100, 'shield', '#f59e0b'),
('Week Warrior', '7-day scanning streak', 'streak', 7, 'flame', '#ef4444'),
('Month Master', '30-day scanning streak', 'streak', 30, 'flame', '#ef4444'),
('Plastic Expert', 'Scan 20 plastic items', 'materials', 20, 'water', '#3b82f6'),
('Paper Protector', 'Scan 20 paper items', 'materials', 20, 'document-text', '#a78bfa'),
('Glass Guardian', 'Scan 20 glass items', 'materials', 20, 'wine', '#8b5cf6'),
('Metal Master', 'Scan 20 metal items', 'materials', 20, 'cube', '#6366f1'),
('Green Hero', 'Recycle 100 items correctly', 'impact', 100, 'earth', '#10b981'),
('Environmental Champion', 'Recycle 500 items correctly', 'impact', 500, 'leaf', '#059669')
ON CONFLICT (name) DO NOTHING;

-- 10. Create trigger to update user stats after scan
CREATE OR REPLACE FUNCTION update_scan_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily scan count
  UPDATE public.profiles
  SET daily_scan_count = daily_scan_count + 1
  WHERE id = NEW.user_id;

  -- Update material-specific counts based on scan
  IF NEW.materials && ARRAY['plastic'] THEN
    UPDATE public.user_stats
    SET plastic_items_scanned = plastic_items_scanned + 1
    WHERE user_id = NEW.user_id;
  END IF;

  IF NEW.materials && ARRAY['paper'] THEN
    UPDATE public.user_stats
    SET paper_items_scanned = paper_items_scanned + 1
    WHERE user_id = NEW.user_id;
  END IF;

  IF NEW.materials && ARRAY['glass'] THEN
    UPDATE public.user_stats
    SET glass_items_scanned = glass_items_scanned + 1
    WHERE user_id = NEW.user_id;
  END IF;

  IF NEW.materials && ARRAY['metal'] THEN
    UPDATE public.user_stats
    SET metal_items_scanned = metal_items_scanned + 1
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for scan statistics
DROP TRIGGER IF EXISTS trigger_update_scan_statistics ON public.scan_history;
CREATE TRIGGER trigger_update_scan_statistics
AFTER INSERT ON public.scan_history
FOR EACH ROW
EXECUTE FUNCTION update_scan_statistics();

-- 11. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scan_history_user_created ON public.scan_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_tier);

-- 12. Create RLS policies for new tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can view own achievement progress" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievement progress" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);