# 🎓 UniEvents — University Event Management System

A production-grade, full-stack hackathon project with **React.js**, **Node.js + Express**, and **MySQL**.

---

## ⚡ Quick Start

### 1. MySQL Setup
Open MySQL Workbench (or CLI) and run:
```bash
mysql -u root -p < server/db/schema.sql
```

### 2. Backend Setup
```bash
cd server
npm install

# Edit .env — set your MySQL password:
# DB_PASS=yourpassword

node server.js
# ✅ Server runs at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
# ✅ App opens at http://localhost:3000
```

---

## 🔑 Default Credentials

| Role    | Email                    | Password   |
|---------|--------------------------|------------|
| Admin   | admin@university.edu     | password   |
| Student | Register a new account   | any 6+ chars |

---

## 🎯 90-Second Demo Flow

1. **Landing page** → animated hero, stats count up, featured events
2. **Events page** → search, filter by category, live seat counters
3. **Register for event** → confirm modal → QR pass appears on screen
4. **Login as admin** → dashboard with charts (real data from DB)
5. **QR Scanner tab** → paste QR data → "Entry Granted ✅"

---

## 🗂️ Project Structure

```
BYTE-FORGE/
├── server/
│   ├── server.js           # Express entry point
│   ├── .env                # Configuration (edit this!)
│   ├── db/
│   │   ├── connection.js   # MySQL2 pool
│   │   └── schema.sql      # Full schema + seed data
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   └── adminOnly.js    # Admin role guard
│   ├── routes/
│   │   ├── auth.js         # POST /register, /login
│   │   ├── events.js       # CRUD events
│   │   ├── registrations.js # Register, checkin, QR
│   │   ├── admin.js        # Stats, admin views
│   │   └── notifications.js # User notifications
│   └── utils/
│       ├── emailService.js  # Nodemailer (optional)
│       └── qrGenerator.js   # QR code utility
└── client/
    └── src/
        ├── api/            # Axios API modules
        ├── context/        # Auth context
        ├── components/     # Reusable UI components
        ├── pages/          # Route pages
        └── styles/         # Global CSS design system
```

---

## 📧 Optional: Email Setup

Edit `server/.env`:
```
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password  # From Google Account → App Passwords
```

Emails work **without** this configured — registration still succeeds.

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWT tokens expire in **7 days**
- Seat reservation uses **MySQL transactions with FOR UPDATE lock** to prevent race conditions
- Change the default admin password after first login
