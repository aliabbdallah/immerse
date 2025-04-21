import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    secondary: '#666666',
    error: '#B00020',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    outline: '#666666',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FFFFFF',
      level3: '#FFFFFF',
      level4: '#FFFFFF',
      level5: '#FFFFFF',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFFFFF',
    secondary: '#999999',
    error: '#CF6679',
    background: '#121212',
    surface: '#1E1E1E',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    outline: '#666666',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#1E1E1E',
      level3: '#1E1E1E',
      level4: '#1E1E1E',
      level5: '#1E1E1E',
    },
  },
}; 