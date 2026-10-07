import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/student/dashboard');
        setData(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const gateScore = data.gateScore || { test1: 0, test2: 0, test3: 0, test4: 0, total: 0 };
  const submission = data.latestSubmission || null;

  return (
    <div>
      <div className="panel" style={{ marginBottom: '22px' }}>
        <div className="panel-header">
          <h3>Student Dashboard</h3>
        </div>
        <div className="profile-grid">
          <div className="profile-card"><div className="progress-title">Student name</div><h4>{data.user.name}</h4></div>
          <div className="profile-card"><div className="progress-title">Register number</div><h4>{data.user.registerNumber}</h4></div>
          <div className="profile-card"><div className="progress-title">Department</div><h4>{data.user.department}</h4></div>
          <div className="profile-card"><div className="progress-title">Year</div><h4>{data.user.year}</h4></div>
          <div className="profile-card"><div className="progress-title">Section</div><h4>{data.user.section}</h4></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="label">GATE Score</div>
          <span className="value">{gateScore.total || 0} / 200</span>
        </div>
        <div className="stat-card">
          <div className="label">NPTEL Status</div>
          <div style={{ marginTop: '12px' }}>
            {submission ? <StatusBadge status={submission.status} /> : <StatusBadge status="pending" />}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">NPTEL Score</div>
          <span className="value">{submission?.score ?? 0}</span>
        </div>
        <div className="stat-card">
          <div className="label">Certificate Status</div>
          <div style={{ marginTop: '12px' }}>
            {submission ? <StatusBadge status={submission.status} /> : <StatusBadge status="pending" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
