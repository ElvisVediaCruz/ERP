import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSale } from '../services/sales.service';
import { listPaymentMethods } from '@modules/payment-methods/services/payment-methods.service';
import { useUser } from '@shared/context/UserContext';
import { useNotifications } from '@shared/context/NotificationContext';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import ProductAutocomplete from '@shared/components/common/ProductAutocomplete';

export default function NewSaleForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { pushToast } = useNotifications();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([]);
  const [searchKey, setSearchKey] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPaymentMethods({ status: 'true' }).then(setPaymentMethods).catch(() => {});
  }, []);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addProduct = (product) => {
    setItems([
      ...items,
      {
        product_id: product.id,
        product_name: product.name,
        product_code: product.code ?? '',
        quantity: 1,
        sale_price: product.sale_price ?? '',
        catalogPrice: product.sale_price ?? null,
      },
    ]);
    setSearchKey((k) => k + 1);
  };

  const total = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.sale_price) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((item) => item.product_id && Number(item.quantity) > 0);
    if (validItems.length === 0) {
      setError({ code: 'BAD_REQUEST', message: 'Agrega al menos un producto con cantidad mayor a 0.' });
      return;
    }

    setSubmitting(true);
    try {
      const sale = await createSale({
        payment_method_id: Number(paymentMethodId),
        receipt_number: receiptNumber || undefined,
        customer_id: customerId ? Number(customerId) : undefined,
        user_id: user.id,
        items: validItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          sale_price: item.sale_price !== '' ? Number(item.sale_price) : undefined,
        })),
      });
      pushToast('Venta registrada', 'success');
      navigate(`/sales/${sale.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Nueva venta</h2>
      <ErrorBanner error={error} />

      <form className="line-items-layout" onSubmit={handleSubmit}>
        <div className="line-items-main">
          <div className="line-items-top-fields">
            <div className="field">
              <label htmlFor="payment_method_id">Método de pago</label>
              <select
                id="payment_method_id"
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                required
              >
                <option value="">Selecciona un método de pago</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="receipt_number">Número de comprobante</label>
              <input id="receipt_number" value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="customer_id">Cliente (opcional)</label>
              <input
                id="customer_id"
                type="number"
                min="1"
                placeholder="id de cliente existente"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Buscar producto</label>
            <ProductAutocomplete key={searchKey} value="" onSelect={addProduct} type="sale" />
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre del producto</th>
                <th>Precio de venta</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="hint">
                    Agrega productos con el buscador de arriba.
                  </td>
                </tr>
              )}
              {items.map((item, index) => {
                const priceDiffers =
                  item.catalogPrice !== null && Number(item.sale_price) !== Number(item.catalogPrice);
                return (
                  <tr key={index}>
                    <td>{item.product_code}</td>
                    <td>{item.product_name}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.sale_price}
                        onChange={(e) => updateItem(index, 'sale_price', e.target.value)}
                      />
                      {priceDiffers && (
                        <span className="price-hint">Precio de catálogo: {item.catalogPrice}</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-link"
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => removeItem(index)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="line-items-summary card">
          <h3>Resumen de venta</h3>
          <p>
            Productos: <strong>{items.length}</strong>
          </p>
          <p>
            Total: <strong>{total.toFixed(2)}</strong>
          </p>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Registrar venta'}
            </button>
            <button type="button" className="btn" onClick={() => navigate('/sales')}>
              Cancelar
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
