import { useState } from 'react';
import { useNotifications } from '@shared/context/NotificationContext';

export default function LowStockScreen() {
  const { lowStockItems, expiringSoonItems } = useNotifications();
  const [tab, setTab] = useState('low-stock');

  const items = tab === 'low-stock' ? lowStockItems : expiringSoonItems;

  return (
    <div>
      <h2>Alertas de inventario</h2>

      <div className="actions" style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={tab === 'low-stock' ? 'btn btn-primary' : 'btn'}
          onClick={() => setTab('low-stock')}
        >
          Stock bajo ({lowStockItems.length})
        </button>
        <button
          type="button"
          className={tab === 'expiring' ? 'btn btn-primary' : 'btn'}
          onClick={() => setTab('expiring')}
        >
          Próximos a vencer ({expiringSoonItems.length})
        </button>
      </div>

      {tab === 'low-stock' && (
        <p className="hint">Productos cuyo stock actual es menor o igual al stock mínimo definido.</p>
      )}
      {tab === 'expiring' && (
        <p className="hint">
          Productos activos con fecha de vencimiento en los próximos 30 días (calculado sobre los
          primeros ~500 productos activos).
        </p>
      )}

      {items.length === 0 && (
        <div className="low-stock-banner">No hay productos en esta categoría por ahora.</div>
      )}

      {items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              {tab === 'low-stock' ? (
                <>
                  <th>Stock</th>
                  <th>Mínimo</th>
                </>
              ) : (
                <th>Vence el</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                <td>{product.code}</td>
                <td>{product.name}</td>
                {tab === 'low-stock' ? (
                  <>
                    <td style={{ color: 'var(--color-danger)' }}>{product.stock}</td>
                    <td>{product.minimum_stock}</td>
                  </>
                ) : (
                  <td style={{ color: 'var(--color-warning-border)' }}>{product.expiration_date}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
