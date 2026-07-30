import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSale } from '../services/sales.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';

export default function SaleDetail() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSale(id)
      .then(setSale)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <h2>Venta #{id}</h2>
        <div className="actions">
          <button type="button" className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
          <Link className="btn" to="/sales">
            Volver
          </Link>
        </div>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {sale && (
        <div className="print-header">
          <h1>Inventario y Ventas</h1>
          <p>Comprobante de venta</p>
        </div>
      )}

      {sale && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p>
            <strong>Comprobante:</strong> {sale.receipt_number || '—'}
          </p>
          <p>
            <strong>Fecha:</strong> {sale.sale_date}
          </p>
          <p>
            <strong>Total:</strong> {sale.total}
          </p>
        </div>
      )}

      {sale && (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio cobrado</th>
              <th>Precio de catálogo</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.details.map((line) => {
              const differs = Number(line.sale_price) !== Number(line.original_price);
              return (
                <tr key={line.id}>
                  <td>{line.product_id}</td>
                  <td>{line.quantity}</td>
                  <td style={differs ? { color: 'var(--color-primary)', fontWeight: 600 } : undefined}>
                    {line.sale_price}
                  </td>
                  <td className="hint">{line.original_price}</td>
                  <td>{line.subtotal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
