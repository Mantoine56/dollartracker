import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { Platform } from 'react-native';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  android: {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
};

const customColors = {
  primary: '#1E90FF',
  onPrimary: '#FFFFFF',
  primaryContainer: '#60AFFF',
  onPrimaryContainer: '#003258',
  secondary: '#0070CC',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E3F2FD',
  onSecondaryContainer: '#001D36',
  error: '#FF4444',
  onError: '#FFFFFF',
  errorContainer: '#FF7777',
  onErrorContainer: '#410002',
  background: '#FFFFFF',
  onBackground: '#1E1E1E',
  surface: '#FFFFFF',
  onSurface: '#1E1E1E',
  surfaceVariant: '#F8F9FA',
  onSurfaceVariant: '#666666',
  outline: '#CED4DA',
  outlineVariant: '#E9ECEF',
};

const baseFontConfig = Platform.select({
  web: fontConfig.web,
  ios: fontConfig.ios,
  android: fontConfig.android,
}) || fontConfig.ios;

export const theme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({
    config: {
      ...baseFontConfig,
    },
  }),
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};
