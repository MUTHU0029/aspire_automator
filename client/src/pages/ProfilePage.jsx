import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Profile</h3>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Name</div>
          <h4 style={{ margin: '8px 0 0' }}>{user.name}</h4>
        </div>

        <div className="profile-card">
          <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Email</div>
          <h4 style={{ margin: '8px 0 0' }}>{user.email}</h4>
        </div>

        <div className="profile-card">
          <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Role</div>
          <h4 style={{ margin: '8px 0 0' }}>{user.role}</h4>
        </div>

        {user.role === 'student' && (
          <>
            <div className="profile-card">
              <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Register Number</div>
              <h4 style={{ margin: '8px 0 0' }}>{user.registerNumber}</h4>
            </div>
            <div className="profile-card">
              <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</div>
              <h4 style={{ margin: '8px 0 0' }}>{user.department}</h4>
            </div>
            <div className="profile-card">
              <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Year / Section</div>
              <h4 style={{ margin: '8px 0 0' }}>{user.year} / {user.section}</h4>
            </div>
          </>
        )}

        {user.role === 'faculty' && (
          <div className="profile-card">
            <div style={{ color: '#5f6d7b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</div>
            <h4 style={{ margin: '8px 0 0' }}>{user.department}</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
