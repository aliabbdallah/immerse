import React from 'react';
import { View, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { Text, Surface, useTheme, Button, List, Switch } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Profile() {
  const theme = useTheme();
  const { toggleTheme, theme: appTheme } = useAppTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            Profile
          </Text>
        </View>

        <Surface style={[styles.profileCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
          <View style={styles.profileInfo}>
            <Image
              source={require('../../assets/images/avatar-placeholder.png')}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text variant="titleLarge" style={[styles.name, { color: theme.colors.onSurface }]}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text variant="bodyMedium" style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                {user?.email || 'user@example.com'}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
          <List.Section>
            <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>Settings</List.Subheader>
            <List.Item
              title="Dark Mode"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={appTheme.dark}
                  onValueChange={toggleTheme}
                  color={theme.colors.primary}
                />
              )}
            />
            <List.Item
              title="Notifications"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <List.Item
              title="Reading Preferences"
              left={props => <List.Icon {...props} icon="book-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </List.Section>
        </Surface>

        <Surface style={[styles.settingsCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={1}>
          <List.Section>
            <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>Account</List.Subheader>
            <List.Item
              title="Privacy"
              left={props => <List.Icon {...props} icon="shield-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <List.Item
              title="Help & Support"
              left={props => <List.Icon {...props} icon="help-circle-outline" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </List.Section>
        </Surface>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={[styles.signOutButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
        >
          Sign Out
        </Button>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 20,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 34 : 30,
    fontWeight: '700',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
  },
}); 