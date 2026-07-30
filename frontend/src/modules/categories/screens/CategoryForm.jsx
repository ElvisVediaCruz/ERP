import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCategory, getCategory, updateCategory } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';
import { useNotifications } from '@shared/context/NotificationContext';

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { pushToast } = useNotifications();

  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getCategory(id)
      .then((category) =>
        setForm({ name: category.name ?? '', description: category.description ?? '' })
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
        await updateCategory(id, form);
      } else {
        await createCategory(form);
      }
      pushToast('Categoría guardada con éxito', 'success');
      navigate('/categories');
    } catch (err) {
      setError(err);
    }
  };

  if (loading) return <p className="hint">Cargando...</p>;

  return (
    <div>
      <h2>{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h2>
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
          <button type="button" className="btn" onClick={() => navigate('/categories')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
