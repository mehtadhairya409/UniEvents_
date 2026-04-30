const router = require('express').Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

router.use(auth, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [te]  = await db.query(`SELECT COUNT(*) AS total_events FROM events WHERE status != 'cancelled'`);
    const [tr]  = await db.query(`SELECT COUNT(*) AS total_registrations FROM registrations`);
    const [tc]  = await db.query(`SELECT COUNT(*) AS total_checkins FROM registrations WHERE checked_in = TRUE`);
    const [cap] = await db.query(`SELECT SUM(capacity) AS total_capacity, SUM(capacity - seats_available) AS seats_filled FROM events WHERE status != 'cancelled'`);

    const [top_events] = await db.query(
      `SELECT e.title, e.category, COUNT(r.id) AS registration_count, e.capacity
       FROM events e LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id ORDER BY registration_count DESC LIMIT 5`
    );
    const [daily_registrations] = await db.query(
      `SELECT DATE(registered_at) AS date, COUNT(*) AS count
       FROM registrations
       WHERE registered_at >= NOW() - INTERVAL '14 days'
       GROUP BY DATE(registered_at) ORDER BY date ASC`
    );
    const [recent_registrations] = await db.query(
      `SELECT r.id, u.name, u.email, e.title AS event_title, r.registered_at
       FROM registrations r
       JOIN users u ON r.user_id = u.id
       JOIN events e ON r.event_id = e.id
       ORDER BY r.registered_at DESC LIMIT 10`
    );

    const teRow  = te[0];
    const trRow  = tr[0];
    const tcRow  = tc[0];
    const capRow = cap[0];

    res.json({
      total_events:         parseInt(teRow?.total_events  || 0, 10),
      total_registrations:  parseInt(trRow?.total_registrations || 0, 10),
      total_checkins:       parseInt(tcRow?.total_checkins || 0, 10),
      fill_percentage: capRow?.total_capacity
        ? Math.round((parseInt(capRow.seats_filled, 10) / parseInt(capRow.total_capacity, 10)) * 100)
        : 0,
      top_events:            top_events            || [],
      daily_registrations:   daily_registrations   || [],
      recent_registrations:  recent_registrations  || [],
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Error fetching stats.', error: err.message });
  }
});

// GET /api/admin/events
router.get('/events', async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*,
         COUNT(r.id) AS registration_count,
         ROUND(((e.capacity - e.seats_available)::NUMERIC / e.capacity) * 100) AS fill_percentage
       FROM events e LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id ORDER BY e.created_at DESC`
    );
    res.json(events || []);
  } catch (err) {
    console.error('Admin events error:', err);
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, college, phone, created_at,
         (SELECT COUNT(*) FROM registrations WHERE user_id = users.id) AS registration_count
       FROM users ORDER BY created_at DESC`
    );
    res.json(users || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
