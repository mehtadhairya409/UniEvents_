import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getEvents } from "../api/events";
import EventCard from "../components/EventCard";

const STATS = [
  { value: 500,   suffix: "+", label: "Events Hosted" },
  { value: 12000, suffix: "+", label: "Registrations" },
  { value: 50,    suffix: "+", label: "Colleges" },
];

const FEATURES = [
  {
    title: "Instant QR Pass",
    desc: "Register and receive your digital entry pass with a unique QR code instantly after signup.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  },
  {
    title: "Real-time Seats",
    desc: "Live seat availability updates every 30 seconds. Never miss your spot at any event.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    title: "Email Confirmation",
    desc: "Automatic confirmation emails with your QR pass attached for every registration.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    )
  },
  {
    title: "Admin Analytics",
    desc: "Comprehensive dashboard with charts, registration data, and built-in QR check-in scanner.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    )
  },
];

const useCountUp = (target, duration = 2000, startWhen = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, startWhen]);
  return count;
};

const StatCard = ({ value, suffix, label, started }) => {
  const count = useCountUp(value, 1800, started);
  return (
    <div style={{ textAlign: "center" }}>
      <div className="landing-stat-value" style={{
        fontFamily: "var(--font-display)", fontSize: "52px", fontWeight: "900",
        fontStyle: "italic",
        background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        lineHeight: "1.1"
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: "var(--text-secondary)", fontSize: "15px", marginTop: "8px", fontWeight: "600", letterSpacing: "0.3px" }}>{label}</div>
    </div>
  );
};

