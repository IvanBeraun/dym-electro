export default function EstadoVacio({ titulo, descripcion, accion }) {
  return (
    <div className="vacio">
      <h3 style={{ color: 'var(--color-texto)' }}>{titulo}</h3>
      {descripcion && <p>{descripcion}</p>}
      {accion}
    </div>
  );
}
