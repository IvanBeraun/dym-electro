import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerDetalleProducto } from '../../api/catalogo.api';
import { agregarAlCarrito } from '../../api/carrito.api';
import { useAuth } from '../../context/AuthContext';
import { formatearMoneda } from '../../utils/formato';
import { urlImagen } from '../../utils/imagen';
import Spinner from '../../components/ui/Spinner';
import Alerta from '../../components/ui/Alerta';

export default function ProductoDetalle() {
  const { idProducto } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(null);
  const { esCliente, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCargando(true);
    obtenerDetalleProducto(idProducto)
      .then((data) => {
        setProducto(data);
        const principal = data.imagenes?.find((i) => i.esPrincipal)?.urlImagen || data.imagenes?.[0]?.urlImagen;
        setImagenActiva(principal || null);
      })
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }, [idProducto]);

  async function manejarAgregar() {
    if (!estaAutenticado) {
      navigate('/login', { state: { from: `/productos/${idProducto}` } });
      return;
    }
    if (!esCliente) {
      setError('Solo los clientes pueden comprar en la tienda.');
      return;
    }
    setAgregando(true);
    setMensaje('');
    setError('');
    try {
      await agregarAlCarrito(Number(idProducto), cantidad);
      setMensaje('Producto agregado al carrito.');
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setAgregando(false);
    }
  }

  if (cargando) return <Spinner texto="Cargando producto…" />;
  if (error && !producto) return <Alerta tipo="error">{error}</Alerta>;
  if (!producto) return null;

  const sinStock = !producto.stock || producto.stock <= 0;
  const imagenes = producto.imagenes || [];

  return (
    <div>
      <Link to="/" style={{ fontSize: '0.85rem' }}>
        ← Volver al catálogo
      </Link>

      <div className="detalle-producto">
        <div>
          <div className="detalle-producto__img tarjeta">
            {imagenActiva ? (
              <img src={urlImagen(imagenActiva)} alt={producto.nombre} />
            ) : (
              <div className="producto-card__img-placeholder">DYM</div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="detalle-producto__miniaturas">
              {imagenes.map((img) => (
                <button
                  key={img.idImagen}
                  type="button"
                  className={`detalle-producto__miniatura ${
                    img.urlImagen === imagenActiva ? 'detalle-producto__miniatura--activa' : ''
                  }`}
                  onClick={() => setImagenActiva(img.urlImagen)}
                >
                  <img src={urlImagen(img.urlImagen)} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="mono" style={{ color: 'var(--gris-500)', fontSize: '0.8rem' }}>
            {producto.codigo}
          </span>
          <h1>{producto.nombre}</h1>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span className="badge badge-neutro">{producto.categoria}</span>
            <span className="badge badge-neutro">{producto.marca}</span>
            {sinStock ? (
              <span className="badge badge-peligro">Sin stock</span>
            ) : (
              <span className="badge badge-exito">{producto.stock} disponibles</span>
            )}
          </div>

          <div className="detalle-producto__precio">{formatearMoneda(producto.precioVenta)}</div>

          <p>{producto.descripcion}</p>

          <Alerta tipo="error">{error}</Alerta>
          <Alerta tipo="info">{mensaje}</Alerta>

          <div className="detalle-producto__compra">
            <input
              type="number"
              min={1}
              max={producto.stock || 1}
              value={cantidad}
              disabled={sinStock}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
            />
            <button className="btn btn-acento" disabled={sinStock || agregando} onClick={manejarAgregar}>
              {agregando ? 'Agregando…' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}