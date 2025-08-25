import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  requestOptions: { timeout: 10000 }
});

export async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    const items = (feed.items || []).map((it) => ({
      title: it.title || '',
      link: it.link || '',
      isoDate: it.isoDate || it.pubDate || null,
      source: feed.title || new URL(url).hostname
    }));
    return items;
  } catch (e) {
    console.error('Feed error', url, e.message);
    return [];
  }
}
