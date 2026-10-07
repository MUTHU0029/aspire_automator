import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const MyGateScoresPage = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data } = await api.get('/student/gate/my');
        const gate = data.gateScore || { test1: 0, test2: 0, test3: 0, test4: 0 };
        const total = Number(gate.test1 || 0) + Number(gate.test2 || 0) + Number(gate.test3 || 0) + Number(gate.test4 || 0);
        setScore({ ...gate, total });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load GATE score');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  if (loading) return <LoadingSpinner />;

  const gate = score || { test1: 0, test2: 0, test3: 0, test4: 0, total: 0 };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>My GATE Scores</h3>
      </div>

      <div className="score-card-grid">
        <div className="score-card">
          <span className="score-label">Test 1</span>
          <strong>{gate.test1 || 0}</strong>
          <small>/ 60</small>
        </div>
        <div className="score-card">
          <span className="score-label">Test 2</span>
          <strong>{gate.test2 || 0}</strong>
          <small>/ 40</small>
        </div>
        <div className="score-card">
          <span className="score-label">Test 3</span>
          <strong>{gate.test3 || 0}</strong>
          <small>/ 60</small>
        </div>
        <div className="score-card">
          <span className="score-label">Test 4</span>
          <strong>{gate.test4 || 0}</strong>
          <small>/ 40</small>
        </div>
        <div className="score-card total-card">
          <span className="score-label">Total</span>
          <strong>{gate.total || 0}</strong>
          <small>/ 200</small>
        </div>
      </div>
    </div>
  );
};

export default MyGateScoresPage;
