const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// ── PostgreSQL Pool ────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

// ── Create tables (idempotent) ─────────────────────────────────
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT    NOT NULL,
      email      TEXT    UNIQUE NOT NULL,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'student',
      college    TEXT,
      phone      TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS events (
      id               SERIAL PRIMARY KEY,
      title            TEXT    NOT NULL,
      description      TEXT,
      category         TEXT    NOT NULL DEFAULT 'General',
      date             TEXT    NOT NULL,
      time             TEXT    NOT NULL,
      venue            TEXT    NOT NULL,
      capacity         INTEGER NOT NULL DEFAULT 100,
      seats_available  INTEGER NOT NULL DEFAULT 100,
      banner_url       TEXT,
      status           TEXT    NOT NULL DEFAULT 'upcoming',
      created_by       INTEGER REFERENCES users(id),
      created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      event_id      INTEGER NOT NULL REFERENCES events(id),
      qr_code_data  TEXT    NOT NULL,
      checked_in    BOOLEAN NOT NULL DEFAULT FALSE,
      registered_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      message    TEXT    NOT NULL,
      type       TEXT    NOT NULL DEFAULT 'info',
      is_read    BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ PostgreSQL tables ready.');

  // ── Seed: Admin user ──────────────────────────────────────────
  const adminCheck = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    ['admin@university.edu']
  );
  if (adminCheck.rowCount === 0) {
    const hash = await bcrypt.hash('password', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
      ['Admin User', 'admin@university.edu', hash, 'admin']
    );
    console.log('✅ Admin user seeded: admin@university.edu / password');
  }

  // ── Seed: Sample events ───────────────────────────────────────
  const eventsCheck = await pool.query('SELECT COUNT(*) AS c FROM events');
  if (parseInt(eventsCheck.rows[0].c, 10) === 0) {
    const adminRow = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@university.edu']
    );
    const adminId = adminRow.rows[0].id;

    const d = (offset) => {
      const dt = new Date(Date.now() + offset * 86400000);
      return dt.toISOString().split('T')[0];
    };

    const sampleEvents = [
      ['TechFest 2025 — National Hackathon', 'A 48-hour hackathon open to all engineering students. Build, innovate, and win exciting prizes across AI, Web3, and sustainability tracks.', 'Technical', d(5),  '09:00', 'Main Auditorium, Block A', 200, 153, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', 'upcoming', adminId],
      ['Cultural Night 2025',                'An evening of music, dance, drama, and art celebrating the diverse talent of our university students. Open to all.',                           'Cultural',  d(8),  '18:30', 'Open Air Theatre',            500, 312, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', 'upcoming', adminId],
      ['AI/ML Workshop — Hands-On Deep Learning', 'A practical 6-hour workshop covering neural networks, PyTorch, and deploying ML models. Bring your laptop.',                        'Workshop',  d(3),  '10:00', 'Computer Lab 3, Block B',     60,  8,   'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800', 'upcoming', adminId],
      ['Inter-College Cricket Tournament',   'Annual cricket championship featuring 16 teams from colleges across the district. Come cheer your team!',                                  'Sports',    d(12), '08:00', 'University Cricket Ground',   300, 247, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', 'upcoming', adminId],
      ['Research Symposium 2025',            'Present and publish your research. Topics include biotech, materials science, sustainability, and computer science.',                       'Academic',  d(15), '09:30', 'Conference Hall, Admin Block',150, 89,  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'upcoming', adminId],
    ];

    for (const ev of sampleEvents) {
      await pool.query(
        `INSERT INTO events (title, description, category, date, time, venue, capacity, seats_available, banner_url, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        ev
      );
    }
    console.log('✅ 5 sample events seeded.');
  }
};

// ── Adapter: same API surface as before ───────────────────────
// Routes call db.query(sql, params) and db.getConnection()
// We normalise the return shape to [rows, ...] to preserve existing route logic.
const adapter = {
  // Returns [rows] — same shape as before so routes stay unchanged
  query: async (sql, params = []) => {
    const result = await pool.query(sql, params);
    // For INSERT … RETURNING id we always return the rows array
    return [result.rows, result];
  },

  // Returns a connection-like object that supports manual transactions
  getConnection: async () => {
    const client = await pool.connect();
    let committed = false;

    const conn = {
      query: async (sql, params = []) => {
        const result = await client.query(sql, params);
        return [result.rows, result];
      },
      beginTransaction: () => client.query('BEGIN'),
      commit: async () => {
        await client.query('COMMIT');
        committed = true;
      },
      rollback: async () => {
        if (!committed) {
          try { await client.query('ROLLBACK'); } catch {}
        }
      },
      release: () => client.release(),
    };

    return conn;
  },
};

// Initialise DB on startup, then export the adapter
initDb().catch((err) => {
  console.error('❌ DB initialisation failed:', err.message);
  process.exit(1);
});

module.exports = adapter;
