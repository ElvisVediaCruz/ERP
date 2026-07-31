import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPaymentMethod, getPaymentMethod, updatePaymentMethod } from '../services/payment-methods.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import { useNotifications } from '@shared/context/NotificationContext';

export default function PaymentMethodForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { pushToast } = useNotifications();

  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPaymentMethod(id)
      .then((paymentMethod) =>
        setForm({ name: paymentMethod.name ?? '', description: paymentMethod.description ?? '' })
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
        await updatePaymentMethod(id, form);
      } else {
        await createPaymentMethod(form);
      }
      pushToast('Método de pago guardado con éxito', 'success');
      navigate('/payment-methods');
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <p className="hint">Cargando...</p>;

  return (
    <div>
      <h2>{isEdit ? 'Editar método de pago' : 'Nuevo método de pago'}</h2>
      <ErrorBanner error={error} />
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" value={form.name} onChange={handleChange('name')} required />
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
          <button type="button" className="btn" onClick={() => navigate('/payment-methods')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
