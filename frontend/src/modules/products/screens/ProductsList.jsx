import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { listProducts, deleteProduct } from '../services/products.service';
import { listCategories } from '@modules/categories/services/categories.service';
import { listSuppliers } from '@modules/suppliers/services/suppliers.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import ConfirmDialog from '@shared/components/common/ConfirmDialog';
import EmptyState from '@shared/components/common/EmptyState';
import { useNotifications } from '@shared/context/NotificationContext';

const emptyFilters = { category_id: '', supplier_id: '', status: '', search: '' };

export default function ProductsList() {
  const navigate = useNavigate();
  const { pushToast } = useNotifications();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    listCategories().then(setCategories).catch(() => {});
    listSuppliers().then(setSuppliers).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    const params = { page, limit: meta.limit };
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.supplier_id) params.supplier_id = filters.supplier_id;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;

    listProducts(params)
      .then(({ data, meta: responseMeta }) => {
        setProducts(data);
        setMeta(responseMeta);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [page, filters]);

  const handleFilterChange = (field) => (e) => {
    setPage(1);
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(pendingDelete.id);
      setPendingDelete(null);
      pushToast('Producto eliminado', 'success');
      load();
    } catch (err) {
      setError(err);
      setPendingDelete(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div>
      <div className="page-header">
        <h2>Productos</h2>
        <div className="actions">
          <Link className="btn" to="/products/low-stock">
            Ver stock bajo
          </Link>
          <Link className="btn btn-primary" to="/products/new">
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="filters">
        <input
          placeholder="Buscar por nombre/código/código de barras"
          value={filters.search}
          onChange={handleFilterChange('search')}
        />
        <select value={filters.category_id} onChange={handleFilterChange('category_id')}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={filters.supplier_id} onChange={handleFilterChange('supplier_id')}>
          <option value="">Todos los proveedores</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.company}
            </option>
          ))}
        </select>
        <select value={filters.status} onChange={handleFilterChange('status')}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="Aún no hay productos registrados"
          description="Los productos que registres aparecerán aquí."
          actionLabel="Registrar producto"
          onAction={() => navigate('/products/new')}
        />
      )}

      {!loading && products.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio venta</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{categories.find((c) => c.id === product.category_id)?.name ?? '—'}</td>
                  <td>{product.sale_price}</td>
                  <td style={product.stock <= product.minimum_stock ? { color: 'var(--color-danger)' } : undefined}>
                    {product.stock}
                  </td>
                  <td>{product.minimum_stock}</td>
                  <td>{product.status ? 'Activo' : 'Inactivo'}</td>
                  <td className="actions">
                    <Link className="btn-link" to={`/products/${product.id}/edit`}>
                      Editar
                    </Link>
                    <button
                      type="button"
                      className="btn-link"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => setPendingDelete(product)}
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
              Página {meta.page} de {totalPages} ({meta.total} productos)
            </span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        message={`¿Eliminar el producto "${pendingDelete?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
