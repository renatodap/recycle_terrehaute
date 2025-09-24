import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function LocationDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>Location Detail Screen</Text>
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