import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { listSuppliers, deleteSupplier } from '../services/suppliers.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import ConfirmDialog from '@shared/components/common/ConfirmDialog';
import EmptyState from '@shared/components/common/EmptyState';
import { useNotifications } from '@shared/context/NotificationContext';

export default function SuppliersList() {
  const navigate = useNavigate();
  const { pushToast } = useNotifications();
  const [suppliers, setSuppliers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => {
    setLoading(true);
    listSuppliers({ page, limit: meta.limit })
      .then(({ data, meta: responseMeta }) => {
        setSuppliers(data);
        setMeta(responseMeta);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [page]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  const handleDelete = async () => {
    try {
      await deleteSupplier(pendingDelete.id);
      setPendingDelete(null);
      pushToast('Proveedor eliminado', 'success');
      load();
    } catch (err) {
      setError(err);
      setPendingDelete(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Proveedores</h2>
        <Link className="btn btn-primary" to="/suppliers/new">
          Nuevo proveedor
        </Link>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && suppliers.length === 0 && (
        <EmptyState
          icon={Truck}
          title="Aún no hay proveedores registrados"
          description="Los proveedores que registres aparecerán aquí."
          actionLabel="Nuevo proveedor"
          onAction={() => navigate('/suppliers/new')}
        />
      )}

      {!loading && suppliers.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.company}</td>
                  <td>{supplier.contact_name}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="actions">
                    <Link className="btn-link" to={`/suppliers/${supplier.id}/edit`}>
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn-link"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => setPendingDelete(supplier)}
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
              Página {meta.page} de {totalPages} ({meta.total} proveedores)
            </span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        message={`¿Eliminar el proveedor "${pendingDelete?.company}"?`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
