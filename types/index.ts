export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface ReadingContent {
  id: string;
  title: string;
  url: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  userId: string;
  contentId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
} 