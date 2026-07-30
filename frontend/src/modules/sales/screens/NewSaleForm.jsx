import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSale } from '../services/sales.service';
import { listPaymentMethods } from '@modules/payment-methods/services/payment-methods.service';
import { listProducts } from '@modules/products/services/products.service';
import { useUser } from '@shared/context/UserContext';
import { useNotifications } from '@shared/context/NotificationContext';
import ErrorBanner from '@shared/components/common/ErrorBanner';

const emptyItem = { product_id: '', quantity: 1, sale_price: '', catalogPrice: null };

export default function NewSaleForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { pushToast } = useNotifications();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listPaymentMethods().then(setPaymentMethods).catch(() => {});
    listProducts({ status: 'true', limit: 100 })
      .then(({ data }) => setProducts(data))
      .catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    setItems(
      items.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'product_id') {
          const product = products.find((p) => String(p.id) === String(value));
          next.sale_price = product ? product.sale_price : '';
          next.catalogPrice = product ? product.sale_price : null;
        }
        return next;
      })
    );
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

      <form className="form" style={{ maxWidth: 800 }} onSubmit={handleSubmit}>
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

        <table className="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de venta</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const priceDiffers =
                item.catalogPrice !== null && Number(item.sale_price) !== Number(item.catalogPrice);
              return (
                <tr key={index}>
                  <td>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    >
                      <option value="">Selecciona un producto</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
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
                  <td>{((Number(item.quantity) || 0) * (Number(item.sale_price) || 0)).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-link"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr className="totals-row">
              <td colSpan={3}>Total (vista previa)</td>
              <td colSpan={2}>{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div>
          <button type="button" className="btn" onClick={addItem}>
            + Agregar línea
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Registrar venta'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/sales')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
