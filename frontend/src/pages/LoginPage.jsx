import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      student: { email: 'student@test.com', password: 'admin123' },
      admin: { email: 'admin@placepro.com', password: 'admin123' },
      recruiter: { email: 'recruiter@tcs.com', password: 'admin123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--gradient-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to your PlacePro account</p>
        </div>

        {/* Demo Accounts */}
        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '0.875rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>⚡ Quick Demo Login:</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['student', 'admin', 'recruiter'].map(r => (
              <button key={r} onClick={() => fillDemo(r)} className="btn-pp btn-pp-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>{r}</button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="pp-label">Email Address</label>
            <input id="login-email" type="email" className="pp-input" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label className="pp-label">Password</label>
            <input id="login-password" type="password" className="pp-input" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button id="login-submit" type="submit" className="btn-pp btn-pp-primary w-100" style={{ padding: '0.75rem', fontSize: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" style={{ color: 'white' }}></span>Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Create one</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
