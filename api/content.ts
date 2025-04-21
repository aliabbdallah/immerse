import axios from 'axios';
import * as cheerio from 'cheerio';
import { ReadingContent } from '../types';

export const scrapeContent = async (url: string): Promise<Partial<ReadingContent>> => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Remove script and style elements
    $('script, style').remove();

    // Get title
    const title = $('title').text().trim() || $('h1').first().text().trim();

    // Get main content (prioritize article content)
    let content = '';
    const article = $('article').first();
    if (article.length) {
      content = article.text().trim();
    } else {
      // Fallback to body content
      content = $('body').text().trim();
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return {
      title,
      url,
      content,
    };
  } catch (error) {
    console.error('Error scraping content:', error);
    throw new Error('Failed to scrape content from URL');
  }
}; 