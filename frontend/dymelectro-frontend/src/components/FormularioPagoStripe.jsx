import { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alerta from './ui/Alerta';

export default function FormularioPagoStripe({ onExito }) {
  const stripe = useStripe();
  const elements = useElements();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  async function manejarSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return; // Stripe.js todavia no termino de cargar

    setEnviando(true);
    setError('');

    // redirect: 'if_required' evita el redirect de pagina completa salvo que
    // el metodo de pago realmente lo necesite (ej. 3D Secure).
    const { error: errorConfirmacion, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (errorConfirmacion) {
      setError(errorConfirmacion.message || 'No se pudo procesar el pago.');
      setEnviando(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onExito(paymentIntent);
    } else {
      setError('El pago no se completo. Intenta con otro metodo o tarjeta.');
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={manejarSubmit}>
      <PaymentElement />
      <Alerta tipo="error">{error}</Alerta>
      <button type="submit" className="btn btn-acento btn-full" disabled={!stripe || enviando} style={{ marginTop: 16 }}>
        {enviando ? 'Procesando pago…' : 'Pagar ahora'}
      </button>
    </form>
  );
}