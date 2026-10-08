import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import GateEntryPage from './pages/faculty/GateEntryPage';
import NptelApprovalPage from './pages/faculty/NptelApprovalPage';
import ExaminationRecordsPage from './pages/faculty/ExaminationRecordsPage';
import StudentsPage from './pages/faculty/StudentsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import MyGateScoresPage from './pages/student/MyGateScoresPage';
import NptelSubmissionPage from './pages/student/NptelSubmissionPage';
import NptelStatusPage from './pages/student/NptelStatusPage';
import OtherExaminationsPage from './pages/student/OtherExaminationsPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RoleRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/gate" element={<GateEntryPage />} />
              <Route path="/faculty/nptel-approval" element={<NptelApprovalPage />} />
              <Route path="/faculty/examinations" element={<ExaminationRecordsPage />} />
              <Route path="/faculty/students" element={<StudentsPage />} />
            </Route>

            <Route element={<RoleRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/gate" element={<MyGateScoresPage />} />
              <Route path="/student/nptel-submission" element={<NptelSubmissionPage />} />
              <Route path="/student/nptel-status" element={<NptelStatusPage />} />
              <Route path="/student/examinations" element={<OtherExaminationsPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
