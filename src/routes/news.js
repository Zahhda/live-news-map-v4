// src/routes/news.js
import express from 'express';
import Region from '../models/Region.js';
import { fetchFeed } from '../utils/rss.js';
import { classifyText, dominantCategory } from '../utils/classify.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 180, checkperiod: 60 });

// Translation function for news classification
async function translateToEnglish(text) {
  try {
    const key = process.env.GOOGLE_TRANSLATE_KEY;
    if (!key) return text; // Return original if no translation key
    
    const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`;
    const body = { q: [text], target: 'en', format: 'text' };
    
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!resp.ok) return text; // Return original if translation fails
    
    const data = await resp.json();
    const translation = data?.data?.translations?.[0]?.translatedText;
    return translation || text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original if translation fails
  }
}

function dedupeKey(it) {
  const base = (it.link || '').trim().toLowerCase();
  if (base) return `l:${base}`;
  const t = (it.title || '').trim().toLowerCase();
  const d = it.isoDate ? new Date(it.isoDate).getTime() : 0;
  return `t:${t}|d:${d}`;
}

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const limitNum = Math.max(1, Math.min(100, parseInt(req.query.limit || '30', 10)));
    const forceRefresh = req.query.force === '1' || req.query.force === 'true';
    const cacheKey = `news:${id}:${limitNum}`;

    if (!forceRefresh) {
      const hit = cache.get(cacheKey);
      if (hit) return res.json(hit);
    }

    const region = await Region.findById(id).lean();
    if (!region) return res.status(404).json({ error: 'Region not found' });

    let items = [];
    for (const f of region.feeds || []) {
      const arr = await fetchFeed(f.url);
      items.push(...arr);
    }

    const seen = new Set();
    items = items.filter(it => {
      const k = dedupeKey(it);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    // Translate and classify items
    const processedItems = [];
    for (const it of items) {
      try {
        // Translate title and summary to English for better classification
        const translatedTitle = await translateToEnglish(it.title || '');
        const translatedSummary = await translateToEnglish(it.summary || '');
        
        // Classify using translated text
        const category = classifyText(`${translatedTitle} ${translatedSummary}`);
        
        processedItems.push({
          ...it,
          category,
          translatedTitle, // Store translated title for display
          translatedSummary // Store translated summary for display
        });
      } catch (error) {
        console.error('Error processing news item:', error);
        // Fallback to original classification if translation fails
        processedItems.push({
          ...it,
          category: classifyText(`${it.title} ${it.summary}`)
        });
      }
    }
    
    items = processedItems
      .sort((a,b) => (new Date(b.isoDate||0)) - (new Date(a.isoDate||0)))
      .slice(0, limitNum);

    const payload = { regionId: id, dominantCategory: dominantCategory(items), count: items.length, items };
    if (!forceRefresh) cache.set(cacheKey, payload);
    res.json(payload);
  } catch (e) {
    console.error('news error', e);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

export default router;
