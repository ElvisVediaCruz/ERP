import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { listPurchases } from '../services/purchases.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';

export default function PurchasesList() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listPurchases({ page, limit: meta.limit })
      .then(({ data, meta: responseMeta }) => {
        setPurchases(data);
        setMeta(responseMeta);
      })
      .catch(setError)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <div>
      <div className="page-header">
        <h2>Compras</h2>
        <Link className="btn btn-primary" to="/purchases/new">
          Nueva compra
        </Link>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && purchases.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="Aún no hay compras registradas"
          description="Las compras que registres aparecerán aquí."
          actionLabel="Nueva compra"
          onAction={() => navigate('/purchases/new')}
        />
      )}

      {!loading && purchases.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Factura</th>
                <th>Fecha</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.id}</td>
                  <td>{purchase.invoice_number}</td>
                  <td>{purchase.purchase_date}</td>
                  <td>{purchase.total}</td>
                  <td>
                    <Link className="btn-link" to={`/purchases/${purchase.id}`}>
                      Ver detalle
                    </Link>
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
              Página {meta.page} de {totalPages} ({meta.total} compras)
            </span>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}
