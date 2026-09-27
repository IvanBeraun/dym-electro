import { Link } from 'react-router-dom';

export default function NoEncontrado() {
  return (
    <div className="vacio">
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/" className="btn btn-primario btn-sm">
        Volver al catálogo
      </Link>
    </div>
  );
}
