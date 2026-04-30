-- ============================================================
-- UniEvents — PostgreSQL Schema
-- Compatible with: Supabase · Render · Railway · local psql
-- Run:  psql $DATABASE_URL -f schema.sql
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        UNIQUE NOT NULL,
  password   TEXT        NOT NULL,
  role       TEXT        NOT NULL DEFAULT 'student'
               CHECK (role IN ('student', 'admin')),
  college    TEXT,
  phone      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id               SERIAL PRIMARY KEY,
  title            TEXT        NOT NULL,
  description      TEXT,
  category         TEXT        NOT NULL DEFAULT 'General',
  date             TEXT        NOT NULL,
  time             TEXT        NOT NULL,
  venue            TEXT        NOT NULL,
  capacity         INTEGER     NOT NULL DEFAULT 100,
  seats_available  INTEGER     NOT NULL DEFAULT 100,
  banner_url       TEXT,
  status           TEXT        NOT NULL DEFAULT 'upcoming'
                     CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_by       INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Registrations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS registrations (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  event_id      INTEGER     NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  qr_code_data  TEXT        NOT NULL,
  checked_in    BOOLEAN     NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

-- ── Notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'info',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Performance indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_status         ON events (status);
CREATE INDEX IF NOT EXISTS idx_events_date           ON events (date);
CREATE INDEX IF NOT EXISTS idx_registrations_user    ON registrations (user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event   ON registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (user_id, is_read);

-- ============================================================
-- SEED DATA  (safe to run multiple times — uses ON CONFLICT DO NOTHING)
-- ============================================================

-- Admin user  (password = "password", bcrypt rounds=10)
INSERT INTO users (name, email, password, role, college)
VALUES (
  'Admin User',
  'admin@university.edu',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'University Admin'
)
ON CONFLICT (email) DO NOTHING;

-- Sample events (seeded only when the events table is empty)
INSERT INTO events
  (title, description, category, date, time, venue, capacity, seats_available, banner_url, status, created_by)
SELECT
  ev.title, ev.description, ev.category, ev.date, ev.time,
  ev.venue, ev.capacity::INTEGER, ev.seats_available::INTEGER,
  ev.banner_url, ev.status, u.id
FROM (VALUES
  (
    'TechFest 2025 — National Hackathon',
    'A 48-hour hackathon open to all engineering students. Build, innovate, and win exciting prizes across AI, Web3, and sustainability tracks.',
    'Technical', '2025-09-15', '09:00',
    'Main Auditorium, Block A', '200', '153',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    'upcoming'
  ),
  (
    'Cultural Night 2025',
    'An evening of music, dance, drama, and art celebrating the diverse talent of our university students. Open to all.',
    'Cultural', '2025-09-20', '18:30',
    'Open Air Theatre', '500', '312',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
    'upcoming'
  ),
  (
    'AI/ML Workshop — Hands-On Deep Learning',
    'A practical 6-hour workshop covering neural networks, PyTorch, and deploying ML models. Bring your laptop.',
    'Workshop', '2025-09-10', '10:00',
    'Computer Lab 3, Block B', '60', '8',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    'upcoming'
  ),
  (
    'Inter-College Cricket Tournament',
    'Annual cricket championship featuring 16 teams from colleges across the district. Come cheer your team!',
    'Sports', '2025-09-25', '08:00',
    'University Cricket Ground', '300', '247',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
    'upcoming'
  ),
  (
    'Research Symposium 2025',
    'Present and publish your research. Topics include biotech, materials science, sustainability, and computer science.',
    'Academic', '2025-10-01', '09:30',
    'Conference Hall, Admin Block', '150', '89',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    'upcoming'
  )
) AS ev(title, description, category, date, time, venue, capacity, seats_available, banner_url, status)
JOIN users u ON u.email = 'admin@university.edu'
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);
