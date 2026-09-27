import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  obtenerCarrito,
  actualizarCantidadCarrito,
  eliminarDelCarrito,
  vaciarCarrito,
} from '../../api/carrito.api';
import { formatearMoneda } from '../../utils/formato';
import Spinner from '../../components/ui/Spinner';
import Alerta from '../../components/ui/Alerta';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { urlImagen } from '../../utils/imagen';

export default function Carrito() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizandoId, setActualizandoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    obtenerCarrito()
      .then(setItems)
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }

  async function cambiarCantidad(idProducto, cantidad) {
    if (cantidad < 1) return;
    setActualizandoId(idProducto);
    setError('');
    try {
      const actualizado = await actualizarCantidadCarrito(idProducto, cantidad);
      setItems(actualizado);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setActualizandoId(null);
    }
  }

  async function eliminar(idProducto) {
    setActualizandoId(idProducto);
    setError('');
    try {
      const actualizado = await eliminarDelCarrito(idProducto);
      setItems(actualizado);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setActualizandoId(null);
    }
  }

  async function manejarVaciar() {
    setError('');
    try {
      await vaciarCarrito();
      setItems([]);
    } catch (err) {
      setError(err.mensaje);
    }
  }

  const total = items.reduce((acc, it) => acc + Number(it.subtotal), 0);

  if (cargando) return <Spinner texto="Cargando carrito…" />;

  return (
    <div>
      <h1>Mi carrito</h1>
      <Alerta tipo="error">{error}</Alerta>

      {items.length === 0 ? (
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Explora el catálogo y agrega los productos que necesites."
          accion={
            <Link to="/" className="btn btn-primario btn-sm">
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="carrito-layout">
          <div className="tarjeta">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.idProducto}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {it.imagenPrincipal && (
                          <img
                            src={urlImagen(it.imagenPrincipal)}
                            alt={it.nombre}
                            style={{ width: 42, height: 42, objectFit: 'contain' }}
                          />
                        )}
                        <span>{it.nombre}</span>
                      </div>
                    </td>
                    <td>{formatearMoneda(it.precioVenta)}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={it.stock}
                        value={it.cantidad}
                        disabled={actualizandoId === it.idProducto}
                        onChange={(e) => cambiarCantidad(it.idProducto, Number(e.target.value))}
                        style={{ width: 64, padding: '6px 8px', borderRadius: 6, border: '1.5px solid var(--color-borde)' }}
                      />
                    </td>
                    <td>{formatearMoneda(it.subtotal)}</td>
                    <td>
                      <button
                        className="btn btn-peligro btn-sm"
                        disabled={actualizandoId === it.idProducto}
                        onClick={() => eliminar(it.idProducto)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="tarjeta tarjeta-pad carrito-resumen">
            <h3>Resumen</h3>
            <div className="carrito-resumen__total">
              <span>Total</span>
              <strong>{formatearMoneda(total)}</strong>
            </div>
            <button className="btn btn-acento btn-full" onClick={() => navigate('/checkout')}>
              Ir a pagar
            </button>
            <button className="btn btn-fantasma btn-full" style={{ marginTop: 8 }} onClick={manejarVaciar}>
              Vaciar carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
