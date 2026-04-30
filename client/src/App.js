import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

const NotFound = () => {
  return (
    <div style={{
      paddingTop: '88px', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
    }}>
      <div>
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 24px',
          borderRadius: '20px',
          background: 'var(--accent-dim)',
          border: '2px solid var(--border-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '900', color: 'var(--accent)',
          fontFamily: 'var(--font-display)', fontStyle: 'italic'
        }}>?</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', fontStyle: 'italic', marginBottom: '12px', color: 'var(--text-primary)' }}>
          404
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
          This page doesn't exist.
        </p>
        <a href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          &larr; Go Home
        </a>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const toastBg = theme === 'dark' ? '#1e1e1e' : '#faf6ef';
  const toastColor = theme === 'dark' ? '#eeeeee' : '#2a1a0a';
  const toastBorder = theme === 'dark' ? 'rgba(200,147,90,0.25)' : 'rgba(130,70,20,0.25)';

  return (
    <>
      <Navbar />
      <main key={location.pathname} className="page-enter">
        <Routes>
          <Route path="/"           element={<Landing />} />
          <Route path="/events"     element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/dashboard"  element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: toastBg,
            color: toastColor,
            border: `1px solid ${toastBorder}`,
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            padding: '14px 18px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          },
          success: { iconTheme: { primary: '#3ecf8e', secondary: toastBg } },
          error:   { iconTheme: { primary: '#e5534b', secondary: toastBg } },
        }}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

