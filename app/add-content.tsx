import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, ActivityIndicator, Card, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { scrapeContent } from '../services/contentScraper';
import { addContent } from '../services/readingContent';
import { useAuth } from '../contexts/AuthContext';

export default function AddContent() {
  const theme = useTheme();
  const { session } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    title: string;
    description: string | null;
    estimatedReadTime: number;
    author: string | null;
  } | null>(null);

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
    
    // Validate URL format
    if (!validateUrl(url)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Scrape the content from the URL
      const scrapedContent = await scrapeContent(url);
      
      // Set preview data
      setPreviewData({
        title: scrapedContent.title,
        description: scrapedContent.description,
        estimatedReadTime: scrapedContent.estimatedReadTime,
        author: scrapedContent.author
      });
    } catch (error) {
      console.error('Error previewing content:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to preview content. Please check the URL and try again.');
      }
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async () => {
    if (!session?.user || !previewData) return;
    
    setLoading(true);
    
    try {
      // Scrape and add the content to the database
      const scrapedContent = await scrapeContent(url);
      
      await addContent(url, session.user.id);

      router.back();
    } catch (error) {
      console.error('Error adding content:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to add content. Please check the URL and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => router.back()}
            />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
              Add New Content
            </Text>
          </View>

          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
            Enter the URL of the article you want to read
          </Text>
          
          <TextInput
            mode="outlined"
            label="URL"
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setError(null);
              // Clear preview when URL changes
              if (previewData) setPreviewData(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            error={!!error}
            placeholder="https://example.com/article"
            placeholderTextColor={theme.colors.outline}
            right={<TextInput.Icon icon="web" onPress={handlePreview} />}
          />
          
          {error && (
            <HelperText type="error" visible={!!error} style={styles.helperText}>
              {error}
            </HelperText>
          )}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 12 }}>
                {previewData ? 'Adding to your reading list...' : 'Fetching article preview...'}
              </Text>
            </View>
          )}
          
          {previewData && !loading && (
            <Card style={styles.previewCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.previewTitle}>{previewData.title}</Text>
                
                {previewData.author && (
                  <Text variant="bodyMedium" style={styles.previewAuthor}>
                    By {previewData.author}
                  </Text>
                )}
                
                {previewData.description && (
                  <Text variant="bodyMedium" style={styles.previewDescription}>
                    {previewData.description}
                  </Text>
                )}
                
                <Text variant="bodySmall" style={styles.previewReadTime}>
                  {previewData.estimatedReadTime} min read
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={handleAddContent}
                  style={styles.saveButton}
                >
                  Save to Reading List
                </Button>
              </Card.Actions>
            </Card>
          )}
          
          {!previewData && !loading && (
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handlePreview}
                disabled={!url.trim()}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Preview Article
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: '600',
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    lineHeight: 22,
  },
  input: {
    marginTop: 16,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
  },
  helperText: {
    marginTop: 4,
    fontSize: Platform.OS === 'ios' ? 13 : 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
  buttonContent: {
    height: 44,
    minWidth: 44,
  },
  loadingContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    marginTop: 24,
    marginBottom: 16,
  },
  previewTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  previewAuthor: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  previewDescription: {
    marginBottom: 12,
  },
  previewReadTime: {
    opacity: 0.7,
  },
  saveButton: {
    marginTop: 8,
  }
});