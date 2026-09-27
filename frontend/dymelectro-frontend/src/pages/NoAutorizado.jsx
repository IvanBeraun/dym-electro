import { Link } from 'react-router-dom';

export default function NoAutorizado() {
  return (
    <div className="vacio">
      <h1>Acceso restringido</h1>
      <p>Tu cuenta no tiene permisos para ver esta sección.</p>
      <Link to="/" className="btn btn-primario btn-sm">
        Volver al inicio
      </Link>
    </div>
  );
}
