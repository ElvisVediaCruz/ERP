import { useEffect, useRef, useState } from 'react';
import { createProduct } from '@modules/products/services/products.service';
import { listCategories } from '@modules/categories/services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';

export default function QuickAddProductDialog({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    listCategories({ limit: 100 })
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError({ code: 'BAD_REQUEST', message: 'El nombre es obligatorio.' });
      return;
    }
    if (purchasePrice === '' || Number(purchasePrice) < 0) {
      setError({ code: 'BAD_REQUEST', message: 'El precio de compra es obligatorio.' });
      return;
    }

    setSubmitting(true);
    try {
      const product = await createProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category_id: categoryId || undefined,
        purchase_price: Number(purchasePrice),
      });
      onCreated(product);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Nuevo producto</h3>
        <ErrorBanner error={error} />
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="new_product_name">Nombre</label>
            <input
              id="new_product_name"
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="new_product_category">Categoría</label>
            <select
              id="new_product_category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="new_product_purchase_price">Precio de compra</label>
            <input
              id="new_product_purchase_price"
              type="number"
              step="0.01"
              min="0"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="new_product_description">Descripción</label>
            <textarea
              id="new_product_description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Agregar'}
            </button>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
