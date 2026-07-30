import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPurchase } from '../services/purchases.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import LoadingSpinner from '@shared/components/common/LoadingSpinner';

export default function PurchaseDetail() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPurchase(id)
      .then(setPurchase)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <h2>Compra #{id}</h2>
        <div className="actions">
          <button type="button" className="btn" onClick={() => window.print()}>
            Imprimir
          </button>
          <Link className="btn" to="/purchases">
            Volver
          </Link>
        </div>
      </div>

      <ErrorBanner error={error} />
      {loading && <LoadingSpinner />}

      {purchase && (
        <div className="print-header">
          <h1>Inventario y Ventas</h1>
          <p>Orden de compra</p>
        </div>
      )}

      {purchase && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <p>
            <strong>Factura:</strong> {purchase.invoice_number || '—'}
          </p>
          <p>
            <strong>Fecha:</strong> {purchase.purchase_date}
          </p>
          <p>
            <strong>Total:</strong> {purchase.total}
          </p>
          {purchase.description && (
            <p>
              <strong>Notas:</strong> {purchase.description}
            </p>
          )}
        </div>
      )}

      {purchase && (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de compra</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {purchase.details.map((line) => (
              <tr key={line.id}>
                <td>{line.product_id}</td>
                <td>{line.quantity}</td>
                <td>{line.purchase_price}</td>
                <td>{line.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
