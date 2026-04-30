const router = require('express').Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');

// GET /api/registrations/my
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, e.title, e.date, e.time, e.venue, e.banner_url, e.category,
              e.status AS event_status, e.capacity, e.seats_available
       FROM registrations r JOIN events e ON r.event_id = e.id
       WHERE r.user_id = $1 ORDER BY r.registered_at DESC`,
      [req.user.id]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('My registrations error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/registrations/event/:eventId (admin)
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name, u.email, u.college, u.phone
       FROM registrations r JOIN users u ON r.user_id = u.id
       WHERE r.event_id = $1 ORDER BY r.registered_at DESC`,
      [req.params.eventId]
    );
    res.json(rows || []);
  } catch (err) {
    console.error('Event registrations error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/registrations/checkin — QR verify
router.post('/checkin', auth, async (req, res) => {
  try {
    const { qr_code_data } = req.body;
    if (!qr_code_data) return res.status(400).json({ message: 'QR code data is required.' });

    let decoded;
    try {
      decoded = JSON.parse(Buffer.from(qr_code_data, 'base64').toString('utf8'));
    } catch {
      return res.status(400).json({ message: 'Invalid QR code format.' });
    }

    const [regs] = await db.query(
      'SELECT * FROM registrations WHERE user_id=$1 AND event_id=$2',
      [decoded.userId, decoded.eventId]
    );
    if (!regs || regs.length === 0) return res.status(404).json({ message: 'Registration not found. Invalid QR code.' });

    const reg = regs[0];
    if (reg.checked_in) {
      const [users]  = await db.query('SELECT name, email FROM users WHERE id=$1', [decoded.userId]);
      const [events] = await db.query('SELECT title FROM events WHERE id=$1', [decoded.eventId]);
      return res.status(400).json({ message: 'Already checked in.', already_checked_in: true, user: users[0], event: events[0] });
    }

    await db.query('UPDATE registrations SET checked_in=TRUE WHERE id=$1', [reg.id]);
    const [users]  = await db.query('SELECT name, email, college FROM users WHERE id=$1', [decoded.userId]);
    const [events] = await db.query('SELECT title, date, venue FROM events WHERE id=$1', [decoded.eventId]);

    res.json({ message: 'Check-in successful!', user: users[0], event: events[0], registration_id: reg.id });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(400).json({ message: 'Invalid or expired QR code.' });
  }
});

// PUT /api/registrations/:id/checkin — manual toggle
router.put('/:id/checkin', auth, async (req, res) => {
  try {
    const { checked_in } = req.body;
    await db.query('UPDATE registrations SET checked_in=$1 WHERE id=$2', [checked_in ? true : false, req.params.id]);
    res.json({ message: 'Check-in status updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/registrations/:eventId — register (with PostgreSQL transaction)
router.post('/:eventId', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [events] = await conn.query('SELECT * FROM events WHERE id = $1', [req.params.eventId]);
    if (!events || events.length === 0) throw new Error('Event not found.');
    const event = events[0];
    if (event.status === 'cancelled') throw new Error('This event has been cancelled.');
    if (event.seats_available <= 0) throw new Error('Sorry, no seats are available for this event.');

    const [existing] = await conn.query(
      'SELECT id FROM registrations WHERE user_id=$1 AND event_id=$2',
      [req.user.id, req.params.eventId]
    );
    if (existing && existing.length > 0) throw new Error('You are already registered for this event.');

    const qrData = Buffer.from(JSON.stringify({
      userId: req.user.id, eventId: parseInt(req.params.eventId), timestamp: Date.now()
    })).toString('base64');

    const [inserted] = await conn.query(
      'INSERT INTO registrations (user_id, event_id, qr_code_data) VALUES ($1, $2, $3) RETURNING id',
      [req.user.id, req.params.eventId, qrData]
    );
    const registrationId = inserted[0].id;

    await conn.query('UPDATE events SET seats_available = seats_available - 1 WHERE id=$1', [req.params.eventId]);

    await conn.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [req.user.id, `You successfully registered for "${event.title}"! Show your QR pass at the entry gate.`, 'registration']
    );

    await conn.commit();

    // Non-blocking email attempt
    try {
      const { sendRegistrationEmail } = require('../utils/emailService');
      sendRegistrationEmail(req.user.email, req.user.name, event, qrData, registrationId).catch(() => {});
    } catch {}

    res.status(201).json({
      message: 'Registration successful! Your QR pass is ready.',
      qr_code_data: qrData,
      registration_id: registrationId,
      event_title: event.title
    });
  } catch (err) {
    await conn.rollback();
    console.error('Registration error:', err.message);
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
