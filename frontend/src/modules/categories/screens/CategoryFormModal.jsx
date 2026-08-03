import { useEffect, useRef, useState } from 'react';
import { createCategory, updateCategory } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';

export default function CategoryFormModal({ category, onClose, onSaved }) {
  const isEdit = Boolean(category);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
  });
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

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateCategory(category.id, form);
      } else {
        await createCategory(form);
      }
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <ErrorBanner error={error} />
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <input id="name" ref={nameRef} value={form.name} onChange={handleChange('name')} required />
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
