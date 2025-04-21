import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Card, useTheme, ProgressBar, List, IconButton, Surface } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSessions } from '../../services/readingSessions';
import { getReadingList } from '../../services/readingContent';
import { ReadingSession } from '../../services/readingSessions';
import { ReadingContent } from '../../services/readingContent';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';

export default function AnalyticsScreen() {
  const paperTheme = useTheme();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [readingList, setReadingList] = useState<ReadingContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [session?.user?.id]);

  const loadData = async () => {
    if (!session?.user?.id) return;

    try {
      const [sessionsData, readingListData] = await Promise.all([
        getUserSessions(session.user.id),
        getReadingList(session.user.id),
      ]);
      setSessions(sessionsData);
      setReadingList(readingListData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalReadingTime = () => {
    return sessions.reduce((total, session) => {
      if (session.duration) {
        return total + session.duration;
      }
      return total;
    }, 0);
  };

  const calculateAverageSessionTime = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return 0;
    
    const totalTime = completedSessions.reduce((total, session) => {
      if (session.duration) {
        return total + session.duration;
      }
      return total;
    }, 0);
    
    return totalTime / completedSessions.length;
  };

  const getMostReadContent = () => {
    const contentSessions = sessions.reduce((acc, session) => {
      if (!session.content_id) return acc;
      
      if (!acc[session.content_id]) {
        acc[session.content_id] = {
          count: 0,
          totalTime: 0,
        };
      }
      
      if (session.duration) {
        acc[session.content_id].totalTime += session.duration;
      }
      acc[session.content_id].count += 1;
      
      return acc;
    }, {} as Record<string, { count: number; totalTime: number }>);

    const sortedContent = Object.entries(contentSessions)
      .sort(([, a], [, b]) => b.totalTime - a.totalTime)
      .slice(0, 5);

    return sortedContent.map(([contentId, stats]) => {
      const content = readingList.find(c => c.id === contentId);
      return {
        title: content?.title || 'Unknown Content',
        sessions: stats.count,
        totalTime: stats.totalTime,
      };
    });
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Screen 
        options={{
          title: 'Analytics',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.onBackground },
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>Reading Analytics</Text>
            <IconButton
              icon="refresh"
              iconColor={theme.colors.onBackground}
              onPress={loadData}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>Total Reading Time</Text>
            <Text style={[styles.statValue, { color: theme.colors.onBackground }]}>
              {formatTime(calculateTotalReadingTime())}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>Average Session Time</Text>
            <Text style={[styles.statValue, { color: theme.colors.onBackground }]}>
              {formatTime(calculateAverageSessionTime())}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>Most Read Content</Text>
            {getMostReadContent().map((content, index) => (
              <View key={index} style={styles.contentItem}>
                <Text style={[styles.contentTitle, { color: theme.colors.onBackground }]}>{content.title}</Text>
                <Text style={[styles.contentMeta, { color: theme.colors.outline }]}>
                  {content.sessions} sessions • {formatTime(content.totalTime)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.outline }]}>Reading Progress</Text>
            {readingList.map(content => (
              <View key={content.id} style={styles.progressItem}>
                <Text style={[styles.contentTitle, { color: theme.colors.onBackground }]}>{content.title}</Text>
                <ProgressBar
                  progress={(content.progress || 0) / 100}
                  style={styles.progressBar}
                  color={theme.colors.primary}
                />
                <Text style={[styles.progressText, { color: theme.colors.outline }]}>
                  {Math.round(content.progress || 0)}%
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
  },
  contentItem: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 14,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    marginVertical: 8,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'right',
  },
  loadingText: {
    fontSize: 16,
  },
}); 