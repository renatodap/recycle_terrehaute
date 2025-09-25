-- RPC function to get nearby recycling locations
-- This function uses PostGIS to find locations within a given radius

CREATE OR REPLACE FUNCTION get_nearby_locations(
  lat DECIMAL,
  lng DECIMAL,
  radius DECIMAL DEFAULT 16093.4  -- Default 10 miles in meters
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  website TEXT,
  hours TEXT,
  materials_accepted TEXT[],
  special_instructions TEXT,
  is_drop_off BOOLEAN,
  is_curbside BOOLEAN,
  distance_meters DECIMAL,
  distance_miles DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rl.id,
    rl.name,
    rl.address,
    rl.city,
    rl.state,
    rl.zip,
    rl.latitude,
    rl.longitude,
    rl.phone,
    rl.website,
    rl.hours,
    rl.materials_accepted,
    rl.special_instructions,
    rl.is_drop_off,
    rl.is_curbside,
    ST_Distance(
      rl.location::geography,
      ST_MakePoint(lng, lat)::geography
    ) AS distance_meters,
    ST_Distance(
      rl.location::geography,
      ST_MakePoint(lng, lat)::geography
    ) * 0.000621371 AS distance_miles
  FROM recycling_locations rl
  WHERE ST_DWithin(
    rl.location::geography,
    ST_MakePoint(lng, lat)::geography,
    radius
  )
  ORDER BY distance_meters ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_locations TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_locations TO anon;

-- Alternative function without PostGIS (using basic distance calculation)
-- Use this if PostGIS is not available
CREATE OR REPLACE FUNCTION get_nearby_locations_simple(
  lat DECIMAL,
  lng DECIMAL,
  radius_miles DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  phone TEXT,
  website TEXT,
  hours TEXT,
  materials_accepted TEXT[],
  special_instructions TEXT,
  is_drop_off BOOLEAN,
  is_curbside BOOLEAN,
  distance_miles DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rl.id,
    rl.name,
    rl.address,
    rl.city,
    rl.state,
    rl.zip,
    rl.latitude,
    rl.longitude,
    rl.phone,
    rl.website,
    rl.hours,
    rl.materials_accepted,
    rl.special_instructions,
    rl.is_drop_off,
    rl.is_curbside,
    -- Haversine formula for distance calculation
    (
      3959 * acos(
        cos(radians(lat)) * cos(radians(rl.latitude)) *
        cos(radians(rl.longitude) - radians(lng)) +
        sin(radians(lat)) * sin(radians(rl.latitude))
      )
    ) AS distance_miles
  FROM recycling_locations rl
  WHERE (
    3959 * acos(
      cos(radians(lat)) * cos(radians(rl.latitude)) *
      cos(radians(rl.longitude) - radians(lng)) +
      sin(radians(lat)) * sin(radians(rl.latitude))
    )
  ) <= radius_miles
  ORDER BY distance_miles ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_locations_simple TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_locations_simple TO anon;

-- Function to get user's scan statistics
CREATE OR REPLACE FUNCTION get_user_scan_stats(user_uuid UUID)
RETURNS TABLE (
  total_scans BIGINT,
  recyclable_count BIGINT,
  not_recyclable_count BIGINT,
  special_disposal_count BIGINT,
  most_scanned_material TEXT,
  scan_streak INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_scans,
    COUNT(*) FILTER (WHERE recyclable = 'Yes')::BIGINT as recyclable_count,
    COUNT(*) FILTER (WHERE recyclable = 'No')::BIGINT as not_recyclable_count,
    COUNT(*) FILTER (WHERE recyclable = 'Special')::BIGINT as special_disposal_count,
    (
      SELECT unnest(materials)
      FROM scan_history
      WHERE user_id = user_uuid
      GROUP BY unnest(materials)
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as most_scanned_material,
    (
      SELECT streak_days FROM user_stats WHERE user_id = user_uuid
    ) as scan_streak
  FROM scan_history
  WHERE user_id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_scan_stats TO authenticated;