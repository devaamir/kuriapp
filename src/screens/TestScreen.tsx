import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  text: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    color: '#1a1a1a',
  },
});
