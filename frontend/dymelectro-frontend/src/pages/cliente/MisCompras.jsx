import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { misVentas } from '../../api/venta.api';
import { formatearMoneda, formatearFecha } from '../../utils/formato';
import Spinner from '../../components/ui/Spinner';
import Alerta from '../../components/ui/Alerta';
import EstadoVacio from '../../components/ui/EstadoVacio';

export default function MisCompras() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    misVentas()
      .then(setVentas)
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Spinner texto="Cargando tus compras…" />;

  return (
    <div>
      <h1>Mis compras</h1>
      <Alerta tipo="error">{error}</Alerta>

      {ventas.length === 0 ? (
        <EstadoVacio
          titulo="Aún no tienes compras"
          descripcion="Cuando generes un pedido, aparecerá aquí junto con su comprobante."
        />
      ) : (
        <div className="tarjeta">
          <table className="tabla">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.idVenta}>
                  <td className="mono">
                    {v.tipoComprobante} {v.serieComprobante}-{v.numeroComprobante}
                  </td>
                  <td>{formatearFecha(v.fechaVenta)}</td>
                  <td>{formatearMoneda(v.total)}</td>
                  <td>
                    <span
                      className={`badge ${v.estadoVenta === 'Anulada' ? 'badge-peligro' : 'badge-exito'}`}
                    >
                      {v.estadoVenta}
                    </span>
                  </td>
                  <td>
                    <Link to={`/comprobante/${v.idVenta}`} className="btn btn-fantasma btn-sm">
                      Ver comprobante
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
