import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, IconButton, Portal, Modal, Button, useTheme } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { startSession, pauseSession, resumeSession, endSession, getActiveSession } from '../services/readingSessions';
import { useAuth } from '../contexts/AuthContext';

interface FocusReaderProps {
  id: string;
  title: string;
  content: string;
  onProgress: (progress: number) => void;
  onExit: () => void;
}

export function FocusReader({ id, title, content, onProgress, onExit }: FocusReaderProps) {
  const theme = useTheme();
  const { session } = useAuth();
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Lock orientation to landscape when fullscreen
    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isFullscreen]);

  useEffect(() => {
    const initializeSession = async () => {
      if (!session?.user?.id) return;

      try {
        // Check for existing active session
        const activeSession = await getActiveSession(session.user.id, id);
        if (activeSession) {
          setCurrentSessionId(activeSession.id!);
          setProgress(activeSession.progress_start);
        } else {
          // Start new session
          const newSession = await startSession(session.user.id, id, 0);
          setCurrentSessionId(newSession.id!);
        }
      } catch (error) {
        console.error('Error initializing reading session:', error);
      }
    };

    initializeSession();
  }, [session?.user?.id, id]);

  const handleScroll = async (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const calculatedProgress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
    const newProgress = Math.min(Math.max(calculatedProgress, 0), 100);
    setProgress(newProgress);
    onProgress(newProgress);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleExit = async () => {
    if (currentSessionId && session?.user?.id) {
      try {
        await endSession(currentSessionId, progress);
      } catch (error) {
        console.error('Error ending reading session:', error);
      }
    }
    ScreenOrientation.unlockAsync();
    onExit();
  };

  const handlePause = async () => {
    if (currentSessionId) {
      try {
        await pauseSession(currentSessionId, progress);
      } catch (error) {
        console.error('Error pausing reading session:', error);
      }
    }
  };

  const handleResume = async () => {
    if (currentSessionId) {
      try {
        await resumeSession(currentSessionId);
      } catch (error) {
        console.error('Error resuming reading session:', error);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar hidden={isFullscreen} />
      
      {/* Reading Content */}
      <ScrollView
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={toggleControls}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize,
              color: theme.colors.onSurface,
              lineHeight: fontSize * 1.5,
            },
          ]}
        >
          {content}
        </Text>
      </ScrollView>

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controls}>
          <View style={styles.topBar}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={handleExit}
            />
            <Text variant="titleMedium" style={styles.title}>
              {title}
            </Text>
            <IconButton
              icon="cog"
              size={24}
              onPress={() => setSettingsVisible(true)}
            />
          </View>
          <View style={styles.bottomBar}>
            <Text variant="bodySmall">
              {Math.round(progress)}% Complete
            </Text>
            <IconButton
              icon={isFullscreen ? "fullscreen-exit" : "fullscreen"}
              size={24}
              onPress={() => setIsFullscreen(!isFullscreen)}
            />
          </View>
        </View>
      )}

      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={settingsVisible}
          onDismiss={() => setSettingsVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Reading Settings
          </Text>
          <View style={styles.setting}>
            <Text>Font Size</Text>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              minimumValue={12}
              maximumValue={24}
              step={1}
              style={styles.slider}
            />
            <Text>{fontSize}px</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => setSettingsVisible(false)}
            style={styles.modalButton}
          >
            Done
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  text: {
    padding: 20,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  title: {
    flex: 1,
    marginHorizontal: 10,
    color: 'white',
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  modalButton: {
    marginTop: 10,
  },
}); 