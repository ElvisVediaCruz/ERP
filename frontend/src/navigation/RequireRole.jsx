import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@shared/context/UserContext';

// Este bloqueo es solo de UX/frontend: el backend no valida role_id en estas
// rutas (decisión confirmada). No sustituye un control de autorización real.
export default function RequireRole({ roles }) {
  const { user, hasRole } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(...roles)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
