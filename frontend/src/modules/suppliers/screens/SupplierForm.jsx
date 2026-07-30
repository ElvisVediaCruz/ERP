import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSupplier, getSupplier, updateSupplier } from '../services/suppliers.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import { useNotifications } from '@shared/context/NotificationContext';

const emptyForm = {
  company: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  description: '',
};

export default function SupplierForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { pushToast } = useNotifications();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getSupplier(id)
      .then((supplier) =>
        setForm({
          company: supplier.company ?? '',
          contact_name: supplier.contact_name ?? '',
          phone: supplier.phone ?? '',
          email: supplier.email ?? '',
          address: supplier.address ?? '',
          description: supplier.description ?? '',
        })
      )
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        await updateSupplier(id, form);
      } else {
        await createSupplier(form);
      }
      pushToast('Proveedor guardado con éxito', 'success');
      navigate('/suppliers');
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <p className="hint">Cargando...</p>;

  return (
    <div>
      <h2>{isEdit ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
      <ErrorBanner error={error} />
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="company">Empresa</label>
          <input id="company" value={form.company} onChange={handleChange('company')} required />
        </div>
        <div className="field">
          <label htmlFor="contact_name">Contacto</label>
          <input id="contact_name" value={form.contact_name} onChange={handleChange('contact_name')} />
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono</label>
          <input id="phone" value={form.phone} onChange={handleChange('phone')} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={handleChange('email')} />
        </div>
        <div className="field">
          <label htmlFor="address">Dirección</label>
          <input id="address" value={form.address} onChange={handleChange('address')} />
        </div>
        <div className="field">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={form.description}
            onChange={handleChange('description')}
            rows={3}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <button type="button" className="btn" onClick={() => navigate('/suppliers')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
