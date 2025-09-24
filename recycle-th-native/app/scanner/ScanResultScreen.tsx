import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannerScreenProps } from '../../types/navigation';

export function ScanResultScreen({ route, navigation }: ScannerScreenProps<'ScanResult'>) {
  const { imageUri, analysis } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Item: ${analysis.item}\nRecyclable: ${analysis.recyclable}\nInstructions: ${analysis.instructions}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFindLocations = () => {
    navigation.navigate('Locations', {
      screen: 'LocationsList',
      params: { materials: analysis.materials },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      
      <View style={styles.resultCard}>
        <View style={styles.header}>
          <Text style={styles.itemName}>{analysis.item}</Text>
          <View style={[styles.badge, getBadgeStyle(analysis.recyclable)]}>
            <Text style={styles.badgeText}>
              {getRecyclableIcon(analysis.recyclable)} {analysis.recyclable}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>{analysis.instructions}</Text>
        </View>

        {analysis.materials && analysis.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materials</Text>
            <View style={styles.materialsContainer}>
              {analysis.materials.map((material, index) => (
                <View key={index} style={styles.materialChip}>
                  <Text style={styles.materialText}>{material}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${analysis.confidence * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(analysis.confidence * 100)}% confident
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleFindLocations}
          >
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Find Drop-off Locations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#059669" />
            <Text style={styles.secondaryButtonText}>Share Result</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function getBadgeStyle(recyclable: string) {
  switch (recyclable) {
    case 'Yes':
      return styles.recyclableBadge;
    case 'No':
      return styles.notRecyclableBadge;
    case 'Special':
      return styles.specialBadge;
    default:
      return styles.unknownBadge;
  }
}

function getRecyclableIcon(recyclable: string) {
  switch (recyclable) {
    case 'Yes':
      return '♻️';
    case 'No':
      return '🚫';
    case 'Special':
      return '⚠️';
    default:
      return '❓';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  resultCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recyclableBadge: {
    backgroundColor: '#d1fae5',
  },
  notRecyclableBadge: {
    backgroundColor: '#fee2e2',
  },
  specialBadge: {
    backgroundColor: '#fef3c7',
  },
  unknownBadge: {
    backgroundColor: '#f3f4f6',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  materialChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  materialText: {
    fontSize: 12,
    color: '#374151',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  confidenceText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actions: {
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#059669',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});