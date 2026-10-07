import { UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="user-chip">
        <div className="brand-icon" style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
          <UserCircle2 size={18} />
        </div>
        <div>
          <strong>{user?.name}</strong>
          <div style={{ fontSize: '0.8rem', color: '#5f6d7b' }}>{user?.role}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
