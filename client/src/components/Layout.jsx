import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ title = 'Dashboard' }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-panel">
      <Topbar title={title} />
      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
