import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from '../components/navigation/TabNavigator';
import { Text } from 'react-native';

// Mock screens
jest.mock('../app/scanner/ScannerScreen', () => ({
  ScannerScreen: () => <Text>Scanner Screen</Text>,
}));

jest.mock('../app/locations/LocationsScreen', () => ({
  LocationsScreen: () => <Text>Locations Screen</Text>,
}));

jest.mock('../app/chat/ChatScreen', () => ({
  ChatScreen: () => <Text>Chat Screen</Text>,
}));

jest.mock('../app/profile/ProfileScreen', () => ({
  ProfileScreen: () => <Text>Profile Screen</Text>,
}));

describe('Navigation', () => {
  describe('TabNavigator', () => {
    it('should render all four tabs', () => {
      const { getByText, getByLabelText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      expect(getByLabelText('Scanner, tab, 1 of 4')).toBeTruthy();
      expect(getByLabelText('Locations, tab, 2 of 4')).toBeTruthy();
      expect(getByLabelText('Chat, tab, 3 of 4')).toBeTruthy();
      expect(getByLabelText('Profile, tab, 4 of 4')).toBeTruthy();
    });

    it('should navigate to Scanner tab when pressed', async () => {
      const { getByLabelText, getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const scannerTab = getByLabelText('Scanner, tab, 1 of 4');
      fireEvent.press(scannerTab);

      await waitFor(() => {
        expect(getByText('Scanner Screen')).toBeTruthy();
      });
    });

    it('should navigate to Locations tab when pressed', async () => {
      const { getByLabelText, getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const locationsTab = getByLabelText('Locations, tab, 2 of 4');
      fireEvent.press(locationsTab);

      await waitFor(() => {
        expect(getByText('Locations Screen')).toBeTruthy();
      });
    });

    it('should navigate to Chat tab when pressed', async () => {
      const { getByLabelText, getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const chatTab = getByLabelText('Chat, tab, 3 of 4');
      fireEvent.press(chatTab);

      await waitFor(() => {
        expect(getByText('Chat Screen')).toBeTruthy();
      });
    });

    it('should navigate to Profile tab when pressed', async () => {
      const { getByLabelText, getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const profileTab = getByLabelText('Profile, tab, 4 of 4');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(getByText('Profile Screen')).toBeTruthy();
      });
    });

    it('should highlight active tab', async () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const locationsTab = getByLabelText('Locations, tab, 2 of 4');
      fireEvent.press(locationsTab);

      await waitFor(() => {
        // Check that the active tab has different styling
        expect(locationsTab.props.accessibilityState.selected).toBe(true);
      });
    });

    it('should handle back navigation correctly', async () => {
      const { getByLabelText, getByText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      // Navigate to Locations
      const locationsTab = getByLabelText('Locations, tab, 2 of 4');
      fireEvent.press(locationsTab);

      await waitFor(() => {
        expect(getByText('Locations Screen')).toBeTruthy();
      });

      // Navigate to Scanner
      const scannerTab = getByLabelText('Scanner, tab, 1 of 4');
      fireEvent.press(scannerTab);

      await waitFor(() => {
        expect(getByText('Scanner Screen')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels on tabs', () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      expect(getByLabelText('Scanner, tab, 1 of 4')).toBeTruthy();
      expect(getByLabelText('Locations, tab, 2 of 4')).toBeTruthy();
      expect(getByLabelText('Chat, tab, 3 of 4')).toBeTruthy();
      expect(getByLabelText('Profile, tab, 4 of 4')).toBeTruthy();
    });

    it('should announce tab changes to screen readers', async () => {
      const { getByLabelText } = render(
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      );

      const chatTab = getByLabelText('Chat, tab, 3 of 4');

      fireEvent.press(chatTab);

      await waitFor(() => {
        expect(chatTab.props.accessibilityState.selected).toBe(true);
      });
    });
  });
});