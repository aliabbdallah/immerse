import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme, ProgressBar, List, IconButton } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSessions } from '../../services/readingSessions';
import { getReadingList } from '../../services/readingContent';
import { ReadingSession } from '../../services/readingSessions';
import { ReadingContent } from '../../services/readingContent';

export default function AnalyticsScreen() {
  const theme = useTheme();
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
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          Reading Analytics
        </Text>
        <IconButton
          icon="refresh"
          onPress={loadData}
        />
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Total Reading Time</Text>
          <Text variant="headlineLarge" style={styles.statValue}>
            {formatTime(calculateTotalReadingTime())}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Average Session Time</Text>
          <Text variant="headlineLarge" style={styles.statValue}>
            {formatTime(calculateAverageSessionTime())}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Most Read Content</Text>
          <List.Section>
            {getMostReadContent().map((content, index) => (
              <List.Item
                key={index}
                title={content.title}
                description={`${content.sessions} sessions • ${formatTime(content.totalTime)}`}
                left={props => <List.Icon {...props} icon="book" />}
              />
            ))}
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Reading Progress</Text>
          {readingList.map(content => (
            <View key={content.id} style={styles.progressItem}>
              <Text variant="bodyMedium">{content.title}</Text>
              <ProgressBar
                progress={(content.progress || 0) / 100}
                style={styles.progressBar}
              />
              <Text variant="bodySmall">{Math.round(content.progress || 0)}%</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    marginBottom: 16,
  },
  statValue: {
    marginTop: 8,
  },
  progressItem: {
    marginVertical: 8,
  },
  progressBar: {
    marginVertical: 4,
  },
}); 