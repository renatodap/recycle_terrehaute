import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootTabParamList = {
  Scanner: NavigatorScreenParams<ScannerStackParamList>;
  Locations: NavigatorScreenParams<LocationsStackParamList>;
  Chat: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type ScannerStackParamList = {
  ScannerHome: undefined;
  ScanResult: {
    imageUri: string;
    analysis: AnalysisResult;
  };
  BarcodeScanner: undefined;
  History: undefined;
};

export type LocationsStackParamList = {
  LocationsList: undefined;
  LocationDetail: {
    locationId: string;
  };
  Map: undefined;
  Directions: {
    locationId: string;
  };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  Subscription: undefined;
  Achievements: undefined;
  About: undefined;
  Privacy: undefined;
  Terms: undefined;
};

export type TabScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<
  RootTabParamList,
  T
>;

export type ScannerScreenProps<T extends keyof ScannerStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ScannerStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type LocationsScreenProps<T extends keyof LocationsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<LocationsStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export interface AnalysisResult {
  item: string;
  recyclable: 'Yes' | 'No' | 'Special';
  instructions: string;
  confidence: number;
  materials?: string[];
  localFacilities?: string[];
}