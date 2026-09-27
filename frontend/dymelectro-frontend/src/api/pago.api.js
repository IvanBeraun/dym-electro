import axiosClient from './axiosClient';

// Paso 1 del checkout: crea el PaymentIntent en el backend y devuelve el
// client_secret que necesita <Elements> / <PaymentElement> de Stripe.js.
export const crearIntentoPagoStripe = (idVenta) =>
  axiosClient.post('/pagos/stripe/intent', { idVenta }).then((r) => r.data);

// Paso 2: una vez que stripe.confirmPayment() resuelve en el navegador, se
// registra el resultado del cobro contra la venta.
export const registrarPagoStripe = (payload) =>
  axiosClient.post('/pagos/stripe', payload).then((r) => r.data);