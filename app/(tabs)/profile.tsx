import React from 'react';
import { View, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { Text, Surface, useTheme, Button, List, Switch } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function Profile() {
  const paperTheme = useTheme();
  const { toggleTheme, theme: appTheme } = useAppTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: appTheme.colors.background }]} edges={['top']}>
      <StatusBar style={appTheme.dark ? 'light' : 'dark'} />
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: appTheme.colors.background },
          headerTitleStyle: { color: appTheme.colors.onBackground },
        }} 
      />
      <View style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileInfo}>
              <Image
                source={require('../../assets/images/avatar-placeholder.png')}
                style={styles.avatar}
              />
              <View style={styles.profileText}>
                <Text style={[styles.name, { color: appTheme.colors.onBackground }]}>
                  {user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={[styles.email, { color: appTheme.colors.outline }]}>
                  {user?.email || 'user@example.com'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.outline }]}>Settings</Text>
            <View style={[styles.settingItem, { borderBottomColor: appTheme.colors.outline }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="theme-light-dark" 
                  size={24} 
                  color={appTheme.colors.outline} 
                />
                <Text style={[styles.settingText, { color: appTheme.colors.onBackground }]}>Dark Mode</Text>
              </View>
              <Switch
                value={appTheme.dark}
                onValueChange={toggleTheme}
                color={appTheme.colors.primary}
              />
            </View>
            <View style={[styles.settingItem, { borderBottomColor: appTheme.colors.outline }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="bell-outline" 
                  size={24} 
                  color={appTheme.colors.outline} 
                />
                <Text style={[styles.settingText, { color: appTheme.colors.onBackground }]}>Notifications</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={appTheme.colors.outline} 
              />
            </View>
            <View style={[styles.settingItem, { borderBottomColor: appTheme.colors.outline }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="book-outline" 
                  size={24} 
                  color={appTheme.colors.outline} 
                />
                <Text style={[styles.settingText, { color: appTheme.colors.onBackground }]}>Reading Preferences</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={appTheme.colors.outline} 
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: appTheme.colors.outline }]}>Account</Text>
            <View style={[styles.settingItem, { borderBottomColor: appTheme.colors.outline }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="shield-outline" 
                  size={24} 
                  color={appTheme.colors.outline} 
                />
                <Text style={[styles.settingText, { color: appTheme.colors.onBackground }]}>Privacy</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={appTheme.colors.outline} 
              />
            </View>
            <View style={[styles.settingItem, { borderBottomColor: appTheme.colors.outline }]}>
              <View style={styles.settingLeft}>
                <MaterialCommunityIcons 
                  name="help-circle-outline" 
                  size={24} 
                  color={appTheme.colors.outline} 
                />
                <Text style={[styles.settingText, { color: appTheme.colors.onBackground }]}>Help & Support</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={appTheme.colors.outline} 
              />
            </View>
          </View>

          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor={appTheme.colors.error}
            buttonColor="transparent"
          >
            Sign Out
          </Button>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  profileSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
  },
}); 