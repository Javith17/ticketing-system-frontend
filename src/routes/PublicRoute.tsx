import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

export default function PublicRoute() {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
