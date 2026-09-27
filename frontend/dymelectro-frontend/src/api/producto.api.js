import axiosClient from './axiosClient';

export const crearProducto = (payload) => axiosClient.post('/productos', payload).then((r) => r.data);

export const editarProducto = (idProducto, payload) =>
  axiosClient.put(`/productos/${idProducto}`, payload).then((r) => r.data);

export const obtenerProductoParaEditar = (idProducto) =>
  axiosClient.get(`/productos/${idProducto}`).then((r) => r.data);

export const ajustarStockProducto = (idProducto, stock) =>
  axiosClient.patch(`/productos/${idProducto}/stock`, { stock }).then((r) => r.data);

export const cambiarEstadoProducto = (idProducto, estado) =>
  axiosClient.patch(`/productos/${idProducto}/estado`, { estado }).then((r) => r.data);