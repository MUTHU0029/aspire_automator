import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const FacultyDashboard = () => {
  const [summary, setSummary] = useState({
    totalStudents: 0,
    gateTestsCompleted: 0,
    pendingNptel: 0,
    approvedNptel: 0,
    rejectedNptel: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await api.get('/faculty/dashboard');
        setSummary(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Total Students', value: summary.totalStudents },
    { label: 'GATE Tests Completed', value: summary.gateTestsCompleted },
    { label: 'NPTEL Pending Approval', value: summary.pendingNptel },
    { label: 'NPTEL Approved', value: summary.approvedNptel },
    { label: 'NPTEL Rejected', value: summary.rejectedNptel },
  ];

  return (
    <div>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="label">{card.label}</div>
            <span className="value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="hero-row" style={{ marginTop: '26px' }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Faculty Dashboard</h3>
          </div>
          <div style={{ display: 'grid', gap: '14px' }}>
            <button className="btn btn-primary" onClick={() => window.location.assign('/faculty/gate')}>GATE Score Entry</button>
            <button className="btn btn-success" onClick={() => window.location.assign('/faculty/nptel-approval')}>NPTEL Score Approval</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Quick Overview</h3>
          </div>
          <div style={{ color: '#5f6d7b', lineHeight: 1.7 }}>
            Monitor academic progress, inspect pending NPTEL verification requests, and update gate records for each class section.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
