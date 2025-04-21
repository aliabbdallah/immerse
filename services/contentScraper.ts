import axios from 'axios';
import * as cheerio from 'react-native-cheerio';

interface ScrapedContent {
  title: string;
  content: string;
  description: string | null;
  estimatedReadTime: number;
  imageUrl: string | null;
  author: string | null;
  publishDate: string | null;
}

// Common headers to mimic a real browser
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0'
};

export async function scrapeContent(url: string): Promise<ScrapedContent> {
  try {
    console.log('Starting content scraping for URL:', url);
    
    // Clean and validate URL
    let cleanUrl = url.trim().replace(/^@/, '');
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    // Handle Substack URLs
    if (cleanUrl.includes('substack.com')) {
      // For Substack, we need to use their API endpoint
      const urlObj = new URL(cleanUrl);
      const pathParts = urlObj.pathname.split('/');
      const publication = pathParts[2];
      const slug = pathParts[4];
      
      // Try multiple API endpoints
      const apiEndpoints = [
        `https://${publication}.substack.com/api/v1/posts/${slug}`,
        `https://${publication}.substack.com/api/v1/archive/${slug}`,
        `https://${publication}.substack.com/api/v1/public/posts/${slug}`
      ];
      
      let lastError = null;
      
      for (const endpoint of apiEndpoints) {
        try {
          console.log('Trying API endpoint:', endpoint);
          const apiResponse = await axios.get(endpoint, {
            headers: {
              ...DEFAULT_HEADERS,
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Referer': url,
              'Origin': new URL(url).origin
            },
            timeout: 15000,
            maxRedirects: 10,
            validateStatus: (status) => status >= 200 && status < 400
          });
          
          if (apiResponse.data && (apiResponse.data.post || apiResponse.data)) {
            cleanUrl = endpoint;
            break;
          }
        } catch (error) {
          lastError = error;
          console.log('API endpoint failed:', endpoint);
        }
      }
      
      if (!cleanUrl.includes('api/v1')) {
        // If all API endpoints fail, fall back to the original URL
        cleanUrl = url;
        console.log('Falling back to original URL');
      }
    }
    
    if (!isValidUrl(cleanUrl)) {
      throw new Error('Invalid URL format');
    }

    console.log('Fetching URL:', cleanUrl);
    
    // Try scraping with retries and different headers
    const response = await retryWithBackoff(async () => {
      try {
        // First try with standard headers
        return await axios.get(cleanUrl, {
          headers: {
            ...DEFAULT_HEADERS,
            'Accept': cleanUrl.includes('api/v1') ? 'application/json' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': url,
            'Origin': new URL(url).origin
          },
          timeout: 15000,
          maxRedirects: 10,
          validateStatus: (status) => status >= 200 && status < 400
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          console.log('Received 403, trying with different User-Agent');
          // Try with a different User-Agent
          return await axios.get(cleanUrl, {
            headers: {
              ...DEFAULT_HEADERS,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': cleanUrl.includes('api/v1') ? 'application/json' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Referer': url,
              'Origin': new URL(url).origin
            },
            timeout: 15000,
            maxRedirects: 10,
            validateStatus: (status) => status >= 200 && status < 400
          });
        }
        throw error;
      }
    });
    
    console.log('Successfully fetched URL, processing content');
    
    // For Substack API responses
    if (cleanUrl.includes('api/v1')) {
      const data = response.data;
      const post = data.post || data;
      
      if (!post || (!post.body_html && !post.body)) {
        throw new Error('Invalid response from Substack API');
      }
      
      const content = post.body_html || post.body;
      
      // Parse the HTML content
      const $ = cheerio.load(content);
      
      // Clean up the content
      $('script, style, iframe').remove();
      
      const result = {
        title: post.title || 'Untitled',
        content: $.text().trim(),
        description: post.subtitle || null,
        estimatedReadTime: Math.ceil($.text().split(/\s+/).length / 200),
        imageUrl: post.cover_image || null,
        author: post.author?.name || null,
        publishDate: post.published_at || null
      };
      
      console.log('Final scraped content:', {
        title: result.title,
        contentLength: result.content.length,
        hasDescription: !!result.description,
        estimatedReadTime: result.estimatedReadTime
      });
      
      return result;
    }
    
    // For non-Substack URLs, use the existing HTML parsing logic
    const html = response.data;
    
    if (!html || html.length === 0) {
      throw new Error('Received empty response from the server');
    }
    
    const $ = cheerio.load(html);
    
    // Extract title
    const title = extractTitle($) || 'Untitled';
    console.log('Extracted title:', title);
    
    // Extract description
    const description = extractMetadata($, 'description');
    console.log('Extracted description:', description);
    
    // Extract content
    const content = extractReadableContent($);
    console.log('Extracted content length:', content.length);
    
    if (!content || content.length === 0) {
      throw new Error('No readable content found on the page');
    }
    
    // Calculate estimated read time
    const wordCount = content.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);
    console.log('Calculated read time:', estimatedReadTime, 'minutes');
    
    const result = {
      title,
      content,
      description,
      estimatedReadTime,
      imageUrl: extractMainImage($, cleanUrl),
      author: extractAuthor($),
      publishDate: extractPublishDate($)
    };
    
    console.log('Final scraped content:', {
      title: result.title,
      contentLength: result.content.length,
      hasDescription: !!result.description,
      estimatedReadTime: result.estimatedReadTime
    });
    
    return result;
  } catch (error) {
    console.error('Error scraping content:', error);
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The website might be slow or unavailable.');
    } else if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 403) {
        throw new Error('Access denied. The content might be behind a paywall or require authentication.');
      }
      throw new Error(`Failed to scrape content: HTTP error ${error.response.status}`);
    } else if (error instanceof Error && error.message.includes('paywall')) {
      throw new Error('This content appears to be behind a paywall or requires authentication.');
    }
    throw new Error('Failed to scrape content from URL');
  }
}

function removeNonContentElements($: cheerio.CheerioAPI): void {
  // Remove non-content elements
  $('script, style, nav, header, footer, aside, iframe, noscript').remove();
  $('[class*="nav"],[class*="menu"],[class*="header"],[class*="footer"],[class*="comment"],[class*="sidebar"],[class*="widget"],[class*="banner"],[class*="ad-"],[class*="advertisement"]').remove();
}

function extractTitle($: cheerio.CheerioAPI): string | null {
  // Try multiple selectors for title
  const titleSelectors = [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'h1.entry-title',
    'h1.post-title',
    'h1.article-title',
    'h1.post-title', // Substack specific
    'h1.entry-title', // Substack specific
    'h1',
    'title'
  ];
  
  for (const selector of titleSelectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content && content.trim().length > 0) return content.trim();
    } else {
      const text = $(selector).first().text();
      if (text && text.trim().length > 0) return text.trim();
    }
  }
  
  return null;
}

function extractMetadata($: cheerio.CheerioAPI, property: string): string | null {
  // Try different meta patterns
  const metaSelectors = [
    `meta[property="og:${property}"]`,
    `meta[name="twitter:${property}"]`,
    `meta[name="${property}"]`,
    `meta[itemprop="${property}"]`
  ];
  
  for (const selector of metaSelectors) {
    const content = $(selector).attr('content');
    if (content && content.trim().length > 0) return content.trim();
  }
  
  return null;
}

function extractAuthor($: cheerio.CheerioAPI): string | null {
  // Try multiple selectors for author
  const authorSelectors = [
    'meta[property="article:author"]',
    'meta[name="author"]',
    '[class*="author"] a',
    '[class*="author"]',
    '[rel="author"]',
    '[itemprop="author"]',
    '.author-name', // Substack specific
    '.post-author', // Substack specific
    '.entry-author' // Substack specific
  ];
  
  for (const selector of authorSelectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content && content.trim().length > 0) return content.trim();
    } else {
      const text = $(selector).first().text();
      if (text && text.trim().length > 0) return text.trim();
    }
  }
  
  return null;
}

function extractPublishDate($: cheerio.CheerioAPI): string | null {
  // Try multiple selectors for publish date
  const dateSelectors = [
    'meta[property="article:published_time"]',
    'meta[name="publication_date"]',
    'time',
    '[itemprop="datePublished"]',
    '[class*="date"]',
    '[class*="publish"]',
    '.post-date', // Substack specific
    '.entry-date', // Substack specific
    '.published-date' // Substack specific
  ];
  
  for (const selector of dateSelectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content && content.trim().length > 0) return content.trim();
    } else {
      const datetime = $(selector).attr('datetime');
      if (datetime && datetime.trim().length > 0) return datetime.trim();
      
      const text = $(selector).first().text();
      if (text && text.trim().length > 0) return text.trim();
    }
  }
  
  return null;
}

function extractMainImage($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // Try multiple selectors for main image
  const imageSelectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    '[itemprop="image"]',
    '.post-thumbnail img',
    '.entry-content img',
    'article img'
  ];
  
  for (const selector of imageSelectors) {
    if (selector.startsWith('meta')) {
      const content = $(selector).attr('content');
      if (content && content.trim().length > 0) {
        return makeAbsoluteUrl(content.trim(), baseUrl);
      }
    } else if (selector === '[itemprop="image"]') {
      const src = $(selector).attr('src') || $(selector).attr('content');
      if (src && src.trim().length > 0) {
        return makeAbsoluteUrl(src.trim(), baseUrl);
      }
    } else {
      const src = $(selector).first().attr('src');
      if (src && src.trim().length > 0) {
        return makeAbsoluteUrl(src.trim(), baseUrl);
      }
    }
  }
  
  return null;
}

function extractReadableContent($: cheerio.CheerioAPI): string {
  console.log('Starting content extraction');
  
  // First try Substack-specific selectors with more variations
  const substackSelectors = [
    '.available-content',
    '.post-content',
    '.entry-content',
    '.body',
    '.article-content',
    '[class*="content"]',
    '[class*="post"]',
    '[class*="article"]'
  ];
  
  for (const selector of substackSelectors) {
    const content = $(selector).first();
    if (content.length > 0) {
      console.log(`Found content with selector: ${selector}`);
      const formattedContent = formatContent(content.html() || '', $);
      if (formattedContent.trim().length > 0) {
        return formattedContent;
      }
    }
  }
  
  // Try to find the main article content
  const article = $('article').first();
  if (article.length > 0) {
    console.log('Found article tag');
    const formattedContent = formatContent(article.html() || '', $);
    if (formattedContent.trim().length > 0) {
      return formattedContent;
    }
  }
  
  // Try to find content within the main tag
  const main = $('main').first();
  if (main.length > 0) {
    console.log('Found main tag');
    const formattedContent = formatContent(main.html() || '', $);
    if (formattedContent.trim().length > 0) {
      return formattedContent;
    }
  }
  
  // Get the HTML content as a last resort
  const html = $('body').html() || '';
  console.log('Raw HTML length:', html.length);
  
  // Remove script and style elements
  const cleanedHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  
  console.log('HTML length after removing scripts/styles:', cleanedHtml.length);
  
  // Strip HTML tags but keep the content between them
  const textContent = cleanedHtml
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (textContent.length === 0) {
    throw new Error('No readable content found on the page');
  }
  
  console.log('Final text content length:', textContent.length);
  return textContent;
}

function formatContent(html: string, $: cheerio.CheerioAPI): string {
  const $content = cheerio.load(html);
  
  // Remove non-content elements
  $content('script, style, nav, header, footer, aside, iframe, noscript').remove();
  $content('[class*="nav"],[class*="menu"],[class*="header"],[class*="footer"],[class*="comment"],[class*="sidebar"],[class*="widget"],[class*="banner"],[class*="ad-"],[class*="advertisement"]').remove();
  
  // Replace divs with p tags if they look like paragraphs
  $content('div').each((i, element) => {
    const $el = $content(element);
    const childNodes = $el.children();
    
    if (childNodes.length === 0 || (childNodes.length === 1 && childNodes.get(0).tagName === 'br')) {
      $el.replaceWith(`<p>${$el.html()}</p>`);
    }
  });
  
  // Convert br tags to paragraph breaks if they have text between them
  let html2 = $content.html() || '';
  html2 = html2.replace(/(.+?)<br\s*\/?>\s*<br\s*\/?>/gi, '<p>$1</p>');
  
  // Clean up the final HTML
  const $final = cheerio.load(html2);
  
  // Only keep specific elements
  $final('*').each((i, element) => {
    const $el = $final(element);
    if (element.type === 'tag') {
      const tagName = element.name.toLowerCase();
      if (!['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'blockquote', 'img', 'a'].includes(tagName)) {
        $el.replaceWith($el.html() || '');
      }
    }
  });
  
  // Get the text content with paragraph breaks
  let textContent = '';
  $final('body *').each((i, element) => {
    const $el = $final(element);
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'p' || tagName.match(/^h[1-6]$/)) {
      textContent += $el.text().trim() + '\n\n';
    } else if (tagName === 'li') {
      textContent += '• ' + $el.text().trim() + '\n';
    } else if (tagName === 'a') {
      const href = $el.attr('href');
      const text = $el.text().trim();
      if (text && href) {
        textContent += `${text} (${href})\n`;
      } else if (text) {
        textContent += text + '\n';
      }
    }
  });
  
  return textContent.trim();
}

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch (e) {
    return url;
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,})([/\w .-]*)*(\?[\w=&%.-]*)?(#[\w-]*)?$/i;
    return urlPattern.test(url);
  } catch {
    return false;
  }
}

export function sanitizeContent(content: string): string {
  return content
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .trim();
}

// Add retry with exponential backoff function
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}