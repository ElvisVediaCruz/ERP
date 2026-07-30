import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPurchase } from '../services/purchases.service';
import { listSuppliers } from '@modules/suppliers/services/suppliers.service';
import { listProducts } from '@modules/products/services/products.service';
import { useUser } from '@shared/context/UserContext';
import { useNotifications } from '@shared/context/NotificationContext';
import ErrorBanner from '@shared/components/common/ErrorBanner';

const emptyItem = { product_id: '', quantity: 1, purchase_price: '' };

export default function NewPurchaseForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { pushToast } = useNotifications();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listSuppliers({ status: 'true' }).then(setSuppliers).catch(() => {});
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
          next.purchase_price = product ? product.purchase_price : '';
        }
        return next;
      })
    );
  };

  const total = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.purchase_price) || 0),
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
      const purchase = await createPurchase({
        supplier_id: Number(supplierId),
        user_id: user.id,
        invoice_number: invoiceNumber || undefined,
        description: description || undefined,
        items: validItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          purchase_price: Number(item.purchase_price),
        })),
      });
      pushToast('Compra registrada', 'success');
      navigate(`/purchases/${purchase.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Nueva compra</h2>
      <ErrorBanner error={error} />

      <form className="form" style={{ maxWidth: 800 }} onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="supplier_id">Proveedor</label>
          <select
            id="supplier_id"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Selecciona un proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="invoice_number">Número de factura</label>
          <input id="invoice_number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="description">Notas</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio de compra</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
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
                    value={item.purchase_price}
                    onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                  />
                </td>
                <td>{((Number(item.quantity) || 0) * (Number(item.purchase_price) || 0)).toFixed(2)}</td>
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
            ))}
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
            {submitting ? 'Guardando...' : 'Registrar compra'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/purchases')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
