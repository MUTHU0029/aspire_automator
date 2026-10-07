import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const NptelStatusPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/student/nptel/my');
        setSubmissions(data.submissions || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load NPTEL status');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!submissions.length) {
    return <div className="empty-state">No NPTEL submissions yet.</div>;
  }

  const latest = submissions[0];

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>NPTEL Status</h3>
      </div>

      <div className="status-summary-grid">
        <div className="status-summary-card">
          <span className="status-label">Course</span>
          <strong>{latest.courseName}</strong>
        </div>
        <div className="status-summary-card">
          <span className="status-label">Course ID</span>
          <strong>{latest.courseId || 'N/A'}</strong>
        </div>
        <div className="status-summary-card">
          <span className="status-label">Score</span>
          <strong>{latest.score}</strong>
        </div>
        <div className="status-summary-card">
          <span className="status-label">Status</span>
          <strong>{latest.status === 'pending' ? 'Pending Approval' : latest.status === 'approved' ? 'Approved' : 'Rejected'}</strong>
        </div>
      </div>

      {latest.status === 'rejected' && (
        <div className="comment-box">
          <span className="status-label">Faculty Comment</span>
          <p>{latest.facultyComment || 'No comment provided'}</p>
        </div>
      )}

      <div style={{ marginTop: '18px' }}>
        <StatusBadge status={latest.status} />
      </div>
    </div>
  );
};

export default NptelStatusPage;
