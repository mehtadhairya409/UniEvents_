import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/AdminSidebar';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { getAdminStats, getAdminEvents } from '../api/admin';
import { getEventRegistrations, updateCheckin } from '../api/registrations';
import { createEvent, updateEvent, deleteEvent, permanentDeleteEvent } from '../api/events';
import { checkIn } from '../api/registrations';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

/* ── tiny helpers ── */
const StatCard = ({ icon, label, value, color, suffix = '' }) => (
  <div className="glass-card" style={{ padding: '28px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: '900', color, lineHeight: 1 }}>{value?.toLocaleString()}{suffix}</div>
      </div>
      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{icon}</div>
    </div>
  </div>
);

const customTooltipStyle = { background: '#0d1529', border: '1px solid rgba(240,165,0,0.2)', borderRadius: '10px', color: '#f8f9fa', fontSize: '13px' };

/* ── ADMIN DASHBOARD ── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [adminEvents, setAdminEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Events tab
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { ev, mode: 'cancel' | 'delete' }
  const [actionLoading, setActionLoading] = useState(false);

  // Registrations tab
  const [selectedEventId, setSelectedEventId] = useState('');
  const [regs, setRegs] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);

  // QR Scanner tab
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  const refreshEvents = useCallback(async () => {
    try { const { data } = await getAdminEvents(); setAdminEvents(data); }
    catch { toast.error('Failed to refresh events.'); }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, eventsRes] = await Promise.all([getAdminStats(), getAdminEvents()]);
        setStats(statsRes.data);
        setAdminEvents(eventsRes.data);
      } catch { toast.error('Failed to load dashboard data.'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const fetchRegs = async (eventId) => {
    setRegsLoading(true);
    try { const { data } = await getEventRegistrations(eventId); setRegs(data); }
    catch { toast.error('Failed to load registrations.'); }
    finally { setRegsLoading(false); }
  };

  const handleEventSelect = (e) => { setSelectedEventId(e.target.value); if (e.target.value) fetchRegs(e.target.value); else setRegs([]); };

  const handleCheckinToggle = async (regId, current) => {
    try {
      await updateCheckin(regId, !current);
      setRegs(prev => prev.map(r => r.id === regId ? { ...r, checked_in: !current } : r));
      toast.success(current ? 'Check-in removed.' : '✅ Checked in!');
    } catch { toast.error('Failed to update check-in.'); }
  };

  const handleScan = async () => {
    if (!qrInput.trim()) { toast.error('Please paste QR code data first.'); return; }
    setScanning(true); setScanResult(null);
    try {
      const { data } = await checkIn(qrInput.trim());
      setScanResult({ success: true, ...data });
    } catch (err) {
      const d = err.response?.data;
      setScanResult({ success: false, already: d?.already_checked_in, user: d?.user, event: d?.event, message: d?.message });
    } finally { setScanning(false); }
  };

  /* ── Cancel / Delete handlers ── */
  const handleConfirmAction = async () => {
    if (!deleteConfirm) return;
    const { ev, mode } = deleteConfirm;
    setActionLoading(true);
    try {
      if (mode === 'cancel') {
        await deleteEvent(ev.id);
        toast.success(`"${ev.title}" has been cancelled.`);
      } else {
        await permanentDeleteEvent(ev.id);
        toast.success(`"${ev.title}" permanently deleted.`);
      }
      setDeleteConfirm(null);
      await refreshEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    if (!regs.length) return;
    const headers = ['Name', 'Email', 'College', 'Phone', 'Registered At', 'Checked In'];
    const rows = regs.map(r => [r.name, r.email, r.college || '', r.phone || '', r.registered_at, r.checked_in ? 'Yes' : 'No']);
    const csv = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'registrations.csv';
    a.click();
  };

  return (
    <div className="page-pt" style={{ paddingTop: '88px', minHeight: '100vh' }}>
      {/* Header */}
      <div className="admin-page-header" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '32px 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#f0a500,#ffd166)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700' }}>Admin Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Welcome, {user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container admin-content-area" style={{ padding: '32px 24px' }}>
        <div className="admin-layout" style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="animate-fade-up">
              {loading ? <LoadingSkeleton type="stat" /> : (
                <>
                  <div className="stats-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
                    <StatCard icon="🗓️" label="Total Events"        value={stats?.total_events}        color="#4cc9f0" />
                    <StatCard icon="🎟️" label="Registrations"       value={stats?.total_registrations} color="var(--accent)" />
                    <StatCard icon="✅" label="Check-ins"            value={stats?.total_checkins}      color="var(--success)" />
                    <StatCard icon="💺" label="Seats Fill Rate"      value={stats?.fill_percentage}     color="#c084fc" suffix="%" />
                  </div>

                  {/* Line chart */}
                  <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Registrations — Last 14 Days</h3>
                    {stats?.daily_registrations?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={stats.daily_registrations}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" tick={{ fill: '#6c757d', fontSize: 11 }} tickFormatter={v => { try { return format(parseISO(v), 'MMM d'); } catch { return v; }}} />
                          <YAxis tick={{ fill: '#6c757d', fontSize: 11 }} />
                          <Tooltip contentStyle={customTooltipStyle} />
                          <Line type="monotone" dataKey="count" stroke="#f0a500" strokeWidth={3} dot={{ fill: '#f0a500', r: 4 }} activeDot={{ r: 7 }} name="Registrations" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No registration data yet.</p>}
                  </div>

                  {/* Bar chart */}
                  <div className="glass-card" style={{ padding: '28px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Top 5 Events by Registrations</h3>
                    {stats?.top_events?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stats.top_events} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: '#6c757d', fontSize: 11 }} />
                          <YAxis type="category" dataKey="title" tick={{ fill: '#adb5bd', fontSize: 11 }} width={160} />
                          <Tooltip contentStyle={customTooltipStyle} />
                          <Bar dataKey="registration_count" fill="#f0a500" radius={[0, 6, 6, 0]} name="Registrations" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No events yet.</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── EVENTS ── */}
          {activeTab === 'events' && (
            <div className="animate-fade-up">
              <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700' }}>Manage Events</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{adminEvents.length} event{adminEvents.length !== 1 ? 's' : ''} total</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingEvent(null); setShowCreateModal(true); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Create Event
                </button>
              </div>

              {adminEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 40px' }} className="glass-card">
                  <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.5 }}>🗓️</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>No Events Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create your first event to get started.</p>
                  <button className="btn-primary" onClick={() => { setEditingEvent(null); setShowCreateModal(true); }}>+ Create First Event</button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Title</th><th>Category</th><th>Date</th><th>Capacity</th><th>Registered</th><th>Fill%</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {adminEvents.map(ev => {
                        let fd = ''; try { fd = ev.date ? format(parseISO(ev.date.split('T')[0]), 'MMM d, yy') : ''; } catch {}
                        return (
                          <tr key={ev.id}>
                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600' }}>{ev.title}</td>
                            <td><span className="badge badge-secondary" style={{ fontSize: '11px' }}>{ev.category}</span></td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{fd}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{ev.capacity}</td>
                            <td style={{ color: 'var(--accent)', fontWeight: '600' }}>{ev.registration_count}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-bar-container" style={{ width: '60px' }}>
                                  <div className={`progress-bar-fill ${ev.fill_percentage >= 90 ? 'critical' : ev.fill_percentage >= 60 ? 'low' : 'plenty'}`} style={{ width: `${ev.fill_percentage}%` }} />
                                </div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.fill_percentage}%</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${ev.status === 'upcoming' ? 'badge-gold' : ev.status === 'ongoing' ? 'badge-success' : ev.status === 'completed' ? 'badge-secondary' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                {ev.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {/* Edit */}
                                <button
                                  className="btn-sm"
                                  style={{ background: 'rgba(76,201,240,0.12)', color: '#4cc9f0', border: '1px solid rgba(76,201,240,0.3)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onClick={() => { setEditingEvent(ev); setShowCreateModal(true); }}
                                  title="Edit event"
                                >✏️ Edit</button>

                                {/* Cancel (soft delete) — only if not already cancelled */}
                                {ev.status !== 'cancelled' && (
                                  <button
                                    className="btn-sm"
                                    style={{ background: 'rgba(255,183,3,0.12)', color: '#ffb703', border: '1px solid rgba(255,183,3,0.3)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onClick={() => setDeleteConfirm({ ev, mode: 'cancel' })}
                                    title="Cancel event (keeps record)"
                                  >⛔ Cancel</button>
                                )}

                                {/* Permanent Delete */}
                                <button
                                  className="btn-sm"
                                  style={{ background: 'rgba(239,71,111,0.12)', color: '#ef476f', border: '1px solid rgba(239,71,111,0.3)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onClick={() => setDeleteConfirm({ ev, mode: 'delete' })}
                                  title="Permanently delete event and all registrations"
                                >🗑️ Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── REGISTRATIONS ── */}
          {activeTab === 'registrations' && (
            <div className="animate-fade-up">
              <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700' }}>Registrations</h2>
                {regs.length > 0 && <button className="btn-ghost btn-sm" onClick={exportCSV}>📤 Export CSV</button>}
              </div>
              <select className="form-input" style={{ maxWidth: '420px', marginBottom: '28px' }} value={selectedEventId} onChange={handleEventSelect}>
                <option value="">— Select an event —</option>
                {adminEvents.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
              {regsLoading ? <LoadingSkeleton type="row" count={4} /> : regs.length > 0 ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{regs.length} registrations • {regs.filter(r => r.checked_in).length} checked in</p>
                  <div className="table-container">
                    <table className="data-table">
                      <thead><tr><th>Name</th><th>Email</th><th>College</th><th>Registered At</th><th>Check-in</th></tr></thead>
                      <tbody>
                        {regs.map(r => (
                          <tr key={r.id}>
                            <td style={{ fontWeight: '600' }}>{r.name}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{r.email}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{r.college || '—'}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(r.registered_at).toLocaleString()}</td>
                            <td>
                              <label className="toggle-switch" title={r.checked_in ? 'Mark as not checked in' : 'Mark as checked in'}>
                                <input type="checkbox" checked={!!r.checked_in} onChange={() => handleCheckinToggle(r.id, r.checked_in)} />
                                <span className="toggle-slider" />
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : selectedEventId ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                  <p>No registrations for this event yet.</p>
                </div>
              ) : null}
            </div>
          )}

          {/* ── QR SCANNER ── */}
          {activeTab === 'scanner' && (
            <div className="animate-fade-up" style={{ maxWidth: '600px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>QR Entry Scanner</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Paste the QR code data to verify and check-in an attendee.</p>
              <div className="glass-card" style={{ padding: '28px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>QR Code Data</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Paste the base64 QR code data here..."
                  value={qrInput}
                  onChange={e => { setQrInput(e.target.value); setScanResult(null); }}
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={handleScan} disabled={scanning} style={{ flex: 1 }}>
                    {scanning ? 'Verifying...' : '🔍 Verify Entry'}
                  </button>
                  <button className="btn-ghost" onClick={() => { setQrInput(''); setScanResult(null); }}>Clear</button>
                </div>
              </div>

              {scanResult && (
                <div className="animate-scale-in" style={{ marginTop: '24px' }}>
                  {scanResult.success ? (
                    <div style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.3)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                      <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--success)', marginBottom: '8px' }}>Entry Granted!</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{scanResult.user?.name}</strong> · {scanResult.user?.college || scanResult.user?.email}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Event: {scanResult.event?.title}</p>
                    </div>
                  ) : scanResult.already ? (
                    <div style={{ background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.3)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                      <div style={{ fontSize: '52px', marginBottom: '12px' }}>⚠️</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--warning)', marginBottom: '8px' }}>Already Checked In</h3>
                      <p style={{ color: 'var(--text-secondary)' }}><strong>{scanResult.user?.name}</strong> has already entered.</p>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(239,71,111,0.08)', border: '1px solid rgba(239,71,111,0.3)', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
                      <div style={{ fontSize: '52px', marginBottom: '12px' }}>❌</div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--danger)', marginBottom: '8px' }}>Invalid QR Code</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>{scanResult.message || 'This QR code is not recognized.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        </div>{/* end admin-layout */}
      </div>

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <EventFormModal
          key={editingEvent?.id ?? 'new'}
          event={editingEvent}
          onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
          onSuccess={async () => {
            setShowCreateModal(false);
            setEditingEvent(null);
            await refreshEvents();
          }}
        />
      )}

      {/* Confirm Cancel / Delete Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => !actionLoading && setDeleteConfirm(null)}>
          <div className="modal-content animate-scale-in" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <div style={{ fontSize: '52px', marginBottom: '12px' }}>
                {deleteConfirm.mode === 'cancel' ? '⛔' : '🗑️'}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
                {deleteConfirm.mode === 'cancel' ? 'Cancel Event?' : 'Delete Event Permanently?'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>"{deleteConfirm.ev.title}"</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                {deleteConfirm.mode === 'cancel'
                  ? 'This will mark the event as cancelled. The event and all its registrations will remain in the system.'
                  : '⚠️ This will permanently remove the event and ALL associated registrations from the database. This action cannot be undone.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
              >Keep Event</button>
              <button
                style={{
                  flex: 2, padding: '12px', borderRadius: '12px', border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '700', fontSize: '15px', transition: 'all 0.2s', opacity: actionLoading ? 0.7 : 1,
                  background: deleteConfirm.mode === 'cancel' ? 'linear-gradient(135deg,#ffb703,#fb8500)' : 'linear-gradient(135deg,#ef476f,#c0392b)',
                  color: '#fff'
                }}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : deleteConfirm.mode === 'cancel' ? 'Yes, Cancel Event' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── EVENT FORM MODAL ── */
const BLANK = { title: '', description: '', category: 'Technical', date: '', time: '', venue: '', capacity: '', banner_url: '', status: 'upcoming' };
const CATEGORIES = ['Technical', 'Cultural', 'Workshop', 'Sports', 'Academic', 'General'];
const STATUSES = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const EventFormModal = ({ event, onClose, onSuccess }) => {
  const [form, setForm] = useState(event ? {
    title: event.title, description: event.description, category: event.category,
    date: event.date?.split('T')[0] || '', time: event.time || '',
    venue: event.venue, capacity: event.capacity, banner_url: event.banner_url || '',
    status: event.status
  } : BLANK);
  const [saving, setSaving] = useState(false);
  const update = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.venue || !form.capacity) {
      toast.error('Please fill in all required fields.'); return;
    }
    setSaving(true);
    try {
      if (event) { await updateEvent(event.id, form); toast.success('Event updated!'); }
      else { await createEvent(form); toast.success('Event created!'); }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', marginBottom: '28px' }}>
          {event ? '✏️ Edit Event' : '✨ Create New Event'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={update('title')} placeholder="Event title" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" value={form.description} onChange={update('description')} placeholder="Event description..." rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={update('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={update('status')}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.date} onChange={update('date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input type="time" className="form-input" value={form.time} onChange={update('time')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <input className="form-input" value={form.venue} onChange={update('venue')} placeholder="Venue name and location" />
          </div>
          <div className="form-grid-col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input type="number" className="form-input" value={form.capacity} onChange={update('capacity')} placeholder="Max attendees" min="1" />
            </div>
            <div className="form-group">
              <label className="form-label">Banner URL</label>
              <input className="form-input" value={form.banner_url} onChange={update('banner_url')} placeholder="https://..." />
            </div>
          </div>
          {form.banner_url && (
            <img src={form.banner_url} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }} onError={e => e.target.style.display = 'none'} />
          )}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Saving...' : event ? '💾 Update Event' : '✨ Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
