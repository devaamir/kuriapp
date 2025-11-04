import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
      md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
      lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
    };

    return { ...baseStyle, ...sizeStyles[size] };
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
        <LinearGradient
          colors={Colors.gradientPrimary}
          style={[styles.gradient, getButtonStyle()]}
        >
          <Text style={getTextStyle()}>{title}</Text>
        </LinearGradient>
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
  },
});
