import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScannerScreenProps } from '../../types/navigation';
import { getScanHistory, clearScanHistory } from '../../services/storage';

interface ScanHistoryItem {
  id: string;
  imageUri?: string;
  barcode?: string;
  analysis: {
    item: string;
    recyclable: string;
    instructions: string;
  };
  timestamp: string;
}

export function HistoryScreen({ navigation }: ScannerScreenProps<'History'>) {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const items = await getScanHistory();
      setHistory(items);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearScanHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => {
        navigation.navigate('ScanResult', {
          imageUri: item.imageUri || '',
          analysis: item.analysis,
        });
      }}
    >
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
      )}
      {item.barcode && !item.imageUri && (
        <View style={styles.barcodeIcon}>
          <Ionicons name="barcode" size={24} color="#059669" />
        </View>
      )}

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.analysis.item}
        </Text>
        <Text style={styles.itemDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
        <View style={styles.recyclableBadge}>
          <Text style={styles.recyclableText}>
            {item.analysis.recyclable === 'Yes' ? '♻️ Recyclable' :
             item.analysis.recyclable === 'No' ? '🗑️ Not Recyclable' :
             '⚠️ Special Disposal'}
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {history.length > 0 ? (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {history.length} scan{history.length !== 1 ? 's' : ''} in history
            </Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearButton}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Scan History</Text>
          <Text style={styles.emptyText}>
            Your scanned items will appear here
          </Text>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('ScannerHome')}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.scanButtonText}>Start Scanning</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerText: {
    fontSize: 16,
    color: '#6b7280',
  },
  clearButton: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  barcodeIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  recyclableBadge: {
    alignSelf: 'flex-start',
  },
  recyclableText: {
    fontSize: 12,
    color: '#059669',
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
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});