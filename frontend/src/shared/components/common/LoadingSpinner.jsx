export default function LoadingSpinner({ label = 'Cargando...' }) {
  return (
    <div className="spinner-wrap" role="status" aria-label={label}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
