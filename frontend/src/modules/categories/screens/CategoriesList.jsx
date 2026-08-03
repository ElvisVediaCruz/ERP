import { useEffect, useMemo, useState } from 'react';
import { Tags, ChevronUp, ChevronDown } from 'lucide-react';
import { listCategories, searchCategories, updateCategoryStatus } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';
import ToggleSwitch from '@shared/components/common/ToggleSwitch';
import RowActionsMenu from '@shared/components/common/RowActionsMenu';
import { useNotifications } from '@shared/context/NotificationContext';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import CategoryFormModal from './CategoryFormModal';

const PAGE_SIZE = 10;

export default function CategoriesList() {
  const { pushToast } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [formCategory, setFormCategory] = useState(undefined);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState(null);

  const hasSearch = search.trim().length > 0;

  const load = () => {
    setLoading(true);
    const request = hasSearch
      ? searchCategories(search.trim()).then((data) => ({ data }))
      : listCategories({ limit: 100 });
    request
      .then(({ data }) => setCategories(data))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [search]);

  const visibleCategories = useMemo(() => {
    let result = categories;

    if (sortDirection) {
      result = [...result].sort((a, b) => {
        const comparison = (a.name ?? '').localeCompare(b.name ?? '', undefined, {
          sensitivity: 'base',
        });
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [categories, sortDirection]);

  useEffect(() => {
    setPage(1);
  }, [search, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / PAGE_SIZE));
  const pagedCategories = visibleCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSortByName = () => {
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

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
        <button type="button" className="btn btn-primary" onClick={() => setFormCategory(null)}>
          Nueva categoría
        </button>
      </div>

      <div className="filters">
        <input
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && categories.length === 0 && hasSearch && (
        <EmptyState icon={Tags} title="No hay categorías que coincidan con la búsqueda" />
      )}

      {!loading && categories.length === 0 && !hasSearch && (
        <EmptyState
          icon={Tags}
          title="Aún no hay categorías registradas"
          description="Las categorías que registres aparecerán aquí."
          actionLabel="Nueva categoría"
          onAction={() => setFormCategory(null)}
        />
      )}

      {!loading && categories.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th className="sortable-th" onClick={handleSortByName}>
                  <span className="sortable-th-label">
                    Nombre
                    {sortDirection === 'asc' && <ChevronUp size={14} />}
                    {sortDirection === 'desc' && <ChevronDown size={14} />}
                  </span>
                </th>
                <th>Descripción</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagedCategories.map((category) => (
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
                  <td>
                    <RowActionsMenu
                      label={`Opciones para ${category.name}`}
                      actions={[
                        { label: 'Editar', onClick: () => setFormCategory(category) },
                        {
                          label: 'Eliminar',
                          variant: 'danger',
                          onClick: () => setPendingDelete(category),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pagedCategories.length === 0 && (
            <EmptyState icon={Tags} title="No hay categorías que coincidan con la búsqueda" />
          )}

          <div className="pagination">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span className="hint">
              Página {page} de {totalPages} ({visibleCategories.length} categorías)
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

      {formCategory !== undefined && (
        <CategoryFormModal
          category={formCategory}
          onClose={() => setFormCategory(undefined)}
          onSaved={() => {
            setFormCategory(undefined);
            pushToast('Categoría guardada con éxito', 'success');
            load();
          }}
        />
      )}
    </div>
  );
}
