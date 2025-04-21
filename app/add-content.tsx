import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText } from 'react-native-paper';
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

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddContent = async () => {
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
      
      // Add the content to the database
      await addContent({
        title: scrapedContent.title,
        description: scrapedContent.description,
        content: scrapedContent.content,
        url: url,
        estimated_read_time: scrapedContent.estimatedReadTime,
        user_id: session.user.id,
        priority: 'Medium',
        is_completed: false,
      });

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
        Add New Content
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
        Enter the URL of the article or content you want to read
      </Text>
      <TextInput
        mode="outlined"
        label="URL"
        value={url}
        onChangeText={(text) => {
          setUrl(text);
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.input}
        error={!!error}
        placeholder="https://example.com"
        placeholderTextColor={theme.colors.outline}
      />
      {error && (
        <HelperText type="error" visible={!!error} style={styles.helperText}>
          {error}
        </HelperText>
      )}
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
          onPress={handleAddContent}
          loading={loading}
          disabled={!url.trim() || loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Add Content
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 12,
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    fontWeight: '600',
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
}); 