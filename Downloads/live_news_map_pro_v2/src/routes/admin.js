import express from 'express';
import Region from '../models/Region.js';

const router = express.Router();

router.use((req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// Create region
router.post('/regions', async (req, res) => {
  try {
    const region = new Region(req.body);
    await region.save();
    res.json(region);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// List regions (reuse public one? here returns with feeds)
router.get('/regions', async (req, res) => {
  const regions = await Region.find({}).sort({ country:1, name:1 }).lean();
  res.json(regions);
});

// Update region
router.put('/regions/:id', async (req, res) => {
  try {
    const updated = await Region.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Delete region
router.delete('/regions/:id', async (req, res) => {
  try {
    await Region.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
