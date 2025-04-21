import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton, Button, useTheme, FAB } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { FocusReader } from '../../components/FocusReader';
import { getArticle, updateContent } from '../../services/readingContent';
import { useAuth } from '../../contexts/AuthContext';

export default function ArticleView() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [id, session?.user?.id]);

  const loadArticle = async () => {
    if (!session?.user?.id || !id) return;

    try {
      const data = await getArticle(id as string, session.user.id);
      setArticle(data);
      setError(null);
    } catch (error) {
      console.error('Error loading article:', error);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (progress: number) => {
    if (!session?.user?.id || !id) return;

    try {
      await updateContent(id as string, {
        progress: progress,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleExitFocusMode = () => {
    setIsFocusMode(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={{ color: theme.colors.error }}>{error || 'Article not found'}</Text>
        <Button mode="contained" onPress={loadArticle} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  if (isFocusMode) {
    return (
      <FocusReader
        id={id as string}
        title={article.title}
        content={article.content}
        onProgress={handleProgressUpdate}
        onExit={handleExitFocusMode}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.primary }]}>
          {article.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
          {article.estimated_read_time} mins read
        </Text>
      </View>
      <View style={styles.content}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
          {article.content}
        </Text>
      </View>
      <FAB
        icon="book-open-variant"
        label="Focus Mode"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsFocusMode(true)}
      />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginLeft: -8,
  },
  title: {
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 