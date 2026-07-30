export default function ErrorBanner({ error }) {
  if (!error) return null;

  return (
    <div className="error-banner" role="alert">
      <strong>{error.code === 'CONFLICT' ? 'Conflicto' : 'Error'}:</strong> {error.message}
      {Array.isArray(error.details) && (
        <ul>
          {error.details.map((d, i) => (
            <li key={i}>
              {Array.isArray(d.path) ? d.path.join('.') : ''} {d.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
