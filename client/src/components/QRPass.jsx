import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';

const QRPass = ({ qrData, event, registrationId, userName }) => {
  const passRef = useRef(null);

  const handleDownload = async () => {
    if (!passRef.current) return;
    try {
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: '#0d1529',
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `entry-pass-${registrationId || 'pass'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
    }
  };

  const handlePrint = () => window.print();

  let formattedDate = '';
  try {
    formattedDate = event?.date ? format(parseISO(event.date.split('T')[0]), 'EEE, MMM d, yyyy') : '';
  } catch { formattedDate = event?.date || ''; }

  let formattedTime = '';
  try {
    if (event?.time) {
      const [h, m] = event.time.split(':');
      const ampm = +h >= 12 ? 'PM' : 'AM';
      formattedTime = `${+h % 12 || 12}:${m} ${ampm}`;
    }
  } catch { formattedTime = event?.time || ''; }

  const regId = registrationId ? `#${String(registrationId).padStart(6, '0')}` : '';

  return (
    <div id="qr-pass-print">
      {/* The Pass Card */}
      <div
        ref={passRef}
        style={{
          background: '#0d1529',
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '420px',
          margin: '0 auto',
          position: 'relative',
          boxShadow: '0 0 0 2px #f0a500, 0 24px 60px rgba(0,0,0,0.5), 0 0 60px rgba(240,165,0,0.15)',
          fontFamily: 'DM Sans, sans-serif'
        }}
      >
        {/* Top Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', background: 'linear-gradient(135deg, #f0a500, #ffd166)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
            }}>🎓</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', color: '#f8f9fa' }}>UniEvents</span>
          </div>
          <div style={{
            display: 'inline-block', padding: '4px 16px', borderRadius: '20px',
            background: 'rgba(240,165,0,0.12)', border: '1px solid rgba(240,165,0,0.3)',
            color: '#f0a500', fontSize: '11px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase'
          }}>
            ✦ ENTRY PASS ✦
          </div>
        </div>

        {/* Event Title */}
        <h2 style={{
          fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: '700',
          textAlign: 'center', color: '#f8f9fa', lineHeight: '1.3',
          margin: '0 0 24px', padding: '0 8px'
        }}>
          {event?.title || 'Event'}
        </h2>

        {/* Details Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '14px',
          padding: '16px', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <DetailItem icon="📅" label="Date" value={formattedDate || '—'} />
          <DetailItem icon="🕐" label="Time" value={formattedTime || '—'} />
          <DetailItem icon="📍" label="Venue" value={event?.venue || '—'} />
        </div>

        {/* Dashed Divider */}
        <div style={{ position: 'relative', margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, borderTop: '2px dashed rgba(240,165,0,0.4)' }} />
          <div style={{ fontSize: '18px', color: 'rgba(240,165,0,0.6)', flexShrink: 0 }}>✂</div>
          <div style={{ flex: 1, borderTop: '2px dashed rgba(240,165,0,0.4)' }} />
        </div>

        {/* QR Code */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: '#ffffff',
            padding: '16px', borderRadius: '16px',
            boxShadow: '0 0 0 3px rgba(240,165,0,0.4), 0 8px 32px rgba(0,0,0,0.4)'
          }}>
            <QRCodeSVG
              value={qrData || 'INVALID'}
              size={180}
              fgColor="#0a0f1e"
              bgColor="#ffffff"
              level="M"
            />
          </div>

          <div style={{ marginTop: '16px', color: '#f0a500', fontSize: '12px', fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase' }}>
            SCAN AT ENTRY
          </div>

          {userName && (
            <div style={{ marginTop: '8px', color: '#adb5bd', fontSize: '14px', fontWeight: '500' }}>
              {userName}
            </div>
          )}

          {regId && (
            <div style={{
              marginTop: '8px', fontFamily: 'Courier New, monospace',
              fontSize: '16px', fontWeight: '700', color: '#ffd166',
              letterSpacing: '2px'
            }}>
              {regId}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
        <button className="btn-primary" onClick={handleDownload}>
          ⬇️ Download Pass
        </button>
        <button className="btn-ghost" onClick={handlePrint}>
          🖨️ Print
        </button>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
    <div style={{ fontSize: '10px', color: '#6c757d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '11px', color: '#f8f9fa', fontWeight: '600', lineHeight: '1.3', wordBreak: 'break-word' }}>{value}</div>
  </div>
);

export default QRPass;
