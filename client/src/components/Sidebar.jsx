import { BarChart3, BookOpenCheck, FileText, GraduationCap, LogOut, User, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const facultyItems = [
  { label: 'Dashboard', to: '/faculty/dashboard', icon: BarChart3 },
  { label: 'GATE Score Entry', to: '/faculty/gate', icon: BookOpenCheck },
  { label: 'NPTEL Approval', to: '/faculty/nptel-approval', icon: FileText },
  { label: 'Other Examinations', to: '/faculty/examinations', icon: FileText },
  { label: 'Students', to: '/faculty/students', icon: Users },
  { label: 'Profile', to: '/profile', icon: User },
];

const studentItems = [
  { label: 'Dashboard', to: '/student/dashboard', icon: BarChart3 },
  { label: 'My GATE Scores', to: '/student/gate', icon: BookOpenCheck },
  { label: 'NPTEL Submission', to: '/student/nptel-submission', icon: FileText },
  { label: 'NPTEL Status', to: '/student/nptel-status', icon: User },
  { label: 'Other Examinations', to: '/student/examinations', icon: FileText },
  { label: 'Profile', to: '/profile', icon: User },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = user?.role === 'faculty' ? facultyItems : studentItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><GraduationCap size={22} /></div>
        <div>
          <h3>Campus Gate</h3>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Academic Office</div>
        </div>
      </div>

      <nav className="nav-list">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button className="nav-link" onClick={handleLogout} type="button" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
