import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { listUsers, deactivateUser } from '../services/users.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import ConfirmDialog from '@shared/components/common/ConfirmDialog';
import EmptyState from '@shared/components/common/EmptyState';
import { useNotifications } from '@shared/context/NotificationContext';

export default function UsersList() {
  const { pushToast } = useNotifications();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);

  const load = () => {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeactivate = async () => {
    try {
      await deactivateUser(pendingDeactivate.id);
      setPendingDeactivate(null);
      pushToast('Usuario desactivado', 'success');
      load();
    } catch (err) {
      setError(err);
      setPendingDeactivate(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && users.length === 0 && (
        <EmptyState icon={Users} title="Aún no hay usuarios registrados" />
      )}

      {!loading && users.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name} {u.last_name}
                </td>
                <td>{u.username}</td>
                <td>{u.role_name}</td>
                <td className="actions">
                  <Link className="btn-link" to={`/users/${u.id}/edit`}>
                    Editar rol
                  </Link>
                  <button
                    type="button"
                    className="btn-link"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => setPendingDeactivate(u)}
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog
        open={!!pendingDeactivate}
        message={`¿Desactivar el acceso de "${pendingDeactivate?.name} ${pendingDeactivate?.last_name ?? ''}"?`}
        warning="Esta acción desactiva el acceso del usuario y no se puede revertir desde esta pantalla (requiere un endpoint de backend para reactivar, pendiente)."
        onConfirm={handleDeactivate}
        onCancel={() => setPendingDeactivate(null)}
      />
    </div>
  );
}
