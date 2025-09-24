import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScannerScreenProps } from '../../types/navigation';
import { analyzeImage } from '../../services/api';
import { saveScanToHistory } from '../../services/storage';
import { useSubscription } from '../../hooks/useSubscription';

export function ScannerScreen({ navigation }: ScannerScreenProps<'ScannerHome'>) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { canScan, incrementScanCount, remainingScans } = useSubscription();

  const handleCameraPress = async () => {
    if (!canScan()) {
      Alert.alert(
        'Scan Limit Reached',
        `You've used all your free scans for today. Upgrade to Premium for unlimited scans!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Profile', { screen: 'Subscription' }) }
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required to scan items.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      analyzeImageAndNavigate(result.assets[0].uri);
    }
  };

  const handleGalleryPress = async () => {
    if (!canScan()) {
      Alert.alert(
        'Scan Limit Reached',
        `You've used all your free scans for today. Upgrade to Premium for unlimited scans!`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Profile', { screen: 'Subscription' }) }
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Photo library permission is required to select images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      analyzeImageAndNavigate(result.assets[0].uri);
    }
  };

  const analyzeImageAndNavigate = async (uri: string) => {
    setIsAnalyzing(true);
    AccessibilityInfo.announceForAccessibility('Analyzing image...');

    try {
      const analysis = await analyzeImage(uri);
      await saveScanToHistory({
        imageUri: uri,
        analysis,
        timestamp: new Date().toISOString(),
      });
      incrementScanCount();

      navigation.navigate('ScanResult', {
        imageUri: uri,
        analysis,
      });
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodePress = () => {
    navigation.navigate('BarcodeScanner');
  };

  const handleHistoryPress = () => {
    navigation.navigate('History');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Scan Your Item
        </Text>
        <Text style={styles.subtitle}>
          Take a photo or select from gallery to identify recyclability
        </Text>
        {remainingScans !== null && remainingScans < Infinity && (
          <Text style={styles.scanCount}>
            {remainingScans} free scans remaining today
          </Text>
        )}
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.mainButton, styles.cameraButton]}
          onPress={handleCameraPress}
          disabled={isAnalyzing}
          accessibilityLabel="Take photo with camera"
          accessibilityHint="Opens camera to capture an image of the item"
        >
          <Ionicons name="camera" size={32} color="#fff" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainButton, styles.galleryButton]}
          onPress={handleGalleryPress}
          disabled={isAnalyzing}
          accessibilityLabel="Select from photo library"
          accessibilityHint="Opens photo library to select an image"
        >
          <Ionicons name="images" size={32} color="#fff" />
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBarcodePress}
            disabled={isAnalyzing}
            accessibilityLabel="Scan barcode"
            accessibilityHint="Opens barcode scanner"
          >
            <Ionicons name="barcode" size={24} color="#059669" />
            <Text style={styles.secondaryButtonText}>Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleHistoryPress}
            accessibilityLabel="View scan history"
            accessibilityHint="Shows your previous scans"
          >
            <Ionicons name="time" size={24} color="#059669" />
            <Text style={styles.secondaryButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
        <Text style={styles.tip}>• Ensure good lighting</Text>
        <Text style={styles.tip}>• Center the item in frame</Text>
        <Text style={styles.tip}>• Show labels if present</Text>
        <Text style={styles.tip}>• Avoid blurry photos</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scanCount: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonsContainer: {
    marginBottom: 32,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  cameraButton: {
    backgroundColor: '#059669',
  },
  galleryButton: {
    backgroundColor: '#0891b2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
});