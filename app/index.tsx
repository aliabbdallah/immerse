import React from 'react';
import { View, StyleSheet, Platform, ScrollView, Image } from 'react-native';
import { Text, Surface, Button, useTheme, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { ReadingList } from '../components/ReadingList';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  const theme = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text variant="headlineLarge" style={[styles.greeting, { color: theme.colors.onBackground }]}>
              {getGreeting()}
            </Text>
            <Text variant="headlineLarge" style={[styles.location, { color: theme.colors.primary }]}>
              from Immerse
            </Text>
          </View>
          <IconButton
            icon="bell-outline"
            size={24}
            onPress={() => {}}
            style={styles.notificationButton}
          />
        </View>

        <Surface style={[styles.featuredCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
          <View style={styles.featuredContent}>
            <Text variant="titleLarge" style={[styles.featuredTitle, { color: theme.colors.onSurface }]}>
              Continue Reading
            </Text>
            <Text variant="bodyMedium" style={[styles.featuredSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Pick up where you left off
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/library')}
              style={styles.continueButton}
              contentStyle={styles.buttonContent}
            >
              View Library
            </Button>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/images/reading.png')}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </View>
        </Surface>

        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Your Reading List
          </Text>
          <ReadingList />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: Platform.OS === 'ios' ? 34 : 30,
    fontWeight: '700',
    marginBottom: 4,
  },
  location: {
    fontSize: Platform.OS === 'ios' ? 34 : 30,
    fontWeight: '700',
  },
  notificationButton: {
    marginTop: 8,
  },
  featuredCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: 20,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 20,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  continueButton: {
    borderRadius: 12,
  },
  buttonContent: {
    height: 44,
  },
});
