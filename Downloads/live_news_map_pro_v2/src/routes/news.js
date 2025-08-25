// src/routes/news.js
import express from 'express';
import Region from '../models/Region.js';
import { fetchFeed } from '../utils/rss.js';
import { classifyText, dominantCategory } from '../utils/classify.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 180, checkperiod: 60 }); // 3 min

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit || '60', 10), 200);
  const force = req.query.force === '1'; // allow cache bypass

  const cacheKey = `news:${id}:${limit}`;
  if (!force) {
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);
  }

  const region = await Region.findById(id).lean();
  if (!region) return res.status(404).json({ error: 'Region not found' });

  const results = await Promise.allSettled((region.feeds || []).map(f => fetchFeed(f.url)));
  let items = [];
  for (const r of results) if (r.status === 'fulfilled') items = items.concat(r.value);

  items = items
    .map(it => ({ ...it, category: classifyText(it.title) }))
    .sort((a, b) => (new Date(b.isoDate || 0)) - (new Date(a.isoDate || 0)))
    .slice(0, limit);

  const dom = dominantCategory(items); // retained for API completeness
  const payload = { regionId: id, dominantCategory: dom, count: items.length, items };

  if (!force) cache.set(cacheKey, payload);
  return res.json(payload);
});

export default router;
