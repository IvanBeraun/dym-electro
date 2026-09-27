export default function Spinner({ texto }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: 'var(--gris-500)' }}>
      <div className="spinner" />
      {texto && <span>{texto}</span>}
    </div>
  );
}
