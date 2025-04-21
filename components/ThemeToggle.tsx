import React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { colors } = useTheme();

  return (
    <IconButton
      icon={isDarkMode ? 'weather-sunny' : 'weather-night'}
      iconColor={colors.primary}
      size={24}
      onPress={toggleTheme}
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 8,
  },
}); 