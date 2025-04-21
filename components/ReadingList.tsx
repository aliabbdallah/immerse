import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, IconButton, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { getReadingList, deleteContent } from '../services/readingContent';
import { ReadingContent } from '../services/readingContent';

interface ReadingListProps {
  searchQuery?: string;
}

export function ReadingList({ searchQuery = '' }: ReadingListProps) {
  const theme = useTheme();
  const { session } = useAuth();
  const [items, setItems] = useState<ReadingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReadingList = async () => {
    if (!session?.user) return;
    
    try {
      const data = await getReadingList(session.user.id);
      // Filter items based on search query if provided
      const filteredData = searchQuery
        ? data.filter(item => 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
          )
        : data;
      setItems(filteredData);
      setError(null);
    } catch (error) {
      console.error('Error loading reading list:', error);
      setError('Failed to load reading list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReadingList();
  }, [session?.user, searchQuery]); // Add searchQuery as a dependency

  const handleReadArticle = (id: string) => {
    router.push(`/article/${id}`);
  };

  const handleAddContent = () => {
    router.push('/add-content');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReadingList();
  };

  const handleDeleteArticle = async (id: string) => {
    if (!session?.user) return;
    
    try {
      await deleteContent(id, session.user.id);
      // Remove the deleted item from the local state
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.error, marginBottom: 16 }}>
          {error}
        </Text>
        <Button mode="contained" onPress={loadReadingList}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Reading List
        </Text>
        <IconButton
          icon="plus"
          mode="contained"
          onPress={handleAddContent}
          style={styles.addButton}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {searchQuery ? 'No articles found matching your search.' : 'No articles yet. Add some content to get started!'}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <Card key={item.id} style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="titleLarge">{item.title}</Text>
                {item.description && (
                  <Text variant="bodyMedium" style={styles.description}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardFooter}>
                  <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                    {item.estimated_read_time} mins read
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      color:
                        item.priority === 'High'
                          ? theme.colors.error
                          : theme.colors.secondary,
                    }}
                  >
                    {item.priority} Priority
                  </Text>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleReadArticle(item.id)}>Read Now</Button>
                <IconButton
                  icon="delete"
                  iconColor={theme.colors.error}
                  onPress={() => handleDeleteArticle(item.id)}
                />
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
}); 