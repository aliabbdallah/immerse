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
  console.log('Starting content addition for URL:', url);
  
  const scrapedContent = await scrapeContent(url);
  console.log('Scraped content:', {
    title: scrapedContent.title,
    contentLength: scrapedContent.content?.length,
    hasDescription: !!scrapedContent.description,
    estimatedReadTime: scrapedContent.estimatedReadTime
  });
  
  const insertData = {
    title: scrapedContent.title || 'Untitled Article',
    content: scrapedContent.content || '',
    url: url,
    user_id: userId,
    priority: 1 // Default to Medium priority (0: Low, 1: Medium, 2: High)
  };
  console.log('Data being inserted into database:', insertData);
  
  const { data, error } = await supabase
    .from('reading_content')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error(`Failed to add content: ${error.message}`);
  }

  console.log('Successfully added content:', {
    id: data.id,
    title: data.title,
    contentLength: data.content?.length
  });

  return data;
}

export async function getReadingList(userId: string): Promise<ReadingContent[]> {
  console.log('Fetching reading list for user:', userId);
  
  const { data, error } = await supabase
    .from('reading_content')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reading list:', error);
    throw new Error(`Failed to fetch reading list: ${error.message}`);
  }

  console.log('Retrieved reading list items:', data?.map(item => ({
    id: item.id,
    title: item.title,
    contentLength: item.content?.length,
    hasDescription: !!item.description
  })));

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