import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Platform } from 'react-native';

// Font configuration
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
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
};

// Custom colors based on UI guidelines
const colors = {
  primary: {
    main: '#1E90FF',
    light: '#60AFFF',
    dark: '#0070CC',
    contrast: '#FFFFFF',
  },
  success: {
    main: '#32CD32',
    light: '#66E066',
    dark: '#269926',
    contrast: '#FFFFFF',
  },
  warning: {
    main: '#FFA500',
    light: '#FFB733',
    dark: '#CC8400',
    contrast: '#000000',
  },
  error: {
    main: '#FF4444',
    light: '#FF7777',
    dark: '#CC1111',
    contrast: '#FFFFFF',
  },
  grey: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  text: {
    primary: '#1E1E1E',
    secondary: '#666666',
    muted: '#999999',
  },
  background: '#F8F9FA',
  surface: '#FFFFFF',
  navigationBar: {
    background: '#FFFFFF',
    active: '#1E90FF',
    inactive: '#666666',
  },
};

const darkColors = {
  ...colors,
  primary: {
    ...colors.primary,
    main: '#58A6FF',
    light: '#85C2FF',
    dark: '#2B8AFF',
  },
  background: '#1E1E1E',
  surface: '#2D2D2D',
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    muted: '#808080',
  },
  grey: {
    50: '#212529',
    100: '#343A40',
    200: '#495057',
    300: '#868E96',
    400: '#ADB5BD',
    500: '#CED4DA',
    600: '#DEE2E6',
    700: '#E9ECEF',
    800: '#F1F3F5',
    900: '#F8F9FA',
  }
};

// Spacing scale
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadows for iOS and Android
const shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  },
  android: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
  },
});

// Animation durations
const animation = {
  scale: 1.0,
  durations: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Typography scale based on UI guidelines
const typography = {
  displayLarge: { fontSize: 32, lineHeight: 40 },
  displayMedium: { fontSize: 28, lineHeight: 36 },
  displaySmall: { fontSize: 24, lineHeight: 32 },
  headlineLarge: { fontSize: 24, lineHeight: 32 },
  headlineMedium: { fontSize: 20, lineHeight: 28 },
  headlineSmall: { fontSize: 18, lineHeight: 26 },
  titleLarge: { fontSize: 18, lineHeight: 26 },
  titleMedium: { fontSize: 16, lineHeight: 24 },
  titleSmall: { fontSize: 14, lineHeight: 22 },
  bodyLarge: { fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontSize: 14, lineHeight: 22 },
  bodySmall: { fontSize: 12, lineHeight: 20 },
  labelLarge: { fontSize: 14, lineHeight: 22 },
  labelMedium: { fontSize: 12, lineHeight: 20 },
  labelSmall: { fontSize: 10, lineHeight: 18 },
};

// Border radius scale
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Base theme configuration
const baseTheme = {
  fonts: configureFonts({config: fontConfig}),
  animation: {
    scale: 1.0,
  },
  spacing,
  shadows,
  typography,
  borderRadius,
  roundness: 12,
};

// Create the light theme
export const lightTheme = {
  ...MD3LightTheme,
  ...baseTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  dark: false,
};

// Create the dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  ...baseTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  dark: true,
};

// Export the default theme
export default lightTheme;
