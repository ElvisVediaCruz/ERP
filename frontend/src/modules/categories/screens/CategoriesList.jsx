import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tags } from 'lucide-react';
import { listCategories } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';
import { useNotifications } from '@shared/context/NotificationContext';
import DeleteCategoryDialog from './DeleteCategoryDialog';

export default function CategoriesList() {
  const navigate = useNavigate();
  const { pushToast } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => {
    setLoading(true);
    listCategories()
      .then(setCategories)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeleted = () => {
    setPendingDelete(null);
    pushToast('Categoría eliminada', 'success');
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Categorías</h2>
        <Link className="btn btn-primary" to="/categories/new">
          Nueva categoría
        </Link>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && categories.length === 0 && (
        <EmptyState
          icon={Tags}
          title="Aún no hay categorías registradas"
          description="Las categorías que registres aparecerán aquí."
          actionLabel="Nueva categoría"
          onAction={() => navigate('/categories/new')}
        />
      )}

      {!loading && categories.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>{category.status ? 'Activa' : 'Inactiva'}</td>
                <td className="actions">
                  <Link className="btn-link" to={`/categories/${category.id}/edit`}>
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn-link"
                    style={{ color: 'var(--color-danger)' }}
                    onClick={() => setPendingDelete(category)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <DeleteCategoryDialog
          category={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
