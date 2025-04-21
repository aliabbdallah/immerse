import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Surface, useTheme, Searchbar } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { ReadingList } from '../../components/ReadingList';

export default function Library() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            Library
          </Text>
          <Searchbar
            placeholder="Search articles"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: theme.colors.elevation.level2 }]}
            iconColor={theme.colors.onSurfaceVariant}
            inputStyle={{ color: theme.colors.onBackground }}
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Recently Added
          </Text>
          <ReadingList />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}>
            Collections
          </Text>
          <Surface style={[styles.collectionsGrid, { backgroundColor: 'transparent' }]}>
            {['Work', 'Personal', 'Research', 'Favorites'].map((collection) => (
              <Surface
                key={collection}
                style={[styles.collectionCard, { backgroundColor: theme.colors.elevation.level2 }]}
                elevation={1}
              >
                <Text variant="titleMedium" style={[styles.collectionTitle, { color: theme.colors.onSurface }]}>
                  {collection}
                </Text>
              </Surface>
            ))}
          </Surface>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 34 : 30,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchBar: {
    borderRadius: 12,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  collectionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  collectionCard: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'flex-end',
  },
  collectionTitle: {
    fontWeight: '600',
  },
}); 