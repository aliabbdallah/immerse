import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReadingList } from '../../services/readingContent';
import { ActivityIndicator, IconButton, TextInput, Card, useTheme } from 'react-native-paper';
import { ReadingContent } from '../../services/readingContent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scrapeContent } from '../../services/contentScraper';
import { addContent } from '../../services/readingContent';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

export default function LibraryScreen() {
  const paperTheme = useTheme();
  const { theme } = useAppTheme();
  const [articles, setArticles] = useState<ReadingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [url, setUrl] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    title: string;
    description: string | null;
    estimatedReadTime: number;
    author: string | null;
  } | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    loadArticles();
  }, [session?.user]);

  const loadArticles = async () => {
    if (!session?.user) return;
    
    try {
      const data = await getReadingList(session.user.id);
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArticlePress = (id: string) => {
    router.push(`/article/${id}`);
  };

  const handleAddContent = () => {
    setShowAddForm(true);
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handlePreview = async () => {
    if (!session?.user) return;
    
    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setAddLoading(true);
    setError(null);
    
    try {
      const scrapedContent = await scrapeContent(url);
      setPreviewData({
        title: scrapedContent.title,
        description: scrapedContent.description,
        estimatedReadTime: scrapedContent.estimatedReadTime,
        author: scrapedContent.author
      });
    } catch (error) {
      console.error('Error previewing content:', error);
      setError('Failed to preview content. Please check the URL and try again.');
      setPreviewData(null);
    } finally {
      setAddLoading(false);
    }
  };

  const handleSaveContent = async () => {
    if (!session?.user || !previewData) return;
    
    setAddLoading(true);
    
    try {
      await addContent(url, session.user.id);
      await loadArticles();
      setShowAddForm(false);
      setUrl('');
      setPreviewData(null);
    } catch (error) {
      console.error('Error adding content:', error);
      setError('Failed to add content. Please try again.');
    } finally {
      setAddLoading(false);
    }
  };

  const categorizeArticles = (articles: ReadingContent[]) => {
    const categories = {
      'Recently Added': articles.slice(0, 5),
      'Long Reads': articles.filter(a => a.estimated_read_time >= 10),
      'Quick Reads': articles.filter(a => a.estimated_read_time < 10),
    };

    return Object.entries(categories).filter(([_, articles]) => articles.length > 0);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const categorizedArticles = categorizeArticles(articles);

  const renderAddForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.addFormContainer, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.addFormHeader}>
        <Text style={[styles.addFormTitle, { color: theme.colors.onBackground }]}>Add New Article</Text>
        <IconButton
          icon="close"
          iconColor={theme.colors.onBackground}
          size={24}
          onPress={() => {
            setShowAddForm(false);
            setUrl('');
            setPreviewData(null);
            setError(null);
          }}
        />
      </View>

      <TextInput
        style={[styles.urlInput, { 
          backgroundColor: theme.colors.elevation.level1,
          color: theme.colors.onBackground,
        }]}
        placeholder="Enter article URL"
        placeholderTextColor={theme.colors.outline}
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          setError(null);
          if (previewData) setPreviewData(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      )}

      {addLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
            {previewData ? 'Adding to your reading list...' : 'Fetching article preview...'}
          </Text>
        </View>
      )}

      {previewData && !addLoading && (
        <Card style={[styles.previewCard, { backgroundColor: theme.colors.elevation.level2 }]}>
          <Card.Content>
            <Text style={[styles.previewTitle, { color: theme.colors.onBackground }]}>{previewData.title}</Text>
            {previewData.author && (
              <Text style={[styles.previewAuthor, { color: theme.colors.outline }]}>By {previewData.author}</Text>
            )}
            {previewData.description && (
              <Text style={[styles.previewDescription, { color: theme.colors.onSurfaceVariant }]}>
                {previewData.description}
              </Text>
            )}
            <Text style={[styles.previewReadTime, { color: theme.colors.outline }]}>
              {previewData.estimatedReadTime} min read
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.addFormButtons}>
        {!previewData && (
          <Pressable 
            style={[styles.previewButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handlePreview}
            disabled={!url.trim() || addLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Preview Article</Text>
          </Pressable>
        )}
        {previewData && (
          <Pressable 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} 
            onPress={handleSaveContent}
            disabled={addLoading}
          >
            <Text style={[styles.buttonText, { color: theme.colors.onPrimary }]}>Save to Library</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Screen 
        options={{
          title: 'Library',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
          headerRight: () => (
            <IconButton
              icon="plus"
              iconColor={theme.colors.onBackground}
              size={24}
              onPress={handleAddContent}
              style={styles.addButton}
            />
          ),
        }} 
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {showAddForm ? (
          renderAddForm()
        ) : articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.outline }]}>
              Your library is empty. Add some articles to get started.
            </Text>
            <Pressable 
              style={[styles.addFirstButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddContent}
            >
              <Text style={[styles.addFirstButtonText, { color: theme.colors.onPrimary }]}>
                Add Your First Article
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
          >
            {categorizedArticles.map(([category, articles], listIndex) => (
              <View key={listIndex} style={styles.listSection}>
                <Text style={[styles.listTitle, { color: theme.colors.onBackground }]}>{category}</Text>
                {articles.map((article) => (
                  <Pressable 
                    key={article.id} 
                    style={[styles.articleCard, { borderBottomColor: theme.colors.outline }]}
                    onPress={() => handleArticlePress(article.id)}
                  >
                    <View style={styles.articleMeta}>
                      <Text style={[styles.source, { color: theme.colors.outline }]}>
                        {new URL(article.url).hostname.replace('www.', '')} · {article.estimated_read_time} min
                      </Text>
                    </View>
                    <Text style={[styles.title, { color: theme.colors.onBackground }]}>{article.title}</Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  listSection: {
    marginBottom: 32,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  articleCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  articleMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  source: {
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addFormContainer: {
    flex: 1,
    padding: 16,
  },
  addFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addFormTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  urlInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
  },
  previewCard: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewAuthor: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  previewReadTime: {
    fontSize: 14,
  },
  addFormButtons: {
    marginTop: 16,
  },
  previewButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 