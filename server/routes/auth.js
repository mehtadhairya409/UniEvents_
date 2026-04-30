const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET || 'unievent_super_secret_2025',
  { expiresIn: '7d' }
);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    // Check duplicate
    const [existing] = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing && existing.length > 0) return res.status(409).json({ message: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const [inserted] = await db.query(
      'INSERT INTO users (name, email, password, college, phone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [name.trim(), email.toLowerCase().trim(), hash, college || '', phone || '']
    );
    const insertedId = inserted[0].id;

    const [rows] = await db.query('SELECT id, name, email, role, college FROM users WHERE id = $1', [insertedId]);
    const user = rows[0];
    const token = signToken(user);

    // Welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1,$2,$3)',
      [user.id, `Welcome to UniEvents, ${user.name}! Start exploring upcoming events.`, 'info']
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, college: user.college }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (!rows || rows.length === 0) return res.status(401).json({ message: 'Invalid email or password.' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

    const token = signToken(user);
    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, college: user.college }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
