import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success('Login successful');
      const target = data.user.role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard';
      navigate(target);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr' }}>
        <div className="auth-side-panel">
          <div>
            <div className="eyebrow">College ERP</div>
            <h1>Aspire Automator</h1>
            <p>
              Faculty mark entry, assessment records, and NPTEL certificate workflows in one academic office dashboard.
            </p>
          </div>

          <ul>
            <li>Regular assessment mark entry</li>
            <li>NPTEL certificate verification</li>
            <li>Student academic snapshot</li>
          </ul>
        </div>

        <div className="auth-main-panel">
          <div className="auth-header">
            <div style={{ display: 'grid', placeItems: 'center', width: '62px', height: '62px', borderRadius: '18px', background: 'rgba(15,39,66,0.08)', color: '#0f2742' }}>
              <GraduationCap size={26} />
            </div>
            <h2>Academic portal</h2>
            <p>Sign in to continue to your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-role-switch">
              <button
                type="button"
                className={`role-button ${!email || email.includes('student') ? 'active' : ''}`}
                onClick={() => setEmail('faculty@college.edu')}
                aria-label="Faculty login"
              >
                Faculty
              </button>
              <button
                type="button"
                className={`role-button ${email.includes('student') ? 'active' : ''}`}
                onClick={() => setEmail('student@college.edu')}
                aria-label="Student login"
              >
                Student
              </button>
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} placeholder="faculty@college.edu" onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} placeholder="Enter password" onChange={(event) => setPassword(event.target.value)} required />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
