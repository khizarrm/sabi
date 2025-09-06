// App brand colors - Enhanced modern palette
const tintColorLight = '#065f46'; // dark green accent for light theme
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    
    // Enhanced modern palette
    primary: '#065f46',
    primaryLight: '#10b981', 
    primarySoft: '#d1fae5',
    accent: '#f59e0b',
    accentSoft: '#fef3c7',
    
    // Glassmorphism & depth
    glass: 'rgba(255, 255, 255, 0.7)',
    glassStroke: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.12)',
    
    // Refined neutrals
    neutral50: '#fafafa',
    neutral100: '#f5f5f5', 
    neutral200: '#e5e5e5',
    neutral300: '#d4d4d4',
    neutral400: '#a3a3a3',
    neutral500: '#737373',
    neutral600: '#525252',
    neutral700: '#404040',
    neutral800: '#262626',
    neutral900: '#171717',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
