import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { getReadingList } from '../services/readingContent';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/supabase';

type ReadingContent = Database['public']['Tables']['reading_content']['Row'] & {
  priority: "High" | "Medium" | "Low";
  tags: string[];
  is_completed: boolean;
  completed_at: string;
};

export function ReadingList() {
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
      setItems(data);
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
  }, [session?.user]);

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
              No articles yet. Add some content to get started!
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
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  card: {
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
}); 