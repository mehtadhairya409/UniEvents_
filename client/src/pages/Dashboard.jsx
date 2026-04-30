import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRegistrations } from '../api/registrations';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notifications';
import QRPass from '../components/QRPass';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [regsRes, notifRes] = await Promise.all([getMyRegistrations(), getNotifications()]);
        setRegistrations(regsRes.data);
        setNotifications(notifRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const checkedInCount = registrations.filter(r => r.checked_in).length;

  const TABS = [
    { id: 'events', label: 'My Events', count: registrations.length },
    { id: 'notifications', label: 'Notifications', count: unreadCount },
    { id: 'profile', label: 'Profile' },
  ];

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '900',
              fontStyle: 'italic', color: '#fff',
              boxShadow: 'var(--shadow-btn)'
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '700', marginBottom: '4px' }}>
                Welcome, {user?.name?.split(' ')[0]}!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                {user?.college && `${user.college} • `}{user?.email}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '20px' }}>
              {[
                { label: 'Registered', value: registrations.length, color: 'var(--accent)' },
                { label: 'Attended', value: checkedInCount, color: 'var(--success)' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 20px', background: 'none', border: 'none',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                marginBottom: '-1px'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'var(--accent-dim)' : 'var(--bg-card)',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                  padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '700'
                }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* MY EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="animate-fade-up">
            {loading ? <LoadingSkeleton type="row" count={3} /> : (
              registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                  <div style={{
                    width: '68px', height: '68px', borderRadius: '18px',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', color: 'var(--text-muted)'
                  }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '12px' }}>No events yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>You haven't registered for any events.</p>
                  <Link to="/events"><button className="btn-primary">Browse Events →</button></Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {registrations.map((reg, i) => {
                    let fd = ''; try { fd = reg.date ? format(parseISO(reg.date.split('T')[0]), 'MMM d, yyyy') : ''; } catch {}
                    const isUpcoming = reg.event_status === 'upcoming';
                    return (
                      <div key={reg.id} className="glass-card animate-fade-up" style={{ padding: '24px', animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          <img
                            src={reg.banner_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300'}
                            alt={reg.title}
                            style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300'; }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                              <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', marginBottom: '6px' }}>{reg.title}</h3>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                  <span>{fd}</span>
                                  <span style={{ opacity: 0.35 }}>•</span>
                                  <span>{reg.venue}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                {reg.checked_in && <span className="badge badge-success">✓ Attended</span>}
                                <span className={`badge ${isUpcoming ? 'badge-gold' : reg.event_status === 'completed' ? 'badge-secondary' : 'badge-danger'}`}>
                                  {reg.event_status}
                                </span>
                              </div>
                            </div>
                            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button className="btn-primary btn-sm"
                                onClick={() => setSelectedPass(selectedPass?.id === reg.id ? null : reg)}>
                                {selectedPass?.id === reg.id ? 'Hide QR Pass' : 'View QR Pass'}
                              </button>
                              <Link to={`/events/${reg.event_id}`}>
                                <button className="btn-ghost btn-sm">View Event</button>
                              </Link>
                            </div>
                          </div>
                        </div>
                        {/* QR Pass inline */}
                        {selectedPass?.id === reg.id && (
                          <div style={{ marginTop: '28px', paddingTop: '28px', borderTop: '1px solid var(--border)', animation: 'scaleIn 0.3s ease' }}>
                            <QRPass qrData={reg.qr_code_data} event={{ title: reg.title, date: reg.date, time: reg.time, venue: reg.venue }} registrationId={reg.id} userName={user?.name} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
                Notifications {unreadCount > 0 && <span style={{ color: 'var(--accent)', fontSize: '16px' }}>({unreadCount} unread)</span>}
              </h3>
              {unreadCount > 0 && (
                <button className="btn-ghost btn-sm" onClick={handleMarkAllRead}>Mark all read</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <p>No notifications yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map(n => (
                  <div key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    style={{
                      display: 'flex', gap: '14px', padding: '16px 20px',
                      background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(240,165,0,0.04)',
                      border: `1px solid ${n.is_read ? 'var(--border)' : 'rgba(240,165,0,0.15)'}`,
                      borderLeft: `3px solid ${n.is_read ? 'transparent' : 'var(--accent)'}`,
                      borderRadius: '12px', cursor: n.is_read ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      </svg>
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: '1.5' }}>{n.message}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '6px' }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="animate-fade-up" style={{ maxWidth: '600px' }}>
            <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>Profile Information</h3>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email Address', value: user?.email },
                { label: 'College / Faculty', value: user?.college || 'Not set' },
                { label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Student' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '500' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Events Registered', value: registrations.length, color: 'var(--accent)' },
                { label: 'Events Attended', value: checkedInCount, color: 'var(--success)' },
              ].map(stat => (
                <div key={stat.label} className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '900', color: stat.color, fontStyle: 'italic', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
