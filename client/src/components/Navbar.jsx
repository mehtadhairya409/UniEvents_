import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";

/* SVG Icons */
const SunIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const MenuIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const CloseIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ChevronIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "var(--nav-bg)" : "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
        boxShadow: scrolled ? "var(--shadow-nav)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>

            {/* LOGO */}
            <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "var(--shadow-btn)", flexShrink: 0
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "900",
                  letterSpacing: "-0.5px", color: "var(--text-primary)"
                }}>
                  Uni<span style={{ color: "var(--accent)", fontStyle: "italic" }}>Events</span>
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }}>
              <NavLink to="/events"    active={isActive("/events")}>Events</NavLink>
              {user?.role === "admin" && <NavLink to="/admin" active={isActive("/admin")}>Admin</NavLink>}
              {user && <NavLink to="/dashboard" active={isActive("/dashboard")}>Dashboard</NavLink>}
            </div>

            {/* RIGHT CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "6px 12px 6px 8px",
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "99px", cursor: "pointer", fontSize: "11px",
                  fontWeight: "700", letterSpacing: "0.5px",
                  color: "var(--text-secondary)", transition: "all 0.2s",
                  fontFamily: "var(--font-body)", textTransform: "uppercase"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
              >
                <div style={{
                  width: "28px", height: "16px", borderRadius: "8px",
                  background: theme === "dark" ? "var(--border-light)" : "var(--accent-dim)",
                  border: "1px solid var(--border-accent)",
                  position: "relative", flexShrink: 0
                }}>
                  <div style={{
                    position: "absolute", top: "2px",
                    left: theme === "dark" ? "2px" : "12px",
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: "var(--accent)",
                    transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
                {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
              </button>

              {user ? (
                <>
                  <NotificationBell />
                  {user.role === "admin" && (
                    <Link to="/admin">
                      <button style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px",
                        background: "var(--accent-dim)", border: "1px solid var(--border-accent)",
                        borderRadius: "99px", cursor: "pointer", fontSize: "12px",
                        fontWeight: "700", color: "var(--accent)", fontFamily: "var(--font-body)",
                        transition: "all 0.2s"
                      }}>
                        Admin Panel
                      </button>
                    </Link>
                  )}

                  {/* User menu */}
                  <div style={{ position: "relative" }} ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "5px 10px 5px 5px",
                      background: "var(--bg-card)", border: "1px solid var(--border)",
                      borderRadius: "99px", cursor: "pointer", transition: "all 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent), var(--accent-light))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-display)", fontWeight: "900", fontSize: "13px",
                        color: "#fff", flexShrink: 0
                      }}>{user.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontSize: "13px", fontWeight: "600", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                        {user.name?.split(" ")[0]}
                      </span>
                      <span style={{ opacity: 0.5, color: "var(--text-muted)", lineHeight: 0 }}><ChevronIcon /></span>
                    </button>

                    {dropdownOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        background: "var(--bg-secondary)", border: "1px solid var(--border-accent)",
                        borderRadius: "16px", padding: "8px", minWidth: "210px",
                        boxShadow: "var(--shadow-hover)",
                        animation: "slideDown 0.2s ease", zIndex: 200
                      }}>
                        <div style={{ padding: "10px 12px 14px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{user.name}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                          <span className={`badge ${user.role === "admin" ? "badge-gold" : "badge-secondary"}`} style={{ marginTop: "8px" }}>
                            {user.role === "admin" ? "Admin" : "Student"}
                          </span>
                        </div>
                        {[
                          { to: "/dashboard", label: "My Dashboard" },
                          ...(user.role === "admin" ? [{ to: "/admin", label: "Admin Panel" }] : []),
                        ].map(item => (
                          <Link key={item.to} to={item.to}
                            style={{ display: "block", padding: "10px 12px", fontSize: "14px", color: "var(--text-secondary)", borderRadius: "9px", transition: "all 0.15s", fontWeight: "500" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                          >{item.label}</Link>
                        ))}
                        <div style={{ borderTop: "1px solid var(--border)", marginTop: "4px", paddingTop: "4px" }}>
                          <button onClick={handleLogout}
                            style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left", padding: "10px 12px", fontSize: "14px", color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", borderRadius: "9px", transition: "all 0.15s", fontFamily: "var(--font-body)", fontWeight: "600" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(229,83,75,0.08)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          ><LogoutIcon /> Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link to="/login"><button className="btn-ghost btn-sm">Login</button></Link>
                  <Link to="/register"><button className="btn-primary btn-sm">Get Started</button></Link>
                </div>
              )}

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="hamburger-btn"
                style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", display: "none", padding: "4px" }}>
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "16px", animation: "slideDown 0.2s ease" }}>
            {[
              { to: "/events", label: "Events" },
              ...(user ? [{ to: "/dashboard", label: "My Dashboard" }] : []),
              ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin Panel" }] : []),
            ].map(item => (
              <Link key={item.to} to={item.to}
                style={{ display: "block", padding: "11px 12px", fontSize: "15px", fontWeight: "500", color: "var(--text-secondary)", borderRadius: "8px", marginBottom: "2px" }}>
                {item.label}
              </Link>
            ))}
            <button onClick={toggleTheme} style={{
              marginTop: "8px", width: "100%", justifyContent: "center",
              display: "flex", alignItems: "center", gap: "8px",
              padding: "11px 12px", background: "var(--bg-card)",
              border: "1px solid var(--border)", borderRadius: "10px",
              cursor: "pointer", fontSize: "14px", fontWeight: "600",
              color: "var(--text-secondary)", fontFamily: "var(--font-body)"
            }}>
              {theme === "dark" ? <MoonIcon /> : <SunIcon />}
              {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
            </button>
            {user ? (
              <button onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", textAlign: "left", padding: "11px 12px", fontSize: "15px", color: "var(--danger)", background: "none", border: "none", cursor: "pointer", borderRadius: "8px", fontFamily: "var(--font-body)", marginTop: "4px", fontWeight: "600" }}>
                <LogoutIcon /> Logout
              </button>
            ) : (
              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <Link to="/login" style={{ flex: 1 }}><button className="btn-ghost btn-full">Login</button></Link>
                <Link to="/register" style={{ flex: 1 }}><button className="btn-primary btn-full">Register</button></Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
          .theme-label { display: none; }
        }
        @media (max-width: 900px) {
          .theme-label { display: none; }
        }
      `}</style>
    </>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link to={to} style={{
    padding: "7px 15px", borderRadius: "9px", fontSize: "13px",
    fontWeight: active ? "700" : "500",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    background: active ? "var(--accent-dim)" : "transparent",
    transition: "all 0.2s", textDecoration: "none",
    border: active ? "1px solid var(--border-accent)" : "1px solid transparent",
    letterSpacing: "0.2px"
  }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-card)"; }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}}
  >{children}</Link>
);

export default Navbar;