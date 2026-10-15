import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    notification_type: 'announcement'
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setData(res.data.dashboard);
    } catch (err) {
      toast.error('Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Title and message are required.');
      return;
    }
    setSendingBroadcast(true);
    try {
      const res = await api.post('/admin/notifications/broadcast', broadcastForm);
      toast.success(res.data.message || 'Announcement broadcast to all students!');
      setBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', notification_type: 'announcement' });
    } catch (err) {
      toast.error('Failed to broadcast announcement.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const deptStats = data?.deptStats || [];
  const recentApps = data?.recentApplications || [];

  const placementRate = stats.totalStudents > 0
    ? Math.round((stats.placedStudents / stats.totalStudents) * 100)
    : 0;

  const statCards = [
    { label: 'Registered Students', value: stats.totalStudents || 0, icon: 'bi-people', type: 'primary' },
    { label: 'Registered Companies', value: stats.totalCompanies || 0, icon: 'bi-building', type: 'secondary' },
    { label: 'Active Placement Drives', value: `${stats.openDrives || 0} / ${stats.totalDrives || 0}`, icon: 'bi-briefcase', type: 'warning' },
    { label: 'Total Applications', value: stats.totalApplications || 0, icon: 'bi-file-earmark-text', type: 'purple' },
    { label: 'Placed Students', value: stats.placedStudents || 0, icon: 'bi-check-circle', type: 'success' },
    { label: 'Campus Placement Rate', value: `${placementRate}%`, icon: 'bi-graph-up-arrow', type: 'primary' },
  ];

  // Chart data for Department wise placements
  const deptLabels = deptStats.map(d => d.department || 'Unknown');
  const deptPlaced = deptStats.map(d => d.placed || 0);
  const deptTotal = deptStats.map(d => d.total || 0);

  const barChartData = {
    labels: deptLabels.length > 0 ? deptLabels : ['CSE', 'IT', 'MCA', 'ECE'],
    datasets: [
      {
        label: 'Placed Students',
        data: deptPlaced.length > 0 ? deptPlaced : [0, 0, 0, 0],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Total Registered',
        data: deptTotal.length > 0 ? deptTotal : [0, 0, 0, 0],
        backgroundColor: 'rgba(99, 102, 241, 0.4)',
        borderRadius: 6,
      }
    ]
  };

  const doughnutData = {
    labels: ['Placed', 'In Process / Shortlisted', 'Seeking Placement'],
    datasets: [
      {
        data: [
          stats.placedStudents || 0,
          stats.shortlisted || 0,
          Math.max(0, (stats.totalStudents || 0) - (stats.placedStudents || 0))
        ],
        backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">⚙️ Placement Administration Dashboard</h1>
          <p className="page-subtitle">Centralized monitoring of campus drives, student readiness, and recruiter engagements</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button onClick={() => setBroadcastModal(true)} className="btn-pp btn-pp-secondary">
            <i className="bi bi-megaphone me-1"></i> Broadcast Announcement
          </button>
          <Link to="/admin/drives" className="btn-pp btn-pp-primary">
            <i className="bi bi-plus-lg me-1"></i> Post New Drive
          </Link>
          <Link to="/admin/reports" className="btn-pp btn-pp-outline">
            <i className="bi bi-file-earmark-bar-graph me-1"></i> Reports
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((s, i) => (
          <div className="col-6 col-md-4 col-xl-2" key={i}>
            <div className="stat-card h-100">
              <div className={`stat-icon ${s.type}`}><i className={`bi ${s.icon}`}></i></div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="pp-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 700, margin: 0 }}>Department-wise Placement Distribution</h6>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Campus Data</span>
            </div>
            <div style={{ height: 280 }}>
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="pp-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 700, margin: 0 }}>Overall Placement Ratio</h6>
              <span className="badge-pp badge-pp-primary">{placementRate}% Success</span>
            </div>
            <div style={{ height: 230, position: 'relative' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 } } },
                  cutout: '70%'
                }}
              />
            </div>
            <div className="d-flex justify-content-around text-center mt-3 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placed</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{stats.placedStudents || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shortlisted</div>
                <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{stats.shortlisted || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Pool</div>
                <div style={{ fontWeight: 700 }}>{stats.totalStudents || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="pp-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 style={{ fontWeight: 700, margin: 0 }}>Recent Placement Drive Applications</h6>
          <Link to="/admin/students" className="btn-pp btn-pp-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
            View All Students
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No recent applications found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Candidate</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Drive Title</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Applied Date</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ fontWeight: 600 }}>{app.student_name}</td>
                    <td>{app.drive_title}</td>
                    <td>{app.company_name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(app.applied_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge-pp badge-pp-${
                        app.status === 'selected' ? 'success' :
                        app.status === 'shortlisted' ? 'warning' :
                        app.status === 'rejected' ? 'danger' : 'primary'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {broadcastModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom pp-card" style={{ maxWidth: 550, margin: '10vh auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 style={{ fontWeight: 700, margin: 0 }}>📢 Broadcast Campus Announcement</h5>
              <button
                type="button"
                className="btn-pp btn-pp-outline"
                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                onClick={() => setBroadcastModal(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Send an instant placement notification or campus alert to all registered students.
            </p>
            <form onSubmit={handleBroadcast}>
              <div className="mb-3">
                <label className="form-label-pp">Announcement Title *</label>
                <input
                  type="text"
                  className="form-control-pp"
                  placeholder="e.g. TCS Technical Drive Orientation Tomorrow"
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label-pp">Notification Category</label>
                <select
                  className="form-select-pp"
                  value={broadcastForm.notification_type}
                  onChange={e => setBroadcastForm({ ...broadcastForm, notification_type: e.target.value })}
                >
                  <option value="announcement">📢 General Announcement</option>
                  <option value="drive">💼 Placement Drive Alert</option>
                  <option value="assessment">📝 Assessment / Mock Test Notice</option>
                  <option value="application">📋 Application Reminder</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label-pp">Announcement Message *</label>
                <textarea
                  className="form-control-pp"
                  rows={4}
                  placeholder="Write message content for students..."
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn-pp btn-pp-outline" onClick={() => setBroadcastModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-pp btn-pp-primary" disabled={sendingBroadcast}>
                  {sendingBroadcast ? (
                    <><span className="loading-spinner" style={{ width: 14, height: 14 }}></span> Broadcasting...</>
                  ) : (
                    <><i className="bi bi-send me-1"></i> Send to All Students</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
