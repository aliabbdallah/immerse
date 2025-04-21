import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, IconButton, Button, useTheme, FAB, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { FocusReader } from '../../components/FocusReader';
import { getArticle, updateContent } from '../../services/readingContent';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    // Just log the progress for now until you add the progress column
    console.log('Reading progress:', progress);
  };

  const handleExitFocusMode = () => {
    setIsFocusMode(false);
  };

  const chunkContent = (content: string) => {
    const chunkSize = 1000; // Number of characters per chunk
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const renderContentItem = ({ item }: { item: string }) => (
    <Text 
      variant="bodyLarge" 
      style={[styles.articleText, { color: theme.colors.onSurface }]}
    >
      {item}
    </Text>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading article...</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
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
      
      <View style={styles.contentContainer}>
        <FlatList
          data={chunkContent(article.content)}
          renderItem={renderContentItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        />
      </View>
      <FAB
        icon="book-open-variant"
        label="Focus Mode"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setIsFocusMode(true)}
      />
    </SafeAreaView>
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
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  articleText: {
    lineHeight: 24,
    textAlign: 'justify',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});