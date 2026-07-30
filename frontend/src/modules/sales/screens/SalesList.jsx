import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { listSales } from '../services/sales.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';
import EmptyState from '@shared/components/common/EmptyState';

export default function SalesList() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listSales({ page, limit: meta.limit })
      .then(({ data, meta: responseMeta }) => {
        setSales(data);
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
        <h2>Ventas</h2>
        <Link className="btn btn-primary" to="/sales/new">
          Nueva venta
        </Link>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {!loading && sales.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="Aún no hay ventas registradas"
          description="Las ventas que registres aparecerán aquí."
          actionLabel="Nueva venta"
          onAction={() => navigate('/sales/new')}
        />
      )}

      {!loading && sales.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.receipt_number}</td>
                  <td>{sale.sale_date}</td>
                  <td>{sale.total}</td>
                  <td>
                    <Link className="btn-link" to={`/sales/${sale.id}`}>
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
              Página {meta.page} de {totalPages} ({meta.total} ventas)
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
