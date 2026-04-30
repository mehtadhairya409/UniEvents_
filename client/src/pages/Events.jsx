import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/events';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Workshop', 'Sports', 'Academic'];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await getEvents();
      setEvents(data);
    } catch {
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(() => fetchEvents(true), 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  useEffect(() => {
    let result = [...events];
    if (category !== 'All') result = result.filter(e => e.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [events, search, category]);

  return (
    <div className="page-pt" style={{ paddingTop: '88px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '48px 24px' }}>
        <div className="container">
          <nav style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: 'var(--accent)' }}>Events</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '700', marginBottom: '8px' }}>
                Campus Events
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                {loading ? 'Loading events...' : `Showing ${filtered.length} event${filtered.length !== 1 ? 's' : ''}`}
                {!loading && events.length !== filtered.length && ` of ${events.length} total`}
              </p>
            </div>
            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              Live seat tracking
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {/* Search + Filters */}
        <div className="events-filters" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
          {/* Search */}
          <div className="events-search" style={{ position: 'relative', maxWidth: '500px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input
              type="text"
              className="form-input"
              placeholder="Search events, venues, descriptions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '48px', maxWidth: '500px' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>
                ✕
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '7px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: category === cat ? 'var(--accent-dim)' : 'var(--bg-card)',
                  color: category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  border: category === cat ? '1px solid var(--border-accent)' : '1px solid var(--border)',
                  fontFamily: 'var(--font-body)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingSkeleton type="card" count={6} />
        ) : filtered.length === 0 ? (
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
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '12px' }}>
              No events found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '28px' }}>
              {search ? `No results for "${search}"` : `No ${category} events scheduled yet.`}
            </p>
            <button className="btn-ghost" onClick={() => { setSearch(''); setCategory('All'); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
