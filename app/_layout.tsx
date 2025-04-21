import React from 'react';
import { Stack, Tabs, Redirect } from 'expo-router';
import { PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';

function RootLayoutNav() {
  const { theme } = useTheme();
  const { session } = useAuth();

  return (
    <PaperProvider theme={theme}>
      <Stack>
        {!session ? (
          <>
            <Stack.Screen 
              name="sign-in" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
            <Stack.Screen 
              name="sign-up" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
            <Stack.Screen 
              name="reset-password" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
            <Stack.Screen 
              name="article/[id]" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
            <Stack.Screen 
              name="add-content" 
              options={{ 
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade'
              }} 
            />
          </>
        )}
      </Stack>
    </PaperProvider>
  );
}

function TabsLayout() {
  const theme = usePaperTheme();
  const tabBarHeight = Platform.OS === 'ios' ? 83 : 60;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : theme.colors.background,
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="light"
              intensity={95}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-multiple-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-content"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{ overflow: 'visible' }}>
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: theme.colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 32 : 16,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}>
                <MaterialCommunityIcons name="plus" size={32} color="white" />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
} 