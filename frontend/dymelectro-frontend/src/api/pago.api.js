import axiosClient from './axiosClient';

export const crearIntentoPagoStripe = (idVenta) =>
  axiosClient.post('/pagos/stripe/intent', { idVenta }).then((r) => r.data);

export const registrarPagoStripe = (payload) =>
  axiosClient.post('/pagos/stripe', payload).then((r) => r.data);