import React from 'react';

/* ── Tab icons (SVG) ────────────────────────────────── */
const OverviewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const EventsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const RegsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const ScanIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 7 23 1 17 1"/><line x1="16" y1="8" x2="23" y2="1"/>
    <polyline points="1 17 1 23 7 23"/><line x1="8" y1="16" x2="1" y2="23"/>
    <polyline points="23 17 23 23 17 23"/><line x1="16" y1="16" x2="23" y2="23"/>
    <polyline points="1 7 1 1 7 1"/><line x1="8" y1="8" x2="1" y2="1"/>
  </svg>
);

const TABS = [
  { id: 'overview',      label: 'Overview',     Icon: OverviewIcon },
  { id: 'events',        label: 'Events',        Icon: EventsIcon   },
  { id: 'registrations', label: 'Registrations', Icon: RegsIcon     },
  { id: 'scanner',       label: 'QR Scanner',    Icon: ScanIcon     },
];

const AdminSidebar = ({ activeTab, onTabChange }) => (
  <>
    {/* ── DESKTOP sidebar (shown ≥ 1025px) ── */}
    <aside className="admin-sidebar-wrap" style={{
      width: '240px', flexShrink: 0,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '24px 16px',
      height: 'fit-content',
      position: 'sticky',
      top: '90px',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ marginBottom: '24px', paddingLeft: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
          Admin Panel
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 16px', borderRadius: '12px',
              background: activeTab === id ? 'var(--accent-dim)' : 'transparent',
              border: activeTab === id ? '1px solid var(--border-accent)' : '1px solid transparent',
              color: activeTab === id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'left', fontSize: '14px',
              fontWeight: activeTab === id ? '700' : '500',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={e => {
              if (activeTab !== id) {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ flexShrink: 0 }}><Icon /></span>
            {label}
          </button>
        ))}
      </nav>

      {/* Admin access badge */}
      <div style={{
        marginTop: '32px', padding: '16px',
        background: 'var(--accent-dim)', borderRadius: '12px',
        border: '1px solid var(--border-accent)'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '800', marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Admin Access
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.55', fontStyle: 'italic' }}>
          Full control over events, registrations, and analytics.
        </div>
      </div>
    </aside>

    {/* ── MOBILE horizontal tab bar (shown ≤ 1024px) ── */}
    <div className="admin-tab-bar" style={{
      display: 'none', // shown via CSS
      overflowX: 'auto',
      gap: '6px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '8px',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch',
    }}>
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className="admin-tab-btn"
          onClick={() => onTabChange(id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 14px', borderRadius: '10px', whiteSpace: 'nowrap',
            background: activeTab === id ? 'var(--accent-dim)' : 'transparent',
            border: activeTab === id ? '1px solid var(--border-accent)' : '1px solid transparent',
            color: activeTab === id ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.2s',
            fontSize: '13px', fontWeight: activeTab === id ? '700' : '500',
            fontFamily: 'var(--font-body)', flexShrink: 0,
          }}
        >
          <span className="admin-tab-icon"><Icon /></span>
          {label}
        </button>
      ))}
    </div>

    <style>{`
      @media (max-width: 1024px) {
        .admin-sidebar-wrap { display: none !important; }
        .admin-tab-bar { display: flex !important; }
      }
    `}</style>
  </>
);

export default AdminSidebar;