const Landing = () => {
  const [events, setEvents] = useState([]);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getEvents().then(r => setEvents(r.data.slice(0, 3))).catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* ======= HERO ======= */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden"
      }}>
        {/* Background glows */}
        <div style={{ position: "absolute", top: "15%", left: "5%", width: "600px", height: "600px", background: "radial-gradient(circle, var(--accent-dim) 0%, transparent 65%)", pointerEvents: "none", animation: "float 8s ease-in-out infinite", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(74,158,255,0.05) 0%, transparent 65%)", pointerEvents: "none", animation: "float 10s ease-in-out infinite reverse", zIndex: 0 }} />

        {/* Two-column layout: left = content, right = floating cards */}
        <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <div className="landing-hero-inner" style={{ display: "flex", alignItems: "center", minHeight: "100vh", gap: "40px" }}>

            {/* LEFT COLUMN — hero text */}
            <div className="landing-hero-text" style={{ flex: "1 1 540px", maxWidth: "640px", paddingTop: "88px", paddingBottom: "60px" }}>
              <div className="animate-fade-up delay-1">
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
                  borderRadius: "99px", padding: "6px 18px", marginBottom: "32px",
                  fontSize: "12px", color: "var(--accent)", fontWeight: "800",
                  letterSpacing: "0.5px", textTransform: "uppercase"
                }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--success)", animation: "pulse-glow 2s ease-in-out infinite", flexShrink: 0 }} />
                  Live seat tracking &mdash; all events
                </div>
              </div>

              <h1 className="animate-fade-up delay-2" style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(38px, 5.5vw, 76px)",
                fontWeight: "900", lineHeight: "1.06", marginBottom: "28px",
                letterSpacing: "-2px", color: "var(--text-primary)", fontStyle: "italic"
              }}>
                Every Campus Event,{" "}
                <span className="accent-gradient-text">One Platform.</span>
              </h1>

              <p className="animate-fade-up delay-3" style={{
                fontSize: "clamp(16px, 2vw, 19px)", color: "var(--text-secondary)",
                lineHeight: "1.7", marginBottom: "48px", fontWeight: "400"
              }}>
                Register for events, get your QR entry pass, and never miss a campus moment.
                Built for students, designed for the modern university.
              </p>

              <div className="animate-fade-up delay-4 landing-hero-btns">
                <button className="btn-primary hero-btn" onClick={() => navigate("/events")}>
                  Explore Events &rarr;
                </button>
                <button className="btn-ghost hero-btn" onClick={() => navigate("/register")}>
                  Create Account
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN — floating cards (hidden on small screens) */}
            <div className="hero-cards-col" style={{ flex: "0 0 340px", position: "relative", height: "560px", alignSelf: "center" }}>
              <div style={{
                position: "absolute", top: "0%", left: "50px",
                background: "var(--bg-card)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border-accent)", borderRadius: "14px",
                padding: "16px 20px", width: "220px",
                animation: "float 7s ease-in-out infinite 0s",
                transform: "rotate(-3deg)",
                boxShadow: "var(--shadow-card)"
              }}>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "6px" }}>Technical</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>TechFest 2025</div>
                <div style={{ fontSize: "12px", color: "var(--success)", fontWeight: "700" }}>47 seats available</div>
              </div>

              <div style={{
                position: "absolute", top: "36%", right: "0",
                background: "var(--bg-card)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border-accent)", borderRadius: "14px",
                padding: "16px 20px", width: "220px",
                animation: "float 7s ease-in-out infinite 0.3s",
                transform: "rotate(2deg)",
                boxShadow: "var(--shadow-card)"
              }}>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "6px" }}>Workshop</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>AI/ML Workshop</div>
                <div style={{ fontSize: "12px", color: "var(--warning)", fontWeight: "700" }}>8 seats available</div>
              </div>

              <div style={{
                position: "absolute", bottom: "5%", left: "20px",
                background: "var(--bg-card)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border-accent)", borderRadius: "14px",
                padding: "16px 20px", width: "220px",
                animation: "float 7s ease-in-out infinite 0.6s",
                transform: "rotate(-2deg)",
                boxShadow: "var(--shadow-card)"
              }}>
                <div style={{ fontSize: "10px", color: "var(--accent)", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "6px" }}>Cultural</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px", fontFamily: "var(--font-display)" }}>Cultural Night</div>
                <div style={{ fontSize: "12px", color: "var(--success)", fontWeight: "700" }}>123 seats available</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======= STATS BAR ======= */}
      <section ref={statsRef} style={{ background: "var(--bg-secondary)", padding: "72px 24px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="landing-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "48px", maxWidth: "800px", margin: "0 auto" }}>
            {STATS.map((s, i) => <StatCard key={i} {...s} started={statsVisible} />)}
          </div>
        </div>
      </section>

      {/* ======= FEATURED EVENTS ======= */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div className="badge badge-gold" style={{ marginBottom: "16px" }}>Featured Events</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 5vw, 48px)", fontWeight: "700", marginBottom: "16px" }}>
              Upcoming on Campus
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "17px", maxWidth: "500px", margin: "0 auto", lineHeight: "1.7" }}>
              From hackathons to cultural nights &mdash; discover what is happening this semester.
            </p>
          </div>

          {events.length > 0 ? (
            <div className="grid-3">
              {events.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "var(--bg-card)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", color: "var(--text-muted)"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p style={{ fontSize: "15px", fontWeight: "500" }}>No events found. Start the server to see events.</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link to="/events"><button className="btn-ghost" style={{ fontSize: "15px", padding: "13px 36px" }}>View All Events &rarr;</button></Link>
          </div>
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section className="section" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4.5vw, 44px)", fontWeight: "700", marginBottom: "16px" }}>
              Why <span className="accent-gradient-text">UniEvents?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "17px", lineHeight: "1.7" }}>Everything you need for seamless campus event management.</p>
          </div>

          <div className="grid-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="glass-card animate-fade-up" style={{
                padding: "28px", animationDelay: `${i * 0.1}s`, opacity: 0,
                transition: "all 0.3s ease", cursor: "default"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "var(--shadow-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
              >
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--accent)", marginBottom: "20px"
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "19px", fontWeight: "700", marginBottom: "10px", color: "var(--text-primary)" }}>{f.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.7" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= CTA ======= */}
      <section className="section">
        <div className="container" style={{ textAlign: "center" }}>
          <div className="glass-card cta-card" style={{
            padding: "80px 48px", maxWidth: "760px", margin: "0 auto",
            background: "linear-gradient(135deg, var(--accent-dim) 0%, transparent 100%)",
            border: "1px solid var(--border-accent)", animation: "borderGlow 4s ease-in-out infinite"
          }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px", boxShadow: "var(--shadow-btn)", color: "#fff"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: "700", marginBottom: "20px", fontStyle: "italic" }}>
              Ready to get started?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "18px", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px", lineHeight: "1.7" }}>
              Join thousands of students who discover, register, and attend campus events with UniEvents.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register"><button className="btn-primary" style={{ fontSize: "15px", padding: "14px 38px" }}>Create Free Account</button></Link>
              <Link to="/events"><button className="btn-ghost" style={{ fontSize: "15px", padding: "14px 30px" }}>Browse Events</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="site-footer">
        <div className="container">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "9px",
                background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-btn)", flexShrink: 0
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <span className="site-footer__brand">
                Uni<span>Events</span>
              </span>
            </div>
            <div className="site-footer__divider" />
            <p className="site-footer__copy">
              &copy; 2026 <strong>BYTE-FORGE</strong> All Rights Reserved.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "6px", fontStyle: "italic" }}>
              University Event Management System &mdash; Built for campuses.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-hero-btns {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hero-btn {
          font-size: 15px;
          padding: 14px 34px;
        }
        @media (max-width: 1024px) {
          .hero-cards-col { display: none !important; }
        }
        @media (max-width: 768px) {
          .landing-hero-btns {
            flex-direction: column;
            gap: 12px;
            width: 100%;
          }
          .hero-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;