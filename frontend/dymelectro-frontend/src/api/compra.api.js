import axiosClient from './axiosClient';

export const listarCompras = () => axiosClient.get('/compras').then((r) => r.data);

export const registrarCompra = (idProveedor, numeroComprobante) =>
  axiosClient.post('/compras', { idProveedor, numeroComprobante }).then((r) => r.data);

export const agregarDetalleCompra = (idCompra, payload) =>
  axiosClient.post(`/compras/${idCompra}/detalle`, payload).then((r) => r.data);

export const obtenerDetalleCompra = (idCompra) =>
  axiosClient.get(`/compras/${idCompra}`).then((r) => r.data);