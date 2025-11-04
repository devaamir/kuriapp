import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing } from '../theme/spacing';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
  message: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
