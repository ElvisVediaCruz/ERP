import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../services/products.service';
import { listCategories } from '@modules/categories/services/categories.service';
import { listSuppliers } from '@modules/suppliers/services/suppliers.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import { useNotifications } from '@shared/context/NotificationContext';

const emptyForm = {
  category_id: '',
  supplier_id: '',
  code: '',
  barcode: '',
  name: '',
  description: '',
  purchase_price: '',
  sale_price: '',
  stock: '',
  minimum_stock: '',
  expiration_date: '',
  image: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { pushToast } = useNotifications();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    listCategories({ limit: 100 })
      .then(({ data }) => setCategories(data))
      .catch(() => {});
    listSuppliers({ limit: 100 })
      .then(({ data }) => setSuppliers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProduct(id)
      .then((product) =>
        setForm({
          category_id: product.category_id ?? '',
          supplier_id: product.supplier_id ?? '',
          code: product.code ?? '',
          barcode: product.barcode ?? '',
          name: product.name ?? '',
          description: product.description ?? '',
          purchase_price: product.purchase_price ?? '',
          sale_price: product.sale_price ?? '',
          stock: product.stock ?? 0,
          minimum_stock: product.minimum_stock ?? '',
          expiration_date: product.expiration_date ?? '',
          image: product.image ?? '',
        })
      )
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // stock nunca se envía: los cambios de stock solo pasan por compras/ventas.
    const { stock, ...payload } = form;
    try {
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      pushToast('Producto guardado con éxito', 'success');
      navigate('/products');
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <p className="hint">Cargando...</p>;

  return (
    <div>
      <h2>{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
      <ErrorBanner error={error} />
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="category_id">Categoría</label>
          <select id="category_id" value={form.category_id} onChange={handleChange('category_id')}>
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="supplier_id">Proveedor</label>
          <select id="supplier_id" value={form.supplier_id} onChange={handleChange('supplier_id')}>
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.company}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="code">Código</label>
          <input id="code" value={form.code} onChange={handleChange('code')} />
        </div>
        <div className="field">
          <label htmlFor="barcode">Código de barras</label>
          <input id="barcode" value={form.barcode} onChange={handleChange('barcode')} />
        </div>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={form.name} onChange={handleChange('name')} required />
        </div>
        <div className="field">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" value={form.description} onChange={handleChange('description')} rows={3} />
        </div>
        <div className="field">
          <label htmlFor="purchase_price">Precio de compra</label>
          <input
            id="purchase_price"
            type="number"
            step="0.01"
            min="0"
            value={form.purchase_price}
            onChange={handleChange('purchase_price')}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="sale_price">Precio de venta (catálogo)</label>
          <input
            id="sale_price"
            type="number"
            step="0.01"
            min="0"
            value={form.sale_price}
            onChange={handleChange('sale_price')}
          />
        </div>
        {isEdit && (
          <div className="field">
            <label>Stock actual</label>
            <input value={form.stock} disabled />
            <span className="hint">
              El stock solo cambia a través de compras y ventas, no se edita aquí.
            </span>
          </div>
        )}
        <div className="field">
          <label htmlFor="minimum_stock">Stock mínimo</label>
          <input
            id="minimum_stock"
            type="number"
            min="0"
            value={form.minimum_stock}
            onChange={handleChange('minimum_stock')}
          />
        </div>
        <div className="field">
          <label htmlFor="expiration_date">Fecha de vencimiento</label>
          <input
            id="expiration_date"
            type="date"
            value={form.expiration_date}
            onChange={handleChange('expiration_date')}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <button type="button" className="btn" onClick={() => navigate('/products')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
