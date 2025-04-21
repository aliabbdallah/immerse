import { supabase } from '../lib/supabase';
import { scrapeContent } from './contentScraper';

export interface ReadingContent {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  content: string;
  url: string;
  estimated_read_time: number;
  user_id: string;
  priority: "High" | "Medium" | "Low";
  tags: string[];
  is_completed: boolean;
  completed_at: string | null;
  progress?: number;
}

export async function addContent(url: string, userId: string): Promise<ReadingContent> {
  const scrapedContent = await scrapeContent(url);
  
  const { data, error } = await supabase
    .from('reading_content')
    .insert([
      {
        url,
        title: scrapedContent.title,
        description: scrapedContent.description,
        content: scrapedContent.content,
        estimated_read_time: scrapedContent.estimatedReadTime,
        user_id: userId,
        progress: 0,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add content: ${error.message}`);
  }

  return data;
}

export async function getReadingList(userId: string): Promise<ReadingContent[]> {
  const { data, error } = await supabase
    .from('reading_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch reading list: ${error.message}`);
  }

  return data || [];
}

export async function getArticle(id: string, userId: string): Promise<ReadingContent> {
  const { data, error } = await supabase
    .from('reading_content')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return data;
}

export async function updateContent(id: string, updates: Partial<ReadingContent>): Promise<void> {
  const { error } = await supabase
    .from('reading_content')
    .update(updates)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update content: ${error.message}`);
  }
}

export async function deleteContent(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('reading_content')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete content: ${error.message}`);
  }
}