import { MD3LightTheme, configureFonts, ThemeProvider } from 'react-native-paper';
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
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
    bold: {
      fontFamily: 'sans-serif',
      fontWeight: 'bold',
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
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#370B1E',
  error: '#FF4444',
  onError: '#FFFFFF',
  errorContainer: '#FF7777',
  onErrorContainer: '#410002',
  background: '#FFFFFF',
  onBackground: '#1C1B1F',
  surface: '#FFFFFF',
  onSurface: '#1C1B1F',
  surfaceVariant: '#F8F9FA',
  onSurfaceVariant: '#49454E',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#D0BCFF',
  elevation: {
    level0: 'transparent',
    level1: '#F7F2FA',
    level2: '#F3EDF7',
    level3: '#EFE9F4',
    level4: '#EEE8F3',
    level5: '#ECE6F1',
  },
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({
    config: Platform.select(fontConfig),
  }),
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};

export { ThemeProvider } from './ThemeProvider';
