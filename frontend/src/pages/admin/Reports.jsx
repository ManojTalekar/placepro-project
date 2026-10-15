import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/placement');
      setReport(res.data.report || {});
    } catch (err) {
      toast.error('Failed to load placement reports.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!report) return;
    const { deptWise = [], companyWise = [] } = report;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- DEPARTMENT PLACEMENT REPORT ---\n';
    csvContent += 'Department,Total Students,Placed Students,Placement Rate (%),Avg CGPA\n';
    deptWise.forEach(d => {
      const rate = d.total_students > 0 ? Math.round((d.placed / d.total_students) * 100) : 0;
      csvContent += `"${d.department || 'N/A'}",${d.total_students},${d.placed},${rate}%,${Number(d.avg_cgpa || 0).toFixed(2)}\n`;
    });

    csvContent += '\n--- COMPANY RECRUITMENT REPORT ---\n';
    csvContent += 'Company,Total Applications,Shortlisted,Selected Candidates\n';
    companyWise.forEach(c => {
      csvContent += `"${c.company || 'N/A'}",${c.total_applications},${c.shortlisted || 0},${c.selected || 0}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlacePro_Placement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 350 }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const deptWise = report?.deptWise || [];
  const companyWise = report?.companyWise || [];
  const testPerformance = report?.testPerformance || [];

  return (
    <div className="animate-fade-in">
      <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">📊 Placement & Assessment Analytics</h1>
          <p className="page-subtitle">Department recruitment statistics, partner company hiring rates, and test metrics</p>
        </div>
        <button onClick={exportToCSV} className="btn-pp btn-pp-primary">
          <i className="bi bi-download me-1"></i> Export Comprehensive CSV
        </button>
      </div>

      {/* SECTION 1: Department Statistics */}
      <div className="pp-card mb-4">
        <h6 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Department-wise Placement Records</h6>
        {deptWise.length === 0 ? (
          <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No department data accumulated yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Pool</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Placed</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Placement Rate</th>
                  <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Average CGPA</th>
                </tr>
              </thead>
              <tbody>
                {deptWise.map((d, i) => {
                  const rate = d.total_students > 0 ? Math.round((d.placed / d.total_students) * 100) : 0;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ fontWeight: 600 }}>{d.department || 'General'}</td>
                      <td>{d.total_students}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{d.placed}</span>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${rate}%`,
                                height: '100%',
                                background: rate >= 70 ? 'var(--accent-green)' : rate >= 40 ? 'var(--accent)' : 'var(--accent-red)'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{rate}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                        {Number(d.avg_cgpa || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Company Wise Recruitment Outcomes & Mock Test Performance */}
      <div className="row g-4">
        {/* Company Performance */}
        <div className="col-lg-6">
          <div className="pp-card h-100">
            <h6 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Company Recruitment Outcomes</h6>
            {companyWise.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No hiring drives concluded yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Company</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Applications</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Shortlisted</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Offers Made</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyWise.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ fontWeight: 600 }}>{c.company}</td>
                        <td>{c.total_applications}</td>
                        <td style={{ color: 'var(--accent)' }}>{c.shortlisted || 0}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{c.selected || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Mock Test Performance */}
        <div className="col-lg-6">
          <div className="pp-card h-100">
            <h6 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Assessment & Mock Test Metrics</h6>
            {testPerformance.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                No student mock test attempts recorded yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover mb-0" style={{ background: 'transparent' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Mock Test</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Attempts</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Avg Score</th>
                      <th style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Max Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testPerformance.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ fontWeight: 600 }}>{t.title}</td>
                        <td>{t.attempts || 0}</td>
                        <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                          {Math.round(t.avg_score || 0)}%
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                          {Math.round(t.max_score || 0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
