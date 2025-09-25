import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationsScreenProps } from '../../types/navigation';
import { getRecyclingLocations, getNearbyLocations } from '../../services/supabaseDb';
import * as Location from 'expo-location';

interface RecycleLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distance?: number;
  materials_accepted: string[];
  hours?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  is_drop_off: boolean;
  is_curbside: boolean;
}

export function LocationsScreen({ navigation, route }: LocationsScreenProps<'LocationsList'>) {
  const [locations, setLocations] = useState<RecycleLocation[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<RecycleLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    loadLocations();
  }, [userLocation]);

  useEffect(() => {
    filterLocations();
  }, [searchQuery, locations]);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
    }
  };

  const loadLocations = async () => {
    try {
      // Try to get nearby locations if we have user location
      let data;
      if (userLocation) {
        data = await getNearbyLocations(
          userLocation.coords.latitude,
          userLocation.coords.longitude,
          25 // 25 miles radius
        );
      } else {
        // Fallback to Terre Haute locations
        data = await getRecyclingLocations('Terre Haute', 'IN');
      }

      // Calculate distances if we have user location
      if (userLocation && data) {
        const locationsWithDistance = data.map((loc: any) => ({
          ...loc,
          distance: calculateDistance(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            loc.latitude,
            loc.longitude
          )
        }));
        setLocations(locationsWithDistance);
        setFilteredLocations(locationsWithDistance);
      } else {
        setLocations(data || []);
        setFilteredLocations(data || []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      // Fallback to empty array
      setLocations([]);
      setFilteredLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const openMapsApp = (location: RecycleLocation) => {
    const address = encodeURIComponent(
      `${location.address}, ${location.city}, ${location.state} ${location.zip}`
    );

    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://maps.google.com/maps?q=${address}`,
    });

    Linking.openURL(url).catch((err) => {
      // Fallback to Google Maps web if native maps fail
      Linking.openURL(`https://maps.google.com/maps?q=${address}`);
    });
  };

  const filterLocations = () => {
    if (!searchQuery) {
      setFilteredLocations(locations);
      return;
    }

    const filtered = locations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.materials_accepted?.some((material) =>
          material.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        location.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLocations(filtered);
  };

  const renderLocationItem = ({ item }: { item: RecycleLocation }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() =>
        navigation.navigate('LocationDetail', { locationId: item.id })
      }
      accessibilityLabel={`${item.name}, ${item.address}`}
      accessibilityHint="Tap to view location details"
    >
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.locationAddress} numberOfLines={2}>
              {item.address}, {item.city}, {item.state} {item.zip}
            </Text>
          </View>
        </View>
        {item.distance && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>
              {item.distance.toFixed(1)} mi
            </Text>
          </View>
        )}
      </View>

      <View style={styles.materialsContainer}>
        <Text style={styles.materialsLabel}>Accepts:</Text>
        <Text style={styles.materialsList} numberOfLines={2}>
          {item.materials_accepted?.join(', ') || 'Various recyclables'}
        </Text>
      </View>

      <View style={styles.locationFooter}>
        <View style={styles.hoursContainer}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.hoursText}>{item.hours || 'Hours vary'}</Text>
        </View>
        <TouchableOpacity
          style={styles.directionsButton}
          onPress={() => openMapsApp(item)}
        >
          <Ionicons name="navigate" size={16} color="#059669" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6b7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by material or location name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search locations"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>


      {filteredLocations.length > 0 ? (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.id}
          renderItem={renderLocationItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No locations found</Text>
          <Text style={styles.emptyText}>
            Try searching for different materials
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  materialsContainer: {
    marginBottom: 12,
  },
  materialsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  materialsList: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hoursText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  directionsText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});