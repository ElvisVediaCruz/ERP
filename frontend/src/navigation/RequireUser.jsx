import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@shared/context/UserContext';
import { getAuth } from '@shared/services/authStorage';

export default function RequireUser() {
  const { user } = useUser();
  if (!user || !getAuth()?.token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
