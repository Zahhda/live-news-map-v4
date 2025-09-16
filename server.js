// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// ---- Routers & middleware ----
import authRouter from './src/routes/auth.js';
import adminRouter from './src/routes/admin.js';
import adminUsersRouter from './src/routes/adminUsers.js';
import adminRegionsRouter from './src/routes/adminRegions.js';
import regionsRouter from './src/routes/regions.js';
import newsRouter from './src/routes/news.js';
import translateRouter from './src/routes/translate.js';
import readLaterRouter from './src/routes/readLater.js'; // if you have it
import regionRequestsRouter from './src/routes/regionRequests.js';
import locationRouter from './src/routes/location.js';
import rssValidationRouter from './src/routes/rssValidation.js';
import { authRequired, adminRequired } from './src/middleware/auth.js';
import { ensureSeedAdmin } from './src/utils/seedAdmin.js';

// Store active SSE connections for real-time notifications
const sseConnections = new Map();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- Healthcheck (for platforms) ----
app.get('/health', (_req, res) => res.status(200).send('ok'));

// ---- Logging (don’t crash if morgan missing) ----
try { app.use(morgan('dev')); } catch { /* noop */ }

// ---- Core middleware ----
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// If you ever set secure cookies behind Railway’s proxy:
app.set('trust proxy', 1);

// ---- Mongo (require env var in prod; fail fast if missing/unreachable) ----
const isProd = process.env.NODE_ENV === 'production';
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  if (isProd) {
    console.error('❌ Missing MONGODB_URI env var (required in production).');
    process.exit(1);
  } else {
    // Local dev fallback only
    MONGODB_URI = 'mongodb://127.0.0.1:27017/live_news_map';
  }
}

// Start the server
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if DB is unreachable
    });
    console.log('✅ MongoDB connected');

    // Ensure an admin user exists
    await ensureSeedAdmin();

// ---- Static files ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- APIs ----
app.get('/api/config', (_req, res) => {
  res.json({ mapsKey: process.env.GOOGLE_MAPS_API_KEY || '' });
});

app.use('/api/auth', authRouter);
app.use('/api/translate', translateRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/regions', adminRegionsRouter);
app.use('/api/regions', regionsRouter);
app.use('/api/news', newsRouter);
app.use('/api/account/readlater', readLaterRouter); // optional if present
app.use('/api/region-requests', regionRequestsRouter);
app.use('/api/location', locationRouter);
app.use('/api/rss-validation', rssValidationRouter);

// ---- Real-time Notifications (SSE) ----
// SSE endpoint for real-time notifications
app.get('/api/notifications/stream', authRequired, (req, res) => {
  const userId = req.user.id;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Store connection
  sseConnections.set(userId, res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time notifications enabled' })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    sseConnections.delete(userId);
  });
});


// ---- UI routes ----
app.get('/admin', adminRequired, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/admin/users', adminRequired, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-users.html'));
});
app.get('/account', authRequired, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'account.html'));
});
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

    // ---- Networking: bind 0.0.0.0 and Railway PORT ----
    const PORT = process.env.PORT || 8080; // Railway injects PORT
    const HOST = process.env.HOST || '0.0.0.0';

    // Start server with a handle so we can close gracefully
    const server = app.listen(PORT, HOST, () => {
      console.log(`Live News Map running on http://${HOST}:${PORT}`);
    });

    // ---- Graceful shutdown & hard-fail on unhandled rejects ----
    const shutdown = async (signal) => {
      try {
        console.log(`${signal} received, closing HTTP server...`);
        await new Promise((resolve) => server.close(resolve));
        await mongoose.connection.close();
        console.log('✅ Clean shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
    };

    ['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => shutdown(sig)));

    process.on('unhandledRejection', (err) => {
      console.error('UnhandledRejection:', err);
      // Exit so Railway restarts the app into a clean state
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Function to send notification to specific user
export function sendNotificationToUser(userId, notification) {
  const connection = sseConnections.get(userId);
  if (connection) {
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch (error) {
      console.error('Error sending notification:', error);
      sseConnections.delete(userId);
    }
  }
}

// Function to broadcast notification to all connected users
export function broadcastNotification(notification) {
  sseConnections.forEach((connection, userId) => {
    try {
      connection.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      sseConnections.delete(userId);
    }
  });
}
