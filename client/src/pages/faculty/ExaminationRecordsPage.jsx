import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const outcomeLabels = {
  pending: 'Pending / not yet achieved',
  masters_joined: "Joined a master's program",
  post_selected: 'Selected for a post',
};

const ExaminationRecordsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ exam: 'all', department: '', year: '', section: '' });

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/faculty/examinations', { params: filters });
        setAttempts(data.attempts || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load examination records');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [filters]);

  const downloadProof = async (attempt) => {
    try {
      const { data } = await api.get(`/faculty/examinations/${attempt._id}/proof`, { responseType: 'blob' });
      const fileUrl = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = attempt.proofFileName || `${attempt.exam.toLowerCase()}-proof.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download exam proof');
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Other Examination Records</h3>
      </div>

      <div className="filter-row" style={{ marginBottom: '18px' }}>
        <div className="form-field" style={{ flex: '1 1 180px' }}>
          <label htmlFor="examination-filter">Examination</label>
          <select id="examination-filter" value={filters.exam} onChange={(event) => setFilters((prev) => ({ ...prev, exam: event.target.value }))}>
            <option value="all">All examinations</option>
            <option value="TNPSC">TNPSC</option>
            <option value="TANCET">TANCET</option>
            <option value="GRE">GRE</option>
          </select>
        </div>
        <div className="form-field" style={{ flex: '1 1 180px' }}>
          <label htmlFor="examination-department">Department</label>
          <select id="examination-department" value={filters.department} onChange={(event) => setFilters((prev) => ({ ...prev, department: event.target.value }))}>
            <option value="">All departments</option>
            <option value="CSE">CSE</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
          </select>
        </div>
        <div className="form-field" style={{ flex: '1 1 140px' }}>
          <label htmlFor="examination-year">Year</label>
          <select id="examination-year" value={filters.year} onChange={(event) => setFilters((prev) => ({ ...prev, year: event.target.value }))}>
            <option value="">All years</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
        <div className="form-field" style={{ flex: '1 1 140px' }}>
          <label htmlFor="examination-section">Section</label>
          <select id="examination-section" value={filters.section} onChange={(event) => setFilters((prev) => ({ ...prev, section: event.target.value }))}>
            <option value="">All sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : attempts.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Department / Year / Section</th>
                <th>Exam</th>
                <th>Appeared</th>
                <th>Score</th>
                <th>Outcome</th>
                <th>Recorded</th>
                <th>Proof PDF</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt._id}>
                  <td>{attempt.student?.name || '—'}</td>
                  <td>{attempt.student?.registerNumber || '—'}</td>
                  <td>{[attempt.student?.department, attempt.student?.year, attempt.student?.section].filter(Boolean).join(' / ') || '—'}</td>
                  <td>{attempt.exam}</td>
                  <td>{attempt.appeared ? 'Yes' : 'No'}</td>
                  <td>{attempt.appeared ? attempt.score : '—'}</td>
                  <td>{attempt.appeared ? outcomeLabels[attempt.outcome] : '—'}</td>
                  <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                  <td>
                    {attempt.appeared && (
                      <button className="btn btn-secondary" type="button" onClick={() => downloadProof(attempt)}>
                        <Download size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty-state">No examination records match these filters.</div>}
    </div>
  );
};

export default ExaminationRecordsPage;
