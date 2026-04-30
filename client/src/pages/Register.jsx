import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const COLLEGES = ['Engineering', 'Medical', 'Arts & Science', 'Commerce', 'Law', 'Management', 'Architecture', 'Pharmacy', 'Agriculture', 'Other'];

const Register = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);


  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password are required.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await registerApi(form);
      login(data.token, data.user);
      toast.success(`Welcome to UniEvents, ${data.user.name}!`);
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const pw = form.password;
  const pwStrength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : pw.length < 12 ? 3 : 4;
  const pwColor = ['var(--border)', 'var(--danger)', 'var(--warning)', 'var(--accent)', 'var(--success)'][pwStrength];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '90px 24px 60px' }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '460px' }}>
        <div className="glass-card" style={{ padding: '44px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 14px', background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-btn)', color: '#fff' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '700', marginBottom: '6px', fontStyle: 'italic' }}>Join UniEvents</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Create your free student account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" placeholder="Your full name"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="you@university.edu"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Password * (min. 6 chars)</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input" placeholder="Choose a strong password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {/* Strength bar */}
              {pw.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: pwStrength >= i ? pwColor : 'var(--border)', transition: 'background 0.3s' }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">College</label>
                <select className="form-input" value={form.college} onChange={e => setForm(p => ({ ...p, college: e.target.value }))}>
                  <option value="">Select...</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <input type="tel" className="form-input" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading} style={{ fontSize: '15px', padding: '13px', marginTop: '4px' }}>
              {loading
                ? <><span style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Creating account...</>
                : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '22px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700' }}>Sign in &rarr;</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
