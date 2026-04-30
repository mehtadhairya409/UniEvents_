const router = require('express').Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// GET /api/events — public list
router.get('/', async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT * FROM events WHERE status != 'cancelled' ORDER BY date ASC`
    );
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Server error fetching events.' });
  }
});

// GET /api/events/:id — public single event
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Event not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/events — admin create
router.post('/', auth, adminOnly, async (req, res) => {
  const { title, description, category, date, time, venue, capacity, banner_url, status } = req.body;
  if (!title || !date || !time || !venue || !capacity) {
    return res.status(400).json({ message: 'Title, date, time, venue, and capacity are required.' });
  }
  try {
    const cap = parseInt(capacity);
    const [inserted] = await db.query(
      `INSERT INTO events (title, description, category, date, time, venue, capacity, seats_available, banner_url, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
      [title, description || '', category || 'General', date, time, venue, cap, cap, banner_url || '', status || 'upcoming', req.user.id]
    );
    res.status(201).json({ message: 'Event created.', id: inserted[0].id });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/events/:id — admin update
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { title, description, category, date, time, venue, capacity, banner_url, status } = req.body;
  try {
    const cap = parseInt(capacity);
    // Recalculate seats_available: capacity - current registrations
    const [countRows] = await db.query(
      `SELECT COUNT(*) AS reg_count FROM registrations WHERE event_id = $1`, [req.params.id]
    );
    const regCount = parseInt(countRows[0]?.reg_count || 0, 10);
    const newSeatsAvailable = Math.max(0, cap - regCount);

    await db.query(
      `UPDATE events SET title=$1, description=$2, category=$3, date=$4, time=$5, venue=$6,
       capacity=$7, seats_available=$8, banner_url=$9, status=$10 WHERE id=$11`,
      [title, description || '', category, date, time, venue, cap, newSeatsAvailable, banner_url || '', status, req.params.id]
    );
    res.json({ message: 'Event updated.' });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/events/:id — admin soft-cancel (sets status = cancelled)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query(`UPDATE events SET status='cancelled' WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Event cancelled.' });
  } catch (err) {
    console.error('Cancel event error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/events/:id/permanent — admin hard delete (removes event + registrations)
router.delete('/:id/permanent', auth, adminOnly, async (req, res) => {
  try {
    // Delete associated registrations first (FK constraint)
    await db.query(`DELETE FROM registrations WHERE event_id = $1`, [req.params.id]);
    // Delete associated notifications that mention the event (optional clean-up)
    await db.query(`DELETE FROM notifications WHERE message LIKE $1`, [`%event_id:${req.params.id}%`]);
    // Hard delete the event
    const [, result] = await db.query(`DELETE FROM events WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }
    res.json({ message: 'Event permanently deleted.' });
  } catch (err) {
    console.error('Hard delete event error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
