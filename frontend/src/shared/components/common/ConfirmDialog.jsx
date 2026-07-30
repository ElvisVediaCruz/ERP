import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, message, warning, children, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="card modal-card" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        {warning && <p className="hint">{warning}</p>}
        {children}
        <div className="form-actions">
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Confirmar
          </button>
          <button type="button" className="btn" onClick={onCancel} ref={cancelRef}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
