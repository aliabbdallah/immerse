import { View, Text, ScrollView, Pressable, Image, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReadingList } from '../../services/readingContent';
import { ActivityIndicator, useTheme, Searchbar, Chip, ProgressBar } from 'react-native-paper';
import { ReadingContent } from '../../services/readingContent';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

export default function HomeScreen() {
  const paperTheme = useTheme();
  const { theme } = useAppTheme();
  const [articles, setArticles] = useState<ReadingContent[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<ReadingContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in-progress' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedFilter]);

  const loadArticles = async () => {
    if (!session?.user?.id) return;
    try {
      const list = await getReadingList(session.user.id);
      setArticles(list);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'in-progress':
        filtered = filtered.filter(article => article.progress && article.progress < 100);
        break;
      case 'unread':
        filtered = filtered.filter(article => !article.progress);
        break;
    }

    setFilteredArticles(filtered);
  };

  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };

  const getPriorityColor = (priority: ReadingContent['priority']) => {
    switch (priority) {
      case 'High':
        return theme.colors.error;
      case 'Medium':
        return theme.colors.primary;
      case 'Low':
        return theme.colors.secondary;
      default:
        return theme.colors.outline;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadArticles();
    } catch (error) {
      console.error('Error refreshing articles:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Screen 
        options={{
          title: 'Home',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
        }} 
      />

      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search articles..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
            iconColor={theme.colors.primary}
            inputStyle={{ color: theme.colors.onSurface }}
            placeholderTextColor={theme.colors.outline}
          />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <Chip
              selected={selectedFilter === 'all'}
              onPress={() => setSelectedFilter('all')}
              style={[styles.filterChip, { backgroundColor: theme.colors.surface }]}
              textStyle={{ color: selectedFilter === 'all' ? theme.colors.onPrimary : theme.colors.onSurface }}
            >
              All
            </Chip>
            <Chip
              selected={selectedFilter === 'in-progress'}
              onPress={() => setSelectedFilter('in-progress')}
              style={[styles.filterChip, { backgroundColor: theme.colors.surface }]}
              textStyle={{ color: selectedFilter === 'in-progress' ? theme.colors.onPrimary : theme.colors.onSurface }}
            >
              In Progress
            </Chip>
            <Chip
              selected={selectedFilter === 'unread'}
              onPress={() => setSelectedFilter('unread')}
              style={[styles.filterChip, { backgroundColor: theme.colors.surface }]}
              textStyle={{ color: selectedFilter === 'unread' ? theme.colors.onPrimary : theme.colors.onSurface }}
            >
              Unread
            </Chip>
          </ScrollView>
        </View>

        {articles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: theme.colors.outline }]}>
              Welcome! Add some articles to get started with your reading list.
            </Text>
            <Pressable 
              style={[styles.addFirstButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/library')}
            >
              <Text style={[styles.addFirstButtonText, { color: theme.colors.onPrimary }]}>
                Go to Library
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
                progressBackgroundColor={theme.colors.surface}
              />
            }
          >
            {filteredArticles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.colors.outline }]}>
                  No articles match your search criteria.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                    {selectedFilter === 'in-progress' ? 'Continue Reading' : 'Articles'}
                  </Text>
                  {filteredArticles.map((article) => (
                    <Pressable 
                      key={article.id} 
                      style={[styles.articleCard, { backgroundColor: theme.colors.surface }]}
                      onPress={() => handleArticlePress(article.id)}
                    >
                      <View style={styles.articleHeader}>
                        <View style={styles.articleMeta}>
                          <Text style={[styles.source, { color: theme.colors.outline }]}>
                            {new URL(article.url).hostname.replace('www.', '')}
                          </Text>
                          <View style={styles.metaRight}>
                            <Text style={[styles.readTime, { color: theme.colors.outline }]}>
                              {article.estimated_read_time} min
                            </Text>
                            <View 
                              style={[
                                styles.priorityDot, 
                                { backgroundColor: getPriorityColor(article.priority) }
                              ]} 
                            />
                          </View>
                        </View>
                        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                          {article.title}
                        </Text>
                        {article.description && (
                          <Text 
                            style={[styles.description, { color: theme.colors.outline }]}
                            numberOfLines={2}
                          >
                            {article.description}
                          </Text>
                        )}
                      </View>

                      <View style={styles.articleFooter}>
                        <View style={styles.progressContainer}>
                          {article.progress !== undefined && (
                            <>
                              <ProgressBar
                                progress={article.progress / 100}
                                color={theme.colors.primary}
                                style={styles.progressBar}
                              />
                              <Text style={[styles.progressText, { color: theme.colors.outline }]}>
                                {Math.round(article.progress)}% complete
                              </Text>
                            </>
                          )}
                        </View>
                        <Text style={[styles.date, { color: theme.colors.outline }]}>
                          Added {formatDate(article.created_at)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  articleCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  articleHeader: {
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 12,
    marginRight: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  articleFooter: {
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
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
  source: {
    fontSize: 12,
  },
}); 