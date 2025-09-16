// src/utils/rssValidator.js
import Parser from 'rss-parser';

const parser = new Parser({ 
  timeout: 10000, 
  requestOptions: { 
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  } 
});

// Validate RSS URL format
export function isValidRSSUrl(url) {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

// Validate RSS feed content
export async function validateRSSFeed(url) {
  const result = {
    isValid: false,
    hasContent: false,
    itemCount: 0,
    error: null,
    feedTitle: null,
    lastItemDate: null,
    sampleItems: []
  };

  try {
    // Check URL format first
    if (!isValidRSSUrl(url)) {
      result.error = 'Invalid URL format';
      return result;
    }

    // Try to parse the RSS feed
    const feed = await parser.parseURL(url);
    
    if (!feed || !feed.items) {
      result.error = 'No RSS items found';
      return result;
    }

    // Check if feed has content
    result.hasContent = feed.items.length > 0;
    result.itemCount = feed.items.length;
    result.feedTitle = feed.title || 'Unknown Feed';
    
    // Get sample items (first 3)
    result.sampleItems = feed.items.slice(0, 3).map(item => ({
      title: item.title || 'No title',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || null
    }));

    // Check for recent content (within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentItems = feed.items.filter(item => {
      const itemDate = new Date(item.pubDate || item.isoDate || 0);
      return itemDate > thirtyDaysAgo;
    });

    if (recentItems.length === 0) {
      result.error = 'No recent content (last 30 days)';
    } else {
      result.lastItemDate = recentItems[0].pubDate || recentItems[0].isoDate;
    }

    // Feed is valid if it has content and recent items
    result.isValid = result.hasContent && recentItems.length > 0;

  } catch (error) {
    console.error('RSS validation error:', error);
    
    if (error.code === 'ENOTFOUND') {
      result.error = 'URL not found (404)';
    } else if (error.code === 'ECONNREFUSED') {
      result.error = 'Connection refused';
    } else if (error.code === 'ETIMEDOUT') {
      result.error = 'Request timed out';
    } else if (error.message.includes('Invalid XML')) {
      result.error = 'Invalid RSS/XML format';
    } else if (error.message.includes('Feed not recognized')) {
      result.error = 'Not a valid RSS feed';
    } else {
      result.error = error.message || 'Unknown error';
    }
  }

  return result;
}

// Validate multiple RSS feeds in parallel
export async function validateMultipleRSSFeeds(urls) {
  const validationPromises = urls.map(async (url) => {
    const validation = await validateRSSFeed(url);
    return { url, ...validation };
  });

  return Promise.all(validationPromises);
}
