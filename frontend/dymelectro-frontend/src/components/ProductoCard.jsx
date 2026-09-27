import { Link } from 'react-router-dom';
import { formatearMoneda } from '../utils/formato';
import { urlImagen } from '../utils/imagen';

export default function ProductoCard({ producto }) {
  const sinStock = !producto.stock || producto.stock <= 0;

  return (
    <Link to={`/productos/${producto.idProducto}`} className="producto-card">
      <div className="producto-card__img">
        {producto.imagenPrincipal ? (
          <img src={urlImagen(producto.imagenPrincipal)} alt={producto.nombre} loading="lazy" />
        ) : (
          <div className="producto-card__img-placeholder">DYM</div>
        )}
        {sinStock && <span className="badge badge-peligro producto-card__badge">Sin stock</span>}
      </div>
      <div className="producto-card__info">
        <span className="mono producto-card__codigo">{producto.codigo}</span>
        <h3 className="producto-card__nombre">{producto.nombre}</h3>
        <span className="producto-card__marca">{producto.marca || producto.categoria}</span>
        <div className="producto-card__precio">{formatearMoneda(producto.precioVenta)}</div>
      </div>
    </Link>
  );
}
