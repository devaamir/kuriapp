import { TextStyle } from 'react-native';

// Simple font definitions for UI-only mode
const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Fonts.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    lineHeight: 28,
  },
  
  // Body text
  body1: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Fonts.regular,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  
  // Labels and captions
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Fonts.medium,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: Fonts.regular,
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Fonts.semiBold,
    lineHeight: 24,
  },
};
