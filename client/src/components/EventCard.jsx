import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const CATEGORY_COLORS = {
  Technical: { bg: 'rgba(74,158,255,0.12)',  color: '#4a9eff', border: 'rgba(74,158,255,0.28)' },
  Cultural:  { bg: 'rgba(245,166,35,0.12)',  color: '#f5a623', border: 'rgba(245,166,35,0.28)' },
  Workshop:  { bg: 'rgba(200,147,90,0.14)',  color: 'var(--accent)', border: 'var(--border-accent)' },
  Sports:    { bg: 'rgba(62,207,142,0.12)',  color: '#3ecf8e', border: 'rgba(62,207,142,0.28)' },
  Academic:  { bg: 'rgba(168,85,247,0.12)',  color: '#c084fc', border: 'rgba(168,85,247,0.28)' },
  General:   { bg: 'rgba(153,153,153,0.08)', color: '#999',    border: 'rgba(153,153,153,0.18)' },
};

const getSeatStatus = (available, capacity) => {
  if (available === 0) return { label: 'FULL', cls: 'seat-badge-full', barClass: 'critical' };
  const pct = (available / capacity) * 100;
  if (pct <= 10) return { label: `${available} left`,  cls: 'seat-badge-critical', barClass: 'critical' };
  if (pct <= 30) return { label: `${available} seats`, cls: 'seat-badge-low',      barClass: 'low' };
  return              { label: `${available} seats`, cls: 'seat-badge-plenty',   barClass: 'plenty' };
};

/* ── SVG Icons ─────────────────────────────────────── */
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const EventCard = memo(({ event, index = 0 }) => {
  const navigate = useNavigate();
  const seatStatus = getSeatStatus(event.seats_available, event.capacity);
  const fillPct = Math.round(((event.capacity - event.seats_available) / event.capacity) * 100);
  const catStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.General;

  let formattedDate = '';
  try {
    const d = event.date ? parseISO(event.date.split('T')[0]) : null;
    formattedDate = d ? format(d, 'EEE, MMM d, yyyy') : '';
  } catch { formattedDate = event.date || ''; }

  let formattedTime = '';
  try {
    if (event.time) {
      const [h, m] = event.time.split(':');
      const ampm = +h >= 12 ? 'PM' : 'AM';
      formattedTime = `${+h % 12 || 12}:${m} ${ampm}`;
    }
  } catch { formattedTime = event.time || ''; }

  return (
    <div
      className="animate-fade-up"
      style={{
        animationDelay: `${index * 0.08}s`, opacity: 0,
        borderRadius: '20px', overflow: 'hidden',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column', cursor: 'pointer'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Banner Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={event.banner_url || `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800`}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'; }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`,
          backdropFilter: 'blur(8px)', padding: '4px 13px', borderRadius: '20px',
          fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase'
        }}>
          {event.category || 'General'}
        </div>

        {/* Status badge */}
        {event.status && event.status !== 'upcoming' && (
          <div style={{
            position: 'absolute', top: '14px', left: '14px',
            background: event.status === 'ongoing' ? 'rgba(62,207,142,0.2)' : 'rgba(229,83,75,0.2)',
            color: event.status === 'ongoing' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${event.status === 'ongoing' ? 'rgba(62,207,142,0.4)' : 'rgba(229,83,75,0.4)'}`,
            backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '20px',
            fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {event.status === 'ongoing' ? '● Live' : event.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700',
          lineHeight: '1.3', color: 'var(--text-primary)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <CalIcon />
            <span>{formattedDate}</span>
            {formattedTime && <><span style={{ opacity: 0.3 }}>•</span><ClockIcon /><span>{formattedTime}</span></>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <PinIcon />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Seat Progress */}
        <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.3px' }}>
              Capacity: {event.capacity?.toLocaleString()}
            </span>
            <span className={seatStatus.cls} style={{ fontSize: '12px', letterSpacing: '0.3px' }}>
              {seatStatus.label}
            </span>
          </div>
          <div className="progress-bar-container">
            <div className={`progress-bar-fill ${seatStatus.barClass}`} style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {/* CTA */}
        <button
          className={event.seats_available === 0 ? 'btn-ghost btn-full' : 'btn-primary btn-full'}
          disabled={event.seats_available === 0}
          onClick={e => {
            e.stopPropagation();
            if (event.seats_available > 0) navigate(`/events/${event.id}`);
          }}
          style={event.seats_available === 0 ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
        >
          {event.seats_available === 0 ? 'Event Full' : 'Register Now'}
        </button>
      </div>
    </div>
  );
});

export default EventCard;
