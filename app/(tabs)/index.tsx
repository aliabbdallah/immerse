import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ReadingList } from '../../components/ReadingList';
import { useAuth } from '../../contexts/AuthContext';

export default function Home() {
  const theme = useTheme();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Surface style={styles.welcomeSurface} elevation={2}>
          <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
            Welcome to Immerse
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            Your focus reading companion
          </Text>
          <View style={styles.headerActions}>
            <ThemeToggle />
            <Button
              mode="contained"
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              Sign Out
            </Button>
          </View>
        </Surface>
      </View>
      <View style={styles.content}>
        <ReadingList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  welcomeSurface: {
    padding: 16,
    borderRadius: 8,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  signOutButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
}); 