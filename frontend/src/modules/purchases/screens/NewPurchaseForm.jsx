import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPurchase } from '../services/purchases.service';
import { listSuppliers } from '@modules/suppliers/services/suppliers.service';
import { useUser } from '@shared/context/UserContext';
import { useNotifications } from '@shared/context/NotificationContext';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import ProductAutocomplete from '@shared/components/common/ProductAutocomplete';
import QuickAddProductDialog from './QuickAddProductDialog';

export default function NewPurchaseForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { pushToast } = useNotifications();

  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [items, setItems] = useState([]);
  const [searchKey, setSearchKey] = useState(0);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listSuppliers({ status: 'true', limit: 100 })
      .then(({ data }) => setSuppliers(data))
      .catch(() => {});
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
        purchase_price: product.purchase_price ?? '',
      },
    ]);
    setSearchKey((k) => k + 1);
  };

  const handleProductCreated = (product) => {
    addProduct(product);
    setShowNewProductModal(false);
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
        purchase_date: purchaseDate || undefined,
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

      <form className="line-items-layout" onSubmit={handleSubmit}>
        <div className="line-items-main">
          <div className="line-items-top-fields">
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
              <label htmlFor="purchase_date">Fecha de compra</label>
              <input
                id="purchase_date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Notas</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="field">
            <label>Buscar producto</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <ProductAutocomplete key={searchKey} value="" onSelect={addProduct} />
              <button type="button" className="btn" onClick={() => setShowNewProductModal(true)}>
                + Nuevo producto
              </button>
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre del producto</th>
                <th>Precio de compra</th>
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
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_code}</td>
                  <td>{item.product_name}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.purchase_price}
                      onChange={(e) => updateItem(index, 'purchase_price', e.target.value)}
                    />
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
              ))}
            </tbody>
          </table>
        </div>

        <aside className="line-items-summary card">
          <h3>Resumen de compras</h3>
          <p>
            Productos: <strong>{items.length}</strong>
          </p>
          <p>
            Total: <strong>{total.toFixed(2)}</strong>
          </p>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Registrar compra'}
            </button>
            <button type="button" className="btn" onClick={() => navigate('/purchases')}>
              Cancelar
            </button>
          </div>
        </aside>
      </form>

      {showNewProductModal && (
        <QuickAddProductDialog
          onClose={() => setShowNewProductModal(false)}
          onCreated={handleProductCreated}
        />
      )}
    </div>
  );
}
