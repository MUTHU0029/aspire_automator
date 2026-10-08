import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Download } from 'lucide-react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const exams = ['TNPSC', 'TANCET', 'GRE'];
const outcomeOptions = {
  TNPSC: [{ value: 'post_selected', label: 'Selected for a post' }],
  TANCET: [{ value: 'masters_joined', label: "Joined a master's program" }],
  GRE: [{ value: 'masters_joined', label: "Joined a master's program" }],
};

const outcomeLabels = {
  pending: 'Pending / not yet achieved',
  masters_joined: "Joined a master's program",
  post_selected: 'Selected for a post',
};

const OtherExaminationsPage = () => {
  const [exam, setExam] = useState('TNPSC');
  const [appeared, setAppeared] = useState('true');
  const [score, setScore] = useState('');
  const [outcome, setOutcome] = useState('pending');
  const [proof, setProof] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAttempts = async () => {
    try {
      const { data } = await api.get('/student/examinations/my');
      setAttempts(data.attempts || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load examination records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleExamChange = (event) => {
    const nextExam = event.target.value;
    setExam(nextExam);
    setOutcome('pending');
  };

  const submitAttempt = async (event) => {
    event.preventDefault();
    const hasAppeared = appeared === 'true';

    if (hasAppeared) {
      const numericScore = Number(score);
      if (!Number.isFinite(numericScore) || numericScore < 0) {
        return toast.error('Enter a valid score of 0 or higher');
      }
      if (!proof) {
        return toast.error('Upload your exam proof PDF');
      }
      if (proof.type !== 'application/pdf' && !proof.name.toLowerCase().endsWith('.pdf')) {
        return toast.error('Only PDF proof files are allowed');
      }
      if (proof.size > 5 * 1024 * 1024) {
        return toast.error('Proof PDF must be less than 5 MB');
      }
    }

    const formData = new FormData();
    formData.append('exam', exam);
    formData.append('appeared', String(hasAppeared));
    if (hasAppeared) {
      formData.append('score', score);
      formData.append('outcome', outcome);
      formData.append('proof', proof);
    }

    setSubmitting(true);
    try {
      await api.post('/student/examinations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Examination attempt recorded');
      setAppeared('true');
      setScore('');
      setOutcome('pending');
      setProof(null);
      document.getElementById('exam-proof').value = '';
      await fetchAttempts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record examination attempt');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadProof = async (attempt) => {
    try {
      const { data } = await api.get(`/student/examinations/${attempt._id}/proof`, { responseType: 'blob' });
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
    <div style={{ display: 'grid', gap: '22px' }}>
      <div className="panel">
        <div className="panel-header">
          <h3>Other Examinations</h3>
        </div>
        <form onSubmit={submitAttempt} className="auth-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="other-exam">Examination</label>
              <select id="other-exam" value={exam} onChange={handleExamChange}>
                {exams.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="exam-appeared">Appearance</label>
              <select id="exam-appeared" value={appeared} onChange={(event) => setAppeared(event.target.value)}>
                <option value="true">Appeared</option>
                <option value="false">Not appeared</option>
              </select>
            </div>
            {appeared === 'true' && (
              <>
                <div className="form-field">
                  <label htmlFor="exam-score">Score</label>
                  <input id="exam-score" type="number" min="0" step="any" value={score} onChange={(event) => setScore(event.target.value)} required />
                </div>
                <div className="form-field">
                  <label htmlFor="exam-outcome">Outcome</label>
                  <select id="exam-outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)}>
                    <option value="pending">Pending / not yet achieved</option>
                    {outcomeOptions[exam].map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="exam-proof">Score proof (PDF, max 5 MB)</label>
                  <input
                    id="exam-proof"
                    className="file-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(event) => setProof(event.target.files[0] || null)}
                    required
                  />
                </div>
              </>
            )}
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Examination Attempt'}
          </button>
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>My Examination Attempts</h3>
        </div>
        {loading ? <LoadingSpinner /> : attempts.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date Recorded</th>
                  <th>Examination</th>
                  <th>Appeared</th>
                  <th>Score</th>
                  <th>Outcome</th>
                  <th>Proof</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt._id}>
                    <td>{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td>{attempt.exam}</td>
                    <td>{attempt.appeared ? 'Yes' : 'No'}</td>
                    <td>{attempt.appeared ? attempt.score : '—'}</td>
                    <td>{attempt.appeared ? outcomeLabels[attempt.outcome] : '—'}</td>
                    <td>
                      {attempt.appeared && (
                        <button className="btn btn-secondary" type="button" onClick={() => downloadProof(attempt)}>
                          <Download size={15} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                          Download PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No examination attempts recorded yet.</div>}
      </div>
    </div>
  );
};

export default OtherExaminationsPage;
