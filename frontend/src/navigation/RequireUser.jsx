import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@shared/context/UserContext';

export default function RequireUser() {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
