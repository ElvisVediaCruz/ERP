import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tags } from 'lucide-react';
import { listCategories, updateCategoryStatus } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';
import ToggleSwitch from '@shared/components/common/ToggleSwitch';
import { useNotifications } from '@shared/context/NotificationContext';
import DeleteCategoryDialog from './DeleteCategoryDialog';

export default function CategoriesList() {
  const navigate = useNavigate();
  const { pushToast } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    listCategories({ page, limit: meta.limit })
      .then(({ data, meta: responseMeta }) => {
        setCategories(data);
        setMeta(responseMeta);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [page]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleDeleted = () => {
    setPendingDelete(null);
    pushToast('Categoría eliminada', 'success');
    load();
  };

  const handleToggleStatus = async (category) => {
    setTogglingId(category.id);
    try {
      await updateCategoryStatus(category.id, Boolean(category.status));
      pushToast(category.status ? 'Categoría desactivada' : 'Categoría activada', 'success');
      load();
    } catch (err) {
      pushToast('No se pudo actualizar el estado de la categoría', 'error');
    } finally {
      setTogglingId(null);
    }
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
        <>
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
                  <td>
                    <ToggleSwitch
                      checked={category.status}
                      disabled={togglingId === category.id}
                      onChange={() => handleToggleStatus(category)}
                      label={category.status ? 'Desactivar categoría' : 'Activar categoría'}
                    />
                  </td>
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

          <div className="pagination">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span className="hint">
              Página {meta.page} de {totalPages} ({meta.total} categorías)
            </span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
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
