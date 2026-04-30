const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

// Create transporter — gracefully handle missing config
let transporter = null;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS &&
      process.env.EMAIL_USER !== 'youremail@gmail.com') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('📧 Email service configured.');
  } else {
    console.log('📧 Email service not configured (optional). Skipping email features.');
  }
} catch (err) {
  console.log('📧 Email service setup failed (optional):', err.message);
}

const sendWelcomeEmail = async (email, name) => {
  if (!transporter) return;
  await transporter.sendMail({
    from: `"UniEvents" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎓 Welcome to University Events Platform!',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #f8f9fa; padding: 40px; border-radius: 16px; border: 1px solid rgba(240,165,0,0.2);">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 48px;">🎓</span>
          <h1 style="color: #f0a500; font-size: 28px; margin: 16px 0 8px;">Welcome, ${name}!</h1>
          <p style="color: #adb5bd; font-size: 16px;">You're now part of the UniEvents community.</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(240,165,0,0.2); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <p style="color: #f8f9fa;">Browse upcoming events, register in one click, and get your digital QR entry pass — all in one place.</p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.CLIENT_URL}/events"
             style="background: linear-gradient(135deg, #f0a500, #ffd166); color: #0a0f1e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
            Browse Events →
          </a>
        </div>
        <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 32px;">University Event Management System</p>
      </div>
    `
  });
};

const sendRegistrationEmail = async (email, name, event, qrData, registrationId) => {
  if (!transporter) return;

  const qrImageUrl = await QRCode.toDataURL(qrData, { width: 250 });
  const base64Data = qrImageUrl.split(',')[1];

  const eventDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  await transporter.sendMail({
    from: `"UniEvents" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎫 Registration Confirmed: ${event.title}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1e; color: #f8f9fa; padding: 40px; border-radius: 16px; border: 1px solid rgba(240,165,0,0.2);">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 48px;">🎉</span>
          <h1 style="color: #f0a500; font-size: 26px; margin: 16px 0 8px;">Registration Confirmed!</h1>
          <p style="color: #adb5bd;">Hi ${name}, you're all set!</p>
        </div>

        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(240,165,0,0.3); border-radius: 12px; padding: 28px; margin: 24px 0;">
          <h2 style="color: #ffd166; font-size: 20px; margin: 0 0 20px;">${event.title}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #adb5bd; padding: 6px 0;">📅 Date</td><td style="color: #f8f9fa; font-weight: 600;">${eventDate}</td></tr>
            <tr><td style="color: #adb5bd; padding: 6px 0;">🕐 Time</td><td style="color: #f8f9fa; font-weight: 600;">${event.time}</td></tr>
            <tr><td style="color: #adb5bd; padding: 6px 0;">📍 Venue</td><td style="color: #f8f9fa; font-weight: 600;">${event.venue}</td></tr>
            <tr><td style="color: #adb5bd; padding: 6px 0;">🎫 Reg. ID</td><td style="color: #f0a500; font-weight: 700; font-family: monospace;">#${String(registrationId).padStart(6, '0')}</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <p style="color: #adb5bd; margin-bottom: 16px;">📱 Show this QR code at the entry gate:</p>
          <img src="cid:qrcode" alt="Entry QR Code"
               style="width: 200px; height: 200px; border-radius: 12px; border: 3px solid #f0a500; padding: 8px; background: #fff;"/>
          <p style="color: #f0a500; font-size: 13px; font-weight: 700; letter-spacing: 2px; margin-top: 12px;">SCAN AT ENTRY</p>
        </div>

        <div style="background: rgba(6,214,160,0.1); border: 1px solid rgba(6,214,160,0.3); border-radius: 8px; padding: 16px; text-align: center;">
          <p style="color: #06d6a0; margin: 0; font-size: 14px;">✅ Please arrive 15 minutes before the event starts.</p>
        </div>

        <p style="color: #6c757d; font-size: 12px; text-align: center; margin-top: 32px;">University Event Management System</p>
      </div>
    `,
    attachments: [{
      filename: 'entry-qr-pass.png',
      content: base64Data,
      encoding: 'base64',
      cid: 'qrcode'
    }]
  });
};

module.exports = { sendWelcomeEmail, sendRegistrationEmail };
