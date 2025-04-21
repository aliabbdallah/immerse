import { supabase } from '../lib/supabase';

export interface ReadingSession {
  id?: string;
  created_at?: string;
  user_id: string;
  content_id: string;
  start_time: string;
  end_time?: string | null;
  duration?: number;
  progress_start: number;
  progress_end?: number;
  status: 'active' | 'paused' | 'completed';
}

export async function startSession(userId: string, contentId: string, initialProgress: number): Promise<ReadingSession> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .insert([
      {
        user_id: userId,
        content_id: contentId,
        start_time: new Date().toISOString(),
        progress_start: initialProgress,
        status: 'active',
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to start reading session: ${error.message}`);
  }

  return data;
}

export async function pauseSession(sessionId: string, currentProgress: number): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .update({
      status: 'paused',
      progress_end: currentProgress,
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to pause reading session: ${error.message}`);
  }
}

export async function resumeSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .update({
      status: 'active',
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to resume reading session: ${error.message}`);
  }
}

export async function endSession(sessionId: string, finalProgress: number): Promise<void> {
  const { error } = await supabase
    .from('reading_sessions')
    .update({
      status: 'completed',
      end_time: new Date().toISOString(),
      progress_end: finalProgress,
      duration: new Date().getTime() - new Date().getTime(), // This will be calculated in the database trigger
    })
    .eq('id', sessionId);

  if (error) {
    throw new Error(`Failed to end reading session: ${error.message}`);
  }
}

export async function getActiveSession(userId: string, contentId: string): Promise<ReadingSession | null> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('content_id', contentId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    throw new Error(`Failed to get active session: ${error.message}`);
  }

  return data;
}

export async function getUserSessions(userId: string): Promise<ReadingSession[]> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user sessions: ${error.message}`);
  }

  return data || [];
} 