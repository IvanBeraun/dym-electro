import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { generarVenta, obtenerComprobante, cancelarVenta } from '../../api/venta.api';
import { crearIntentoPagoStripe, registrarPagoStripe } from '../../api/pago.api';
import stripePromise from '../../lib/stripe';
import FormularioPagoStripe from '../../components/FormularioPagoStripe';
import { formatearMoneda } from '../../utils/formato';
import Alerta from '../../components/ui/Alerta';
import Spinner from '../../components/ui/Spinner';

const APARIENCIA_STRIPE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#144a8c',
    colorText: '#15181c',
    borderRadius: '6px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

export default function Checkout() {
  const [tipoComprobante, setTipoComprobante] = useState('Boleta');
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [cargando, setCargando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [error, setError] = useState('');

  const [venta, setVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [clientSecret, setClientSecret] = useState(null);

  const navigate = useNavigate();

  async function manejarGenerarVenta(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const ventaGenerada = await generarVenta(
        tipoComprobante,
        tipoComprobante === 'Factura' ? ruc : undefined,
        tipoComprobante === 'Factura' ? razonSocial : undefined
      );
      const [intento, comprobante] = await Promise.all([
        crearIntentoPagoStripe(ventaGenerada.idVenta),
        obtenerComprobante(ventaGenerada.idVenta),
      ]);
      setVenta(ventaGenerada);
      setProductos(comprobante.detalle);
      setClientSecret(intento.clientSecret);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargando(false);
    }
  }

  async function manejarPagoExitoso(paymentIntent) {
    try {
      await registrarPagoStripe({
        idVenta: venta.idVenta,
        stripePaymentId: paymentIntent.id,
        monto: venta.total,
        moneda: paymentIntent.currency,
        estadoPago: 'successful',
        tarjetaMarca: paymentIntent.payment_method_types?.[0] || '',
        tarjetaTipo: '',
        mensajeRespuesta: 'Pago confirmado con Stripe',
      });
    } finally {
      navigate(`/comprobante/${venta.idVenta}`);
    }
  }

  async function manejarCancelar() {
    setCancelando(true);
    setError('');
    try {
      await cancelarVenta(venta.idVenta);
      navigate('/carrito');
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCancelando(false);
    }
  }

  if (!clientSecret) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <h1>Confirmar compra</h1>
        <p style={{ color: 'var(--gris-500)' }}>
          Se generará el comprobante a partir de los productos en tu carrito actual.
        </p>

        <Alerta tipo="error">{error}</Alerta>

        <form className="tarjeta tarjeta-pad" onSubmit={manejarGenerarVenta}>
          <div className="campo">
            <label htmlFor="tipoComprobante">Tipo de comprobante</label>
            <select
              id="tipoComprobante"
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value)}
            >
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
            </select>
          </div>

          {tipoComprobante === 'Factura' && (
            <>
              <div className="campo">
                <label htmlFor="ruc">RUC (11 dígitos)</label>
                <input
                  id="ruc"
                  required
                  pattern="\d{11}"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="20603140037"
                />
              </div>
              <div className="campo">
                <label htmlFor="razonSocial">Razón social</label>
                <input
                  id="razonSocial"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primario btn-full" disabled={cargando}>
            {cargando ? 'Generando…' : 'Continuar al pago'}
          </button>
        </form>
        <button className="btn btn-fantasma btn-full" style={{ marginTop: 12 }} onClick={() => navigate('/carrito')}>
          ← Volver al carrito
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1>Pagar con tarjeta</h1>

      <div className="tarjeta tarjeta-pad" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Resumen del pedido</h3>
        <table className="tabla" style={{ marginBottom: 12 }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.idProducto}>
                <td>{p.nombre}</td>
                <td>{p.cantidad}</td>
                <td>{formatearMoneda(p.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="comprobante-total" style={{ borderTop: 'none', paddingTop: 0 }}>
          <span>Subtotal</span>
          <span>{formatearMoneda(venta.subtotal)}</span>
        </div>
        <div className="comprobante-total" style={{ borderTop: 'none', paddingTop: 0, paddingBottom: 0 }}>
          <span>IGV (18%)</span>
          <span>{formatearMoneda(venta.igv)}</span>
        </div>
        <div className="comprobante-total">
          <span>Total a pagar</span>
          <strong>{formatearMoneda(venta.total)}</strong>
        </div>
      </div>

      <Alerta tipo="error">{error}</Alerta>

      <div className="tarjeta tarjeta-pad" style={{ marginBottom: 16 }}>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: APARIENCIA_STRIPE }}>
          <FormularioPagoStripe onExito={manejarPagoExitoso} />
        </Elements>
      </div>

      <button className="btn btn-fantasma btn-full" disabled={cancelando} onClick={manejarCancelar}>
        {cancelando ? 'Cancelando…' : '← Ya no deseo continuar con esta compra'}
      </button>
    </div>
  );
}