import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatearMoneda, formatearFecha } from '../../utils/formato';
import { EMPRESA } from '../../utils/empresa';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/ui/Spinner';
import Alerta from '../../components/ui/Alerta';
import { obtenerComprobante, anularVenta, descargarComprobantePdf } from '../../api/venta.api';

export default function Comprobante() {
  const { idVenta } = useParams();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [anulando, setAnulando] = useState(false);
  const { esUsuarioInterno, rol } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    cargar();
  }, [idVenta]);

  function cargar() {
    setCargando(true);
    obtenerComprobante(idVenta)
      .then(setDatos)
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }

  const [descargando, setDescargando] = useState(false);

  async function manejarDescargarPdf() {
    setDescargando(true);
    setError('');
    try {
      const blob = await descargarComprobantePdf(idVenta);
      const url = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `comprobante-${idVenta}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('No se pudo descargar el PDF. Intenta nuevamente.');
    } finally {
      setDescargando(false);
    }
  }

  async function manejarAnular() {
    if (!window.confirm('¿Confirmas anular este comprobante?')) return;
    setAnulando(true);
    setError('');
    try {
      await anularVenta(idVenta);
      cargar();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setAnulando(false);
    }
  }

  function manejarVolver() {
    if (esUsuarioInterno) {
      navigate(-1);
    } else {
      navigate('/mis-compras');
    }
  }

  if (cargando) return <Spinner texto="Cargando comprobante…" />;
  if (error && !datos) return <Alerta tipo="error">{error}</Alerta>;
  if (!datos) return null;

  const { cabecera, detalle } = datos;
  const puedeAnular = esUsuarioInterno && (rol === 'Administrador' || rol === 'Vendedor') && cabecera.estadoVenta !== 'Anulado';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <button className="btn btn-fantasma btn-sm" onClick={manejarVolver} style={{ marginBottom: 16 }}>
        ← Volver
      </button>

      <div className="tarjeta tarjeta-pad">
        <div className="comprobante-cabecera">
          <div>
            <div className="pagina-auth__marca" style={{ marginBottom: 4 }}>
              <span className="pagina-auth__marca-dym">D&M</span> Electro Soluciones y Proyectos SAC
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--gris-500)' }}>
              RUC: {EMPRESA.ruc} · {EMPRESA.direccion}
            </p>
            <h2 style={{ margin: 0 }}>
              {cabecera.tipoComprobante} {cabecera.serieComprobante}-{String(cabecera.numeroComprobante).padStart(6, '0')}
            </h2>
            <p style={{ margin: '4px 0 0' }}>{formatearFecha(cabecera.fechaVenta)}</p>
          </div>
          <span className={`badge ${cabecera.estadoVenta === 'Anulado' ? 'badge-peligro' : 'badge-exito'}`}>
            {cabecera.estadoVenta}
          </span>
        </div>

        <div className="comprobante-cliente">
          <div>
            <strong>Cliente:</strong> {cabecera.nombresCliente} {cabecera.apellidosCliente}
          </div>
          <div>
            <strong>{cabecera.tipoDocumento}:</strong> {cabecera.numeroDocumento}
          </div>
        </div>

        {cabecera.tipoComprobante === 'Factura' && (
          <div className="comprobante-cliente" style={{ marginTop: 6 }}>
            <div>
              <strong>RUC:</strong> {cabecera.rucFacturacion}
            </div>
            <div>
              <strong>Razón social:</strong> {cabecera.razonSocialFacturacion}
            </div>
          </div>
        )}

        <table className="tabla" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((d) => (
              <tr key={d.idProducto}>
                <td>{d.nombre}</td>
                <td>{d.cantidad}</td>
                <td>{formatearMoneda(d.precioVenta)}</td>
                <td>{formatearMoneda(d.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="comprobante-total" style={{ borderTop: 'none', paddingTop: 0, marginBottom: 4 }}>
          <span>Subtotal</span>
          <span>{formatearMoneda(cabecera.subtotal)}</span>
        </div>
        <div className="comprobante-total" style={{ borderTop: 'none', paddingTop: 0, paddingBottom: 0, marginBottom: 4 }}>
          <span>IGV (18%)</span>
          <span>{formatearMoneda(cabecera.igv)}</span>
        </div>
        <div className="comprobante-total">
          <span>Total</span>
          <strong>{formatearMoneda(cabecera.total)}</strong>
        </div>
        {cabecera.tarjetaMarca && (
          <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--gris-500)' }}>
            Pagado con {cabecera.tarjetaMarca} •••• {cabecera.tarjetaUltimos4}
          </div>
        )}

        <Alerta tipo="error">{error}</Alerta>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primario" disabled={descargando} onClick={manejarDescargarPdf}>
            {descargando ? 'Generando PDF…' : 'Descargar PDF'}
          </button>

          {puedeAnular && (
            <button className="btn btn-peligro" disabled={anulando} onClick={manejarAnular}>
              {anulando ? 'Anulando…' : 'Anular comprobante'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
