import axiosClient from './axiosClient';

export const listarVentas = () => axiosClient.get('/ventas').then((r) => r.data);

export const generarVenta = (tipoComprobante, ruc, razonSocial) =>
  axiosClient.post('/ventas', { tipoComprobante, ruc, razonSocial }).then((r) => r.data);

export const obtenerComprobante = (idVenta) =>
  axiosClient.get(`/ventas/${idVenta}`).then((r) => r.data);

export const misVentas = () => axiosClient.get('/ventas/mias').then((r) => r.data);

export const anularVenta = (idVenta) =>
  axiosClient.patch(`/ventas/${idVenta}/anular`).then((r) => r.data);

export const cancelarVenta = (idVenta) => axiosClient.patch(`/ventas/${idVenta}/cancelar`).then((r) => r.data);

export const descargarComprobantePdf = (idVenta) =>
  axiosClient.get(`/ventas/${idVenta}/pdf`, { responseType: 'blob' }).then((r) => r.data);