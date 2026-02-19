import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminResults from './pages/AdminResults';
import AdminTests from './pages/AdminTests';
import CandidateDashboard from './pages/CandidateDashboard';
import CandidateHistory from './pages/CandidateHistory';
import CandidateTests from './pages/CandidateTests';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

const Private = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/login/${role}`} replace />;
  return user.role === role ? children : <Navigate to={`/login/${user.role}`} replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login/candidate" replace />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/admin" element={<Private role="admin"><DashboardLayout /></Private>}>
        <Route index element={<AdminDashboard />} />
        <Route path="tests" element={<AdminTests />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="/candidate" element={<Private role="candidate"><DashboardLayout /></Private>}>
        <Route index element={<CandidateDashboard />} />
        <Route path="tests" element={<CandidateTests />} />
        <Route path="history" element={<CandidateHistory />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}
