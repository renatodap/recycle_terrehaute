import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <Text>PrivacyScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
