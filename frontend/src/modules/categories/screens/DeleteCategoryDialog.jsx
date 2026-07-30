import { useEffect, useRef, useState } from 'react';
import { reassignProductsCategory } from '@modules/products/services/products.service';
import { deleteCategory } from '../services/categories.service';
import ErrorBanner from '@shared/components/common/ErrorBanner';

export default function DeleteCategoryDialog({ category, onClose, onDeleted }) {
  const [step, setStep] = useState('confirm');
  const [products, setProducts] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);
  const [mode, setMode] = useState('all');
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [selections, setSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const showReassignStep = (result) => {
    setProducts(result.products);
    setOtherCategories(result.categories ?? []);
    setMode('all');
    setBulkCategoryId('');
    setSelections(Object.fromEntries(result.products.map((p) => [p.id, p.category_id])));
    setStep('reassign');
  };

  const handleConfirmDelete = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const result = await deleteCategory(category.id);
      if (result && Array.isArray(result.products) && result.products.length > 0) {
        showReassignStep(result);
      } else {
        onDeleted();
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const data =
        mode === 'all'
          ? Object.fromEntries(products.map((p) => [p.id, Number(bulkCategoryId)]))
          : Object.fromEntries(products.map((p) => [p.id, Number(selections[p.id] ?? p.category_id)]));
      await reassignProductsCategory(data);
      const result = await deleteCategory(category.id);
      if (result && Array.isArray(result.products) && result.products.length > 0) {
        showReassignStep(result);
      } else {
        onDeleted();
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirmReassign =
    otherCategories.length > 0 && (mode === 'individual' || (mode === 'all' && !!bulkCategoryId));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card" style={{ maxWidth: step === 'reassign' ? 520 : 360 }} onClick={(e) => e.stopPropagation()}>
        {step === 'confirm' && (
          <>
            <p>¿Eliminar la categoría "{category.name}"?</p>
            <p className="hint">Esta acción no se puede deshacer.</p>
            <ErrorBanner error={error} />
            <div className="form-actions">
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? 'Verificando...' : 'Confirmar'}
              </button>
              <button type="button" className="btn" onClick={onClose} ref={cancelRef}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === 'reassign' && (
          <>
            <h3>No se puede eliminar "{category.name}" todavía</h3>
            <p className="hint">
              Esta categoría tiene productos asociados. Elige cómo reasignarlos antes de eliminarla.
            </p>

            <ErrorBanner error={error} />

            {otherCategories.length > 0 && (
              <div className="field" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                <label>
                  <input
                    type="radio"
                    name="reassign-mode"
                    value="all"
                    checked={mode === 'all'}
                    onChange={() => setMode('all')}
                  />{' '}
                  Mover todos a la misma categoría
                </label>
                <label>
                  <input
                    type="radio"
                    name="reassign-mode"
                    value="individual"
                    checked={mode === 'individual'}
                    onChange={() => setMode('individual')}
                  />{' '}
                  Elegir categoría por producto
                </label>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      {mode === 'individual' ? (
                        <select
                          value={selections[p.id] ?? p.category_id}
                          onChange={(e) =>
                            setSelections((s) => ({ ...s, [p.id]: Number(e.target.value) }))
                          }
                          disabled={otherCategories.length === 0}
                        >
                          <option value={p.category_id}>{p.category_name} (actual)</option>
                          {otherCategories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        p.category_name
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {otherCategories.length === 0 ? (
              <div className="low-stock-banner">
                No hay otra categoría disponible para reasignar estos productos. Crea una nueva
                categoría antes de eliminar esta.
              </div>
            ) : (
              mode === 'all' && (
                <div className="field">
                  <label htmlFor="bulk_category">Mover todos los productos a</label>
                  <select
                    id="bulk_category"
                    value={bulkCategoryId}
                    onChange={(e) => setBulkCategoryId(e.target.value)}
                  >
                    <option value="">Selecciona una categoría</option>
                    {otherCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}

            <div className="form-actions">
              {otherCategories.length > 0 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={!canConfirmReassign || submitting}
                  onClick={handleReassign}
                >
                  {submitting ? 'Reasignando...' : 'Reasignar y eliminar'}
                </button>
              )}
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
