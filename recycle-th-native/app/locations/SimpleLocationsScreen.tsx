import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecyclingLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  hours?: string;
  materials_accepted: string[];
  is_drop_off: boolean;
  is_curbside: boolean;
}

// Mock data for recycling locations
const mockLocations: RecyclingLocation[] = [
  {
    id: '1',
    name: 'ISU Recycling Center',
    address: '855 Chestnut St',
    city: 'Terre Haute',
    state: 'IN',
    zip: '47809',
    phone: '(812) 237-3088',
    hours: '24/7 Drop-off Available',
    materials_accepted: ['Paper', 'Cardboard', 'Plastic', 'Glass', 'Aluminum'],
    is_drop_off: true,
    is_curbside: false,
  },
  {
    id: '2',
    name: 'Vigo County Solid Waste Management',
    address: '3424 S US Highway 41',
    city: 'Terre Haute',
    state: 'IN',
    zip: '47802',
    phone: '(812) 462-3370',
    hours: 'Mon-Fri: 8AM-4PM, Sat: 8AM-12PM',
    materials_accepted: ['Electronics', 'Hazardous Waste', 'Batteries', 'Motor Oil'],
    is_drop_off: true,
    is_curbside: false,
  },
  {
    id: '3',
    name: 'Goodwill Store & Donation Center',
    address: '2745 S 3rd St',
    city: 'Terre Haute',
    state: 'IN',
    zip: '47802',
    phone: '(812) 238-0056',
    hours: 'Mon-Sat: 9AM-8PM, Sun: 11AM-6PM',
    materials_accepted: ['Clothing', 'Textiles', 'Small Electronics', 'Books'],
    is_drop_off: true,
    is_curbside: false,
  },
  {
    id: '4',
    name: 'Ray Recycling',
    address: '825 Poplar St',
    city: 'Terre Haute',
    state: 'IN',
    zip: '47807',
    phone: '(812) 234-0111',
    hours: 'Mon-Fri: 7:30AM-4PM',
    materials_accepted: ['Scrap Metal', 'Aluminum Cans', 'Copper', 'Brass'],
    is_drop_off: true,
    is_curbside: false,
  },
  {
    id: '5',
    name: 'Best Buy',
    address: '3401 S US Highway 41',
    city: 'Terre Haute',
    state: 'IN',
    zip: '47802',
    phone: '(812) 298-9022',
    hours: 'Mon-Sat: 10AM-8PM, Sun: 11AM-7PM',
    materials_accepted: ['Electronics', 'Computers', 'TVs', 'Cell Phones'],
    is_drop_off: true,
    is_curbside: false,
  },
];

export function SimpleLocationsScreen() {
  const [locations, setLocations] = useState<RecyclingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const materials = [
    'Paper',
    'Cardboard',
    'Plastic',
    'Glass',
    'Aluminum',
    'Electronics',
    'Batteries',
    'Clothing',
    'Scrap Metal',
  ];

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLocations(mockLocations);
      setLoading(false);
    }, 500);
  }, []);

  const filteredLocations = locations.filter(location => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchText.toLowerCase()) ||
      location.address.toLowerCase().includes(searchText.toLowerCase()) ||
      location.city.toLowerCase().includes(searchText.toLowerCase());

    const matchesMaterials =
      selectedMaterials.length === 0 ||
      selectedMaterials.some(material =>
        location.materials_accepted.includes(material)
      );

    return matchesSearch && matchesMaterials;
  });

  const toggleMaterial = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;

    if (Platform.OS === 'web') {
      window.location.href = `tel:${phone}`;
    } else {
      Alert.alert('Call', `Call ${phone}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Calling ${phone}`) }
      ]);
    }
  };

  const handleDirections = (location: RecyclingLocation) => {
    const address = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://maps.google.com/?q=${encodedAddress}`;

    if (Platform.OS === 'web') {
      window.open(mapsUrl, '_blank');
    } else {
      Alert.alert('Directions', `Get directions to ${location.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => console.log(`Opening maps for ${address}`) }
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#6b7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search locations..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filter by Material:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.materialTagsContainer}
        >
          {materials.map(material => (
            <TouchableOpacity
              key={material}
              style={[
                styles.materialTag,
                selectedMaterials.includes(material) && styles.materialTagActive
              ]}
              onPress={() => toggleMaterial(material)}
            >
              <Text
                style={[
                  styles.materialTagText,
                  selectedMaterials.includes(material) && styles.materialTagTextActive
                ]}
              >
                {material}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.locationsContainer}>
        {filteredLocations.length === 0 ? (
          <Text style={styles.noResultsText}>No locations found</Text>
        ) : (
          filteredLocations.map(location => (
            <View key={location.id} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationName}>{location.name}</Text>
                <View style={styles.typeContainer}>
                  {location.is_drop_off && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>Drop-off</Text>
                    </View>
                  )}
                  {location.is_curbside && (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>Curbside</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.locationAddress}>
                {location.address}, {location.city}, {location.state} {location.zip}
              </Text>

              {location.hours && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{location.hours}</Text>
                </View>
              )}

              {location.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text style={styles.infoText}>{location.phone}</Text>
                </View>
              )}

              <View style={styles.materialsContainer}>
                <Text style={styles.materialsLabel}>Accepts:</Text>
                <View style={styles.materialsList}>
                  {location.materials_accepted.map((material, index) => (
                    <Text key={index} style={styles.materialItem}>
                      {material}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCall(location.phone)}
                  disabled={!location.phone}
                >
                  <Ionicons name="call" size={20} color={location.phone ? "#059669" : "#d1d5db"} />
                  <Text style={[styles.actionButtonText, !location.phone && styles.disabledText]}>
                    Call
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDirections(location)}
                >
                  <Ionicons name="navigate" size={20} color="#059669" />
                  <Text style={styles.actionButtonText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  materialTagsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  materialTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  materialTagActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  materialTagText: {
    fontSize: 13,
    color: '#374151',
  },
  materialTagTextActive: {
    color: '#fff',
  },
  locationsContainer: {
    paddingHorizontal: 16,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 32,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
  },
  materialsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  materialsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  materialsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialItem: {
    fontSize: 13,
    color: '#374151',
    marginRight: 12,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    marginLeft: 6,
    color: '#059669',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledText: {
    color: '#d1d5db',
  },
});