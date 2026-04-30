const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// In production, frontend is served by Express itself — CORS only needed in dev
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
} else {
  // Allow same-origin requests in production (React served by this server)
  app.use(cors({ credentials: true }));
}

app.use(express.json());

// Initialize DB — creates tables + seeds data on first run (PostgreSQL)
require('./db/connection');

// API Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/events',        require('./routes/events'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: 'connected', engine: 'PostgreSQL', timestamp: new Date().toISOString() });
});

// ── Serve React frontend in production ──────────────────────────
const frontendBuild = path.join(__dirname, 'public');
app.use(express.static(frontendBuild));

// All non-API routes → serve React index.html (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 UniEvents running on http://localhost:${PORT}`);
  console.log(`📚 API:      http://localhost:${PORT}/api`);
  console.log(`💾 Database: PostgreSQL (Supabase/Render)`);
  console.log(`🌐 Frontend: served from /public\n`);
});
