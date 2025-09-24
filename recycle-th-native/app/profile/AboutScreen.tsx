import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text>AboutScreen</Text>
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
