import axios from 'axios';

interface ScrapedContent {
  title: string;
  content: string;
  description: string | null;
  estimatedReadTime: number;
}

function extractReadableContent(html: string): string {
  // Remove script and style elements
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove unwanted elements
  const unwantedElements = [
    'nav', 'header', 'footer', 'aside', 'iframe', 'noscript',
    'ad', 'advertisement', 'sidebar', 'related', 'comments', 'social-share'
  ];
  
  unwantedElements.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
    html = html.replace(regex, '');
  });
  
  // Try to find the main content
  const contentSelectors = [
    'article',
    '[role="main"]',
    'post-content',
    'article-content',
    'entry-content',
    'story-body',
    'content',
    'main',
    'body'
  ];
  
  let content = '';
  for (const selector of contentSelectors) {
    const regex = new RegExp(`<${selector}[^>]*>(.*?)<\/${selector}>`, 'is');
    const match = html.match(regex);
    if (match && match[1].length > 100) {
      content = match[1];
      break;
    }
  }
  
  // If no specific content found, use the body
  if (!content) {
    const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
  }
  
  // Clean up the content
  content = stripHtml(content)
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
  
  return content;
}

function getMetaContent(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : null;
}

function stripHtml(html: string): string {
  // Remove script and style elements
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Convert breaks to newlines
  html = html.replace(/<br\s*\/?>/gi, '\n');
  
  // Remove all other HTML tags
  html = html.replace(/<[^>]+>/g, '');
  
  // Decode HTML entities
  html = html.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  
  // Remove excessive whitespace
  html = html.replace(/\s+/g, ' ').trim();
  
  return html;
}

function isValidUrl(url: string): boolean {
  try {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w .-]*)*(\?[\w=&%.-]*)?(#[\w-]*)?$/i;
    return urlPattern.test(url);
  } catch {
    return false;
  }
}

export async function scrapeContent(url: string): Promise<ScrapedContent> {
  try {
    // Clean and validate URL
    let cleanUrl = url.trim().replace(/^@/, '');
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    if (!isValidUrl(cleanUrl)) {
      throw new Error('Invalid URL format');
    }
    
    const response = await axios.get(cleanUrl);
    const html = response.data;
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : 'Untitled';
    
    // Extract description
    const description = getMetaContent(html, 'description') || 
                       getMetaContent(html, 'og:description') ||
                       null;
    
    // Extract content
    const content = extractReadableContent(html);
    
    // Calculate estimated read time (assuming 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);
    
    return {
      title,
      content,
      description,
      estimatedReadTime
    };
  } catch (error) {
    console.error('Error scraping content:', error);
    throw new Error('Failed to scrape content from URL');
  }
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
} 