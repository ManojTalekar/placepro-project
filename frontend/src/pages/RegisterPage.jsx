import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: form.role });
      login(res.data.token, res.data.user);
      toast.success('Account created successfully! Welcome to PlacePro!');
      if (form.role === 'admin') navigate('/admin/dashboard');
      else if (form.role === 'recruiter') navigate('/recruiter/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'student', label: '🎓 Student', desc: 'Prepare for placements' },
    { value: 'admin', label: '⚙️ Admin', desc: 'Manage placement activities' },
    { value: 'recruiter', label: '🏢 Recruiter', desc: 'Post jobs & hire candidates' },
  ];

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--gradient-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', margin: '0 auto 1rem', boxShadow: 'var(--shadow-glow)' }}>🎯</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.25rem' }}>Join PlacePro Cloud</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create your account to get started</p>
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="pp-label mb-2">I am a...</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            {roleOptions.map(r => (
              <div key={r.value} onClick={() => setForm({ ...form, role: r.value })}
                style={{ padding: '0.75rem', borderRadius: 12, border: `1px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border-light)'}`, background: form.role === r.value ? 'rgba(99,102,241,0.1)' : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'var(--transition)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{r.label.split(' ')[0]}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: form.role === r.value ? 'var(--primary-light)' : 'var(--text-secondary)' }}>{r.label.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="pp-label">Full Name</label>
            <input id="reg-name" type="text" className="pp-input" placeholder="Your full name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="pp-label">Email Address</label>
            <input id="reg-email" type="email" className="pp-input" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="pp-label">Password</label>
            <input id="reg-password" type="password" className="pp-input" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label className="pp-label">Confirm Password</label>
            <input id="reg-confirm-password" type="password" className="pp-input" placeholder="Repeat password" value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button id="reg-submit" type="submit" className="btn-pp btn-pp-primary w-100" style={{ padding: '0.75rem', fontSize: '1rem', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" style={{ color: 'white' }}></span>Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
