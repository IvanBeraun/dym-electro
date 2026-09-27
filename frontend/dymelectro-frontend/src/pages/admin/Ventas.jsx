import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarVentas } from '../../api/venta.api';
import { formatearMoneda, formatearFecha } from '../../utils/formato';
import Alerta from '../../components/ui/Alerta';
import Spinner from '../../components/ui/Spinner';
import EstadoVacio from '../../components/ui/EstadoVacio';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listarVentas()
      .then(setVentas)
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <div className="admin-main__cabecera">
        <h1>Ventas</h1>
      </div>

      <Alerta tipo="error">{error}</Alerta>

      <div className="tarjeta">
        {cargando ? (
          <Spinner texto="Cargando ventas…" />
        ) : ventas.length === 0 ? (
          <EstadoVacio titulo="Sin ventas" descripcion="Aún no se ha registrado ninguna venta." />
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Comprobante</th>
                <th>Total</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.idVenta}>
                  <td className="mono">{v.idVenta}</td>
                  <td>{formatearFecha(v.fechaVenta)}</td>
                  <td>
                    {v.nombres} {v.apellidos}
                  </td>
                  <td>
                    {v.tipoComprobante} {v.serieComprobante}-{v.numeroComprobante}
                  </td>
                  <td>{formatearMoneda(v.total)}</td>
                  <td>
                    <span
                      className={`badge ${
                        v.estadoVenta === 'Anulado' ? 'badge-peligro' : 'badge-exito'
                      }`}
                    >
                      {v.estadoVenta}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-fantasma btn-sm"
                      onClick={() => navigate(`/comprobante/${v.idVenta}`)}
                    >
                      Ver comprobante
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}