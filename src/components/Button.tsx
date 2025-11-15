import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const sizeStyles = {
    small: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      minHeight: 40,
    },
    medium: {
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.xl,
      minHeight: 48,
    },
    large: {
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xl * 1.5,
      minHeight: 56,
    },
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
      minHeight: sizeStyles[size].minHeight,
    };

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = Typography.button;

    const variantStyles = {
      primary: { color: Colors.white },
      secondary: { color: Colors.white },
      outline: { color: Colors.primary },
      ghost: { color: Colors.primary },
    };

    return { ...baseStyle, ...variantStyles[variant] };
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[getButtonStyle(), style]}
      >
        <View
          style={[styles.gradient, getButtonStyle()]}
        >
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: {
      backgroundColor: Colors.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[getButtonStyle(), variantStyles[variant], style]}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    backgroundColor: Colors.primary,
  },
});
