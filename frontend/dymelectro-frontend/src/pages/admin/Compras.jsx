import { useEffect, useState } from 'react';
import { listarCompras, registrarCompra, agregarDetalleCompra, obtenerDetalleCompra } from '../../api/compra.api';
import { listarProveedores } from '../../api/proveedor.api';
import { formatearMoneda, formatearFecha } from '../../utils/formato';
import Alerta from '../../components/ui/Alerta';
import Spinner from '../../components/ui/Spinner';
import EstadoVacio from '../../components/ui/EstadoVacio';

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [proveedores, setProveedores] = useState([]);

  const [form, setForm] = useState({ idProveedor: '', numeroComprobante: '' });
  const [idCompraActiva, setIdCompraActiva] = useState(null);
  const [detalleForm, setDetalleForm] = useState({ idProducto: '', cantidad: 1, precioCompra: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [compraConsultada, setCompraConsultada] = useState(null);
  const [idConsulta, setIdConsulta] = useState(null);

  async function cargarCompras() {
    setCargando(true);
    setError('');
    try {
      const data = await listarCompras();
      setCompras(data);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCompras();
    listarProveedores()
      .then(setProveedores)
      .catch(() => {
        // si falla la carga de proveedores, se deja el select vacio sin romper la pagina
      });
  }, []);

  async function manejarRegistrar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      const { idCompra } = await registrarCompra(Number(form.idProveedor), form.numeroComprobante);
      setIdCompraActiva(idCompra);
      setExito(`Compra registrada con ID ${idCompra}. Ahora agrega los productos recibidos.`);
      await cargarCompras();
    } catch (err) {
      setError(err.mensaje);
    }
  }

  async function manejarAgregarDetalle(e) {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      await agregarDetalleCompra(idCompraActiva, {
        idProducto: Number(detalleForm.idProducto),
        cantidad: Number(detalleForm.cantidad),
        precioCompra: Number(detalleForm.precioCompra),
      });
      setExito(`Producto ${detalleForm.idProducto} agregado a la compra ${idCompraActiva} (stock actualizado).`);
      setDetalleForm({ idProducto: '', cantidad: 1, precioCompra: '' });
      await cargarCompras();
    } catch (err) {
      setError(err.mensaje);
    }
  }

  async function verDetalle(idCompra) {
    setError('');
    setIdConsulta(idCompra);
    setCompraConsultada(null);
    try {
      const data = await obtenerDetalleCompra(idCompra);
      setCompraConsultada(data);
    } catch (err) {
      setError(err.mensaje);
    }
  }

  return (
    <div>
      <div className="admin-main__cabecera">
        <h1>Compras a proveedores</h1>
      </div>

      <Alerta tipo="error">{error}</Alerta>
      <Alerta tipo="info">{exito}</Alerta>

      <div className="panel-2col">
        <div className="tarjeta tarjeta-pad">
          <h3>1. Registrar cabecera de compra</h3>
          <form onSubmit={manejarRegistrar}>
            <div className="campo">
              <label>Proveedor</label>
              <select
                required
                value={form.idProveedor}
                onChange={(e) => setForm((p) => ({ ...p, idProveedor: e.target.value }))}
              >
                <option value="">Selecciona un proveedor…</option>
                {proveedores.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>
                    {p.razonSocial} — {p.ruc}
                  </option>
                ))}
              </select>
              {proveedores.length === 0 && (
                <p style={{ color: 'var(--gris-500)', fontSize: '0.8rem', marginTop: 4 }}>
                  No hay proveedores registrados aún.
                </p>
              )}
            </div>
            <div className="campo">
              <label>N° de comprobante del proveedor</label>
              <input
                required
                value={form.numeroComprobante}
                onChange={(e) => setForm((p) => ({ ...p, numeroComprobante: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-primario btn-full">
              Registrar compra
            </button>
          </form>
        </div>

        <div className="tarjeta tarjeta-pad">
          <h3>2. Agregar productos recibidos</h3>
          {!idCompraActiva ? (
            <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem' }}>
              Registra primero la cabecera de una compra, o ingresa un ID de compra existente:
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem' }}>
              Agregando detalle a la compra <strong className="mono">#{idCompraActiva}</strong>
            </p>
          )}
          <div className="campo">
            <label>ID de compra</label>
            <input
              type="number"
              value={idCompraActiva || ''}
              onChange={(e) => setIdCompraActiva(e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <form onSubmit={manejarAgregarDetalle}>
            <div className="fila-2">
              <div className="campo">
                <label>ID de producto</label>
                <input
                  type="number"
                  required
                  value={detalleForm.idProducto}
                  onChange={(e) => setDetalleForm((p) => ({ ...p, idProducto: e.target.value }))}
                />
              </div>
              <div className="campo">
                <label>Cantidad</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={detalleForm.cantidad}
                  onChange={(e) => setDetalleForm((p) => ({ ...p, cantidad: e.target.value }))}
                />
              </div>
            </div>
            <div className="campo">
              <label>Precio de compra (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={detalleForm.precioCompra}
                onChange={(e) => setDetalleForm((p) => ({ ...p, precioCompra: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-acento btn-full" disabled={!idCompraActiva}>
              Agregar producto a la compra
            </button>
          </form>
        </div>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h3 style={{ padding: '16px 16px 0' }}>Historial de compras</h3>
        {cargando ? (
          <Spinner texto="Cargando compras…" />
        ) : compras.length === 0 ? (
          <EstadoVacio titulo="Sin compras" descripcion="Aún no se ha registrado ninguna compra." />
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>N° Comprobante</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.idCompra}>
                  <td className="mono">{c.idCompra}</td>
                  <td>{formatearFecha(c.fechaCompra)}</td>
                  <td>{c.proveedor}</td>
                  <td>{c.numeroComprobante}</td>
                  <td>{formatearMoneda(c.total)}</td>
                  <td>
                    <button className="btn btn-fantasma btn-sm" onClick={() => verDetalle(c.idCompra)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {compraConsultada && (
        <div className="tarjeta tarjeta-pad" style={{ marginTop: 20 }}>
          <h3>Detalle de la compra #{idConsulta}</h3>
          <div className="fila-2" style={{ marginBottom: 14, fontSize: '0.9rem' }}>
            <div>
              <strong>Proveedor:</strong> {compraConsultada.cabecera.proveedor}
            </div>
            <div>
              <strong>Fecha:</strong> {formatearFecha(compraConsultada.cabecera.fechaCompra)}
            </div>
            <div>
              <strong>Comprobante:</strong> {compraConsultada.cabecera.numeroComprobante}
            </div>
            <div>
              <strong>Total:</strong> {formatearMoneda(compraConsultada.cabecera.total)}
            </div>
          </div>
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio compra</th>
              </tr>
            </thead>
            <tbody>
              {compraConsultada.detalle.map((d) => (
                <tr key={d.idProducto}>
                  <td>{d.nombre}</td>
                  <td>{d.cantidad}</td>
                  <td>{formatearMoneda(d.precioCompra)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}