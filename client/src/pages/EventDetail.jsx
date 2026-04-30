import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEvent } from '../api/events';
import { registerForEvent, getMyRegistrations } from '../api/registrations';
import { useAuth } from '../context/AuthContext';
import QRPass from '../components/QRPass';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  Technical: '#4cc9f0', Cultural: '#ffb703', Workshop: '#f0a500',
  Sports: '#06d6a0', Academic: '#c084fc', General: '#adb5bd'
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [existingReg, setExistingReg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [qrData, setQrData] = useState('');
  const [regId, setRegId] = useState(null);


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await getEvent(id);
        setEvent(data);
      } catch { toast.error('Event not found.'); }
      finally { setLoading(false); }
    };
    fetchEvent();
    const interval = setInterval(fetchEvent, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user) return;
    getMyRegistrations().then(({ data }) => {
      const reg = data.find(r => r.event_id === parseInt(id));
      if (reg) { setRegistered(true); setExistingReg(reg); setQrData(reg.qr_code_data); setRegId(reg.id); }
    }).catch(() => {});
  }, [user, id]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegistering(true);
    try {
      const { data } = await registerForEvent(id);
      setQrData(data.qr_code_data);
      setRegId(data.registration_id);
      setRegistered(true);
      setShowModal(false);
      setShowPass(true);
      toast.success('🎉 Registration successful! Your QR pass is ready.');
      // Refresh event
      const { data: updated } = await getEvent(id);
      setEvent(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div style={{ paddingTop: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(240,165,0,0.2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading event...</p>
      </div>
    </div>
  );

  if (!event) return null;

  const fillPct = Math.round(((event.capacity - event.seats_available) / event.capacity) * 100);
  const catColor = CATEGORY_COLORS[event.category] || '#adb5bd';
  let formattedDate = '', formattedTime = '';
  try { formattedDate = event.date ? format(parseISO(event.date.split('T')[0]), 'EEEE, MMMM d, yyyy') : ''; } catch {}
  try {
    if (event.time) { const [h, m] = event.time.split(':'); const ampm = +h >= 12 ? 'PM' : 'AM'; formattedTime = `${+h % 12 || 12}:${m} ${ampm}`; }
  } catch {}

  return (
    <div style={{ paddingTop: '72px', minHeight: '100vh' }}>
      {/* QR Pass Success Screen */}
      {showPass && (
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(240,165,0,0.2)', padding: '60px 24px' }}>
          <div className="container-sm" style={{ textAlign: 'center' }}>
            <div className="animate-scale-in">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', color: 'var(--success)', marginBottom: '8px' }}>
                You're Registered!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '40px' }}>
                Your entry pass is ready. Show it at the gate. Check your email for a copy.
              </p>
              <QRPass qrData={qrData} event={event} registrationId={regId} userName={user?.name} />
            </div>
          </div>
        </div>
      )}

      {/* Banner */}
      <div style={{ position: 'relative', height: '400px', overflow: 'hidden' }}>
        <img
          src={event.banner_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(10,15,30,0.6) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '1280px', padding: '0 24px' }}>
          <nav style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)' }}>Home</Link> <span style={{ margin: '0 6px' }}>›</span>
            <Link to="/events" style={{ color: 'rgba(255,255,255,0.6)' }}>Events</Link> <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#fff' }}>{event.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
        {/* Left: Details */}
        <div className="animate-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{
              background: `${catColor}20`, color: catColor,
              border: `1px solid ${catColor}50`,
              padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase'
            }}>{event.category}</span>
            <span style={{
              background: event.status === 'upcoming' ? 'rgba(6,214,160,0.12)' : 'rgba(255,183,3,0.12)',
              color: event.status === 'upcoming' ? 'var(--success)' : 'var(--warning)',
              padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize',
              border: `1px solid ${event.status === 'upcoming' ? 'rgba(6,214,160,0.3)' : 'rgba(255,183,3,0.3)'}`
            }}>{event.status}</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '900', lineHeight: '1.2', marginBottom: '28px' }}>
            {event.title}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
            {[
              { icon: '📅', label: 'Date', value: formattedDate },
              { icon: '🕐', label: 'Time', value: formattedTime },
              { icon: '📍', label: 'Venue', value: event.venue },
              { icon: '👥', label: 'Capacity', value: `${event.capacity?.toLocaleString()} attendees` },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="divider" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '16px' }}>About this Event</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.8' }}>{event.description}</p>
        </div>

        {/* Right: Registration Card */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="glass-card animate-fade-up delay-2" style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
              Event Registration
            </h3>

            {/* Seat Counter */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '64px', fontWeight: '900',
                color: event.seats_available === 0 ? 'var(--danger)' :
                       event.seats_available < 20 ? 'var(--warning)' : 'var(--success)',
                lineHeight: '1'
              }}>
                {event.seats_available}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                seats remaining of {event.capacity}
              </div>
              {event.seats_available < 20 && event.seats_available > 0 && (
                <div style={{ marginTop: '10px', padding: '8px 16px', background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', borderRadius: '8px', color: 'var(--warning)', fontSize: '13px', fontWeight: '600', animation: 'pulse-glow 2s ease-in-out infinite' }}>
                  ⚡ Only {event.seats_available} seats left!
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>{fillPct}% filled</span>
                <span>{event.capacity - event.seats_available} registered</span>
              </div>
              <div className="progress-bar-container" style={{ height: '8px' }}>
                <div
                  className={`progress-bar-fill ${fillPct >= 90 ? 'critical' : fillPct >= 70 ? 'low' : 'plenty'}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {registered ? (
              <div>
                <div style={{ background: 'rgba(6,214,160,0.1)', border: '1px solid rgba(6,214,160,0.3)', borderRadius: '12px', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>✅</div>
                  <div style={{ color: 'var(--success)', fontWeight: '700', fontSize: '15px' }}>You're Registered!</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Reg #{String(existingReg?.id || regId || '').padStart(6, '0')}</div>
                </div>
                <button className="btn-primary btn-full" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🔼 Hide QR Pass' : '🎫 View QR Pass'}
                </button>
              </div>
            ) : (
              <button
                className="btn-primary btn-full"
                disabled={event.seats_available === 0}
                onClick={() => { if (!user) { navigate('/login'); } else { setShowModal(true); } }}
                style={event.seats_available === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : { fontSize: '16px', padding: '14px' }}
              >
                {event.seats_available === 0 ? '🚫 Event Full' : user ? '🎟️ Register Now' : '🔒 Login to Register'}
              </button>
            )}

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>✓ Instant QR entry pass</div>
                <div>✓ Email confirmation sent</div>
                <div>✓ Free registration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎟️</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>Confirm Registration</h2>
              <p style={{ color: 'var(--text-secondary)' }}>You're about to register for:</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>{event.title}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div>📅 {formattedDate}</div>
                <div>🕐 {formattedTime}</div>
                <div>📍 {event.venue}</div>
                <div style={{ color: event.seats_available < 20 ? 'var(--warning)' : 'var(--success)', fontWeight: '600', marginTop: '4px' }}>
                  💺 {event.seats_available} seats remaining
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleRegister} disabled={registering}>
                {registering ? 'Registering...' : '✅ Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EventDetail;
