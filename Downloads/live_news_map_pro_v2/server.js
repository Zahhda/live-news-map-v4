import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Logging
try {
  app.use(morgan('dev'));
} catch {}

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mongo
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/live_news_map';
await mongoose.connect(MONGODB_URI);
console.log('✅ MongoDB connected');

// Routes
import regionsRouter from './src/routes/regions.js';
import newsRouter from './src/routes/news.js';
import translateRouter from './src/routes/translate.js';
import adminRouter from './src/routes/admin.js';

app.use('/api/regions', regionsRouter);
app.use('/api/news', newsRouter);
app.use('/api/translate', translateRouter);
app.use('/api/admin', adminRouter);

// Config for client (maps key, other flags)
app.get('/api/config', (req, res) => {
  res.json({
    mapsKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin UI
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '127.0.0.1';

app.listen(PORT, HOST, () => {
  const hostShown = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`Live News Map running on http://${hostShown}:${PORT}`);
});
