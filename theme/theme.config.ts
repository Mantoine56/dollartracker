import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { Platform, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

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

const fonts = configureFonts({
  config: fontConfig,
});

// Custom colors that work well in both light and dark modes
const customColors = {
  primary: '#2196F3', // Main blue
  primaryContainer: '#E3F2FD', // Light blue background
  onPrimaryContainer: '#1976D2', // Darker blue for text on light blue
  secondary: '#42A5F5', // Lighter blue
  secondaryContainer: '#BBDEFB', // Very light blue background
  onSecondaryContainer: '#1565C0', // Darker blue for text on very light blue
  tertiary: '#64B5F6', // Even lighter blue
  tertiaryContainer: '#E1F5FE', // Extremely light blue background
  onTertiaryContainer: '#0D47A1', // Very dark blue for text on extremely light blue
  error: '#B00020',
  errorContainer: '#FDEAEA',
  onErrorContainer: '#8E001A',
  success: '#4CAF50',
  successContainer: '#E8F5E9',
  onSuccessContainer: '#2E7D32',
  warning: '#FB8C00',
  warningContainer: '#FFF3E0',
  onWarningContainer: '#E65100',
  info: '#2196F3',
  infoContainer: '#E3F2FD',
  onInfoContainer: '#1565C0',
};

// Light theme with custom colors
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
    background: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceVariant: '#EEEEEE',
    onSurface: '#000000',
    onSurfaceVariant: '#424242',
    outline: '#BDBDBD',
    surfaceDisabled: '#F5F5F5',
    onSurfaceDisabled: '#9E9E9E',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    elevation: {
      level0: 'transparent',
      level1: '#F5F5F5',
      level2: '#EEEEEE',
      level3: '#E0E0E0',
      level4: '#BDBDBD',
      level5: '#9E9E9E',
    },
  },
};

// Dark theme with custom colors
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    ...customColors,
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#EEEEEE',
    outline: '#424242',
    surfaceDisabled: '#1E1E1E',
    onSurfaceDisabled: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.8)',
    // Dark mode specific overrides
    primaryContainer: '#1E1E1E', // Dark surface for containers
    secondaryContainer: '#2C2C2C', // Slightly lighter for nested containers
    tertiaryContainer: '#383838', // Even lighter for elevated containers
    onPrimaryContainer: '#90CAF9', // Light blue for text on dark
    onSecondaryContainer: '#BBDEFB', // Lighter blue for secondary text
    onTertiaryContainer: '#E3F2FD', // Very light blue for tertiary text
    elevation: {
      level0: '#121212',
      level1: '#1E1E1E',
      level2: '#2C2C2C',
      level3: '#383838',
      level4: '#404040',
      level5: '#484848',
    },
    // Specific surface variants for cards and inputs
    surfaceCard: '#2C2C2C',
    surfaceInput: '#383838',
    onSurfaceCard: '#FFFFFF',
    onSurfaceInput: '#EEEEEE',
  },
};

// Navigation theme that matches our Paper theme
export const navigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: customColors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.onSurface,
    border: lightTheme.colors.outline,
    notification: customColors.error,
  },
};

export const navigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: customColors.primary,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    text: darkTheme.colors.onSurface,
    border: darkTheme.colors.outline,
    notification: customColors.error,
  },
};

// Hook to get the current theme based on settings and system preference
export function useAppTheme(themePreference: 'system' | 'light' | 'dark'): {
  paperTheme: MD3Theme;
  navigationTheme: typeof DefaultTheme;
} {
  const colorScheme = useColorScheme();
  const isDark = themePreference === 'system' 
    ? colorScheme === 'dark'
    : themePreference === 'dark';

  return {
    paperTheme: isDark ? darkTheme : lightTheme,
    navigationTheme: isDark ? navigationDarkTheme : navigationLightTheme,
  };
}
