import { Link } from 'react-router-dom';

const features = [
  { icon: '🤖', title: 'AI Resume Analyzer', desc: 'Analyze your resume against job descriptions and get a match score with detailed feedback.', color: '#6366f1' },
  { icon: '📊', title: 'Skill Gap Analysis', desc: 'Compare your skills with job requirements to identify and prioritize what to learn.', color: '#0ea5e9' },
  { icon: '✅', title: 'Eligibility Checker', desc: 'Instantly know if you qualify for any placement drive based on CGPA, backlogs, and more.', color: '#10b981' },
  { icon: '📝', title: 'Mock Tests', desc: 'Practice aptitude, reasoning, and technical MCQs with timed tests and instant results.', color: '#f59e0b' },
  { icon: '💼', title: 'Interview Prep', desc: 'Prepare for technical and HR interviews with curated question banks and sample answers.', color: '#a855f7' },
  { icon: '🎯', title: 'Track Applications', desc: 'Apply to placement drives and track your application status in real time.', color: '#ef4444' },
];

const stats = [
  { value: '10+', label: 'Placement Modules' },
  { value: '3', label: 'User Roles' },
  { value: '500+', label: 'Practice Questions' },
  { value: '100%', label: 'Cloud-Based' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-dark)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 38, height: 38, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: 'var(--shadow-glow)' }}>🎯</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PlacePro Cloud</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login" className="btn-pp btn-pp-outline">Sign In</Link>
          <Link to="/register" className="btn-pp btn-pp-primary">Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{ paddingTop: '7rem' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6 animate-fade-up">
              <div className="badge-pp badge-pp-primary mb-3" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>
                🚀 AI-Powered Placement Platform
              </div>
              <h1 className="hero-title mb-4">
                Your Smart Path to{' '}
                <span className="glow-text">Campus Placements</span>
              </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 500 }}>
                PlacePro Cloud integrates AI resume analysis, skill gap detection, mock tests,
                interview preparation, and placement drive management in one powerful platform.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn-pp btn-pp-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                  Start Free Today →
                </Link>
                <Link to="/login" className="btn-pp btn-pp-outline" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                  <i className="bi bi-play-circle me-2"></i>View Demo
                </Link>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', flexWrap: 'wrap' }}>
                {stats.map((s, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-light)' }}>{s.value}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="animate-float" style={{ position: 'relative' }}>
                <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)', borderRadius: 24, padding: '1.5rem', backdropFilter: 'blur(20px)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {[
                      { icon: '📄', label: 'Resume Match', value: '87%', color: '#6366f1' },
                      { icon: '🎯', label: 'Skills Matched', value: '12/15', color: '#10b981' },
                      { icon: '📝', label: 'Test Score', value: '92%', color: '#f59e0b' },
                      { icon: '🏢', label: 'Applied To', value: '5 Drives', color: '#0ea5e9' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: '1rem', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: '1rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Application Status</span>
                      <span className="badge-pp badge-pp-success">Active</span>
                    </div>
                    {['TCS - Shortlisted', 'Infosys - Under Review', 'Amazon - Applied'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#6366f1' }}></div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 0', background: 'rgba(17,24,39,0.5)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <div className="badge-pp badge-pp-info mb-3" style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}>Platform Features</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900 }}>
              Everything You Need to{' '}
              <span className="glow-text">Get Placed</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '1rem auto 0' }}>
              A comprehensive platform integrating all aspects of campus placement preparation and management.
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div className="col-md-6 col-lg-4" key={i}>
                <div className="feature-card animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="feature-icon" style={{ background: `${f.color}20` }}>
                    <span style={{ fontSize: '1.6rem' }}>{f.icon}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900 }}>Built for Everyone</h2>
          </div>
          <div className="row g-4">
            {[
              { role: 'Student', icon: '🎓', color: '#6366f1', desc: 'Access drives, analyze resumes, take mock tests, prepare for interviews, and track your applications all in one place.' },
              { role: 'Placement Admin', icon: '⚙️', color: '#f59e0b', desc: 'Manage student records, companies, drives, eligibility criteria, and generate comprehensive placement reports.' },
              { role: 'Recruiter', icon: '🏢', color: '#0ea5e9', desc: 'Post job opportunities, review applications, shortlist candidates, and manage the complete recruitment lifecycle.' },
            ].map((r, i) => (
              <div className="col-md-4" key={i}>
                <div style={{ background: 'var(--gradient-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center', height: '100%', transition: 'var(--transition-slow)' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseOut={e => e.currentTarget.style.transform = ''}
                >
                  <div style={{ width: 64, height: 64, background: `${r.color}20`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.25rem' }}>{r.icon}</div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>{r.role}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container text-center">
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(14,165,233,0.1) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '4rem 2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Ready to Start Your Placement Journey?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>Join PlacePro Cloud and take control of your campus placement preparation today.</p>
            <Link to="/register" className="btn-pp btn-pp-primary" style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
              Create Your Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-light)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        © 2026 PlacePro
      </footer>
    </div>
  );
}
