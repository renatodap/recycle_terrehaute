import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function SubscriptionScreen() {
  return (
    <View style={styles.container}>
      <Text>SubscriptionScreen</Text>
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
