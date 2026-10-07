import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const NptelSubmissionPage = () => {
  const [form, setForm] = useState({ courseName: '', courseId: '', score: '' });
  const [certificate, setCertificate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.courseName.trim()) {
      return toast.error('Course name is required');
    }

    const score = Number(form.score);
    if (Number.isNaN(score) || score < 0 || score > 100) {
      return toast.error('Score must be between 0 and 100');
    }

    if (!certificate) {
      return toast.error('Certificate upload is required');
    }

    if (certificate.type !== 'application/pdf' && !certificate.name.toLowerCase().endsWith('.pdf')) {
      return toast.error('Invalid certificate format. Only PDF files are allowed');
    }

    if (certificate.size > 5 * 1024 * 1024) {
      return toast.error('Certificate must be less than 5 MB');
    }

    const formData = new FormData();
    formData.append('courseName', form.courseName);
    formData.append('courseId', form.courseId);
    formData.append('score', String(score));
    formData.append('certificate', certificate);

    try {
      setSubmitting(true);
      await api.post('/student/nptel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('NPTEL submission uploaded successfully');
      setForm({ courseName: '', courseId: '', score: '' });
      setCertificate(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'NPTEL submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Submit NPTEL Score</h3>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="courseName">NPTEL Course Name</label>
            <input id="courseName" name="courseName" value={form.courseName} onChange={handleChange} placeholder="e.g. IoT" />
          </div>
          <div className="form-field">
            <label htmlFor="courseId">NPTEL Course ID (optional)</label>
            <input id="courseId" name="courseId" value={form.courseId} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-field">
            <label htmlFor="score">NPTEL Score</label>
            <input id="score" name="score" type="number" min="0" max="100" value={form.score} onChange={handleChange} placeholder="0 - 100" />
          </div>
          <div className="form-field">
            <label htmlFor="certificate">Certificate</label>
            <input id="certificate" className="file-input" type="file" accept=".pdf,application/pdf" onChange={(event) => setCertificate(event.target.files[0])} />
          </div>
        </div>

        <div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Uploading...' : 'Submit NPTEL Score'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NptelSubmissionPage;
