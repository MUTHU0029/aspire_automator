import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

const NptelApprovalPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ department: '', year: '', section: '', status: 'all' });
  const [selectedId, setSelectedId] = useState(null);
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const query = { ...filters };
      if (query.status === 'all') {
        delete query.status;
      }

      const { data } = await api.get('/faculty/nptel', { params: query });
      setSubmissions(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load NPTEL submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters.department, filters.year, filters.section, filters.status]);

  const approveSubmission = async (id) => {
    setReviewing(true);
    try {
      await api.patch(`/faculty/nptel/${id}/review`, { decision: 'approved' });
      toast.success('Submission approved');
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setReviewing(false);
    }
  };

  const rejectSubmission = async () => {
    if (!selectedId) return;
    setReviewing(true);
    try {
      await api.patch(`/faculty/nptel/${selectedId}/review`, { decision: 'rejected', reason: comment });
      toast.success('Submission rejected');
      setComment('');
      setSelectedId(null);
      fetchSubmissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setReviewing(false);
    }
  };

  const openCertificate = async (id) => {
    try {
      const { data } = await api.get(`/faculty/nptel/${id}/certificate`, { responseType: 'blob' });
      const fileUrl = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open certificate preview');
    }
  };

  const filteredSubmissions = submissions.filter((item) => {
    const student = item.student || {};
    if (filters.department && student.department !== filters.department) return false;
    if (filters.year && student.year !== filters.year) return false;
    if (filters.section && student.section !== filters.section) return false;
    return true;
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>NPTEL Score Approval</h3>
      </div>

      <div className="filter-row" style={{ marginBottom: '18px' }}>
        <div className="form-field" style={{ flex: '1 1 220px' }}>
          <label htmlFor="nptel-department">Department</label>
          <select id="nptel-department" value={filters.department} onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}>
            <option value="">All departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>
        </div>

        <div className="form-field" style={{ flex: '1 1 160px' }}>
          <label htmlFor="nptel-year">Year</label>
          <select id="nptel-year" value={filters.year} onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}>
            <option value="">All years</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        <div className="form-field" style={{ flex: '1 1 160px' }}>
          <label htmlFor="nptel-section">Section</label>
          <select id="nptel-section" value={filters.section} onChange={(event) => setFilters((prev) => ({ ...prev, section: event.target.value }))}>
            <option value="">All sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        <div className="form-field" style={{ flex: '1 1 180px' }}>
          <label htmlFor="nptel-status">Status</label>
          <select id="nptel-status" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        filteredSubmissions.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Register No</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Certificate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((item) => (
                  <tr key={item._id}>
                    <td>{item.student?.name}</td>
                    <td>{item.student?.registerNumber}</td>
                    <td>{item.courseName}</td>
                    <td>{item.score}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => openCertificate(item._id)} style={{ width: 'fit-content' }}>View Proof</button>
                        <small style={{ color: '#5f6d7b' }}>{item.certificateFileName || 'Certificate uploaded'}</small>
                      </div>
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-success" onClick={() => approveSubmission(item._id)} disabled={reviewing}>Approve</button>
                          <button className="btn btn-danger" onClick={() => setSelectedId(item._id)} disabled={reviewing}>Reject</button>
                        </div>
                      ) : (
                        item.facultyComment || 'Reviewed'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No pending NPTEL submissions</div>
      )}

      <Modal open={Boolean(selectedId)} title="Reject Submission" onClose={() => setSelectedId(null)}>
        <div className="form-field">
          <label>Rejection reason</label>
          <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows="4" placeholder="Certificate is not clearly visible" />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={() => setSelectedId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={rejectSubmission} disabled={reviewing || !comment.trim()}>
            {reviewing ? 'Processing...' : 'Reject Submission'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NptelApprovalPage;
