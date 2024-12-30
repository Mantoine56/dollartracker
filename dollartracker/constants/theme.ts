export const theme = {
  colors: {
    background: '#1E1E1E',
    primary: '#58A6FF',
    success: '#32CD32',
    warning: '#FFA500',
    error: '#FF6B6B',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#808080',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
};

export type Theme = typeof theme;
export default theme;
