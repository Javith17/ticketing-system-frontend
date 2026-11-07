import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import RolesFeaturesPage from './pages/RolesFeaturesPage';
import CategoriesSourcesPage from './pages/CategoriesSourcesPage';
import AssetsPage from './pages/AssetsPage';
import NcrTicketsPage from './pages/NcrTicketsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AppSnackbar from './components/common/AppSnackbar';

function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles-features" element={<RolesFeaturesPage />} />
            <Route path="/categories-sources" element={<CategoriesSourcesPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/ncr-tickets" element={<NcrTicketsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <AppSnackbar />
    </>
  );
}

export default App;
