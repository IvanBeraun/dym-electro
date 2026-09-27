import axiosClient from './axiosClient';

export const obtenerCarrito = () => axiosClient.get('/carrito').then((r) => r.data);

export const agregarAlCarrito = (idProducto, cantidad) =>
  axiosClient.post('/carrito/items', { idProducto, cantidad }).then((r) => r.data);

export const actualizarCantidadCarrito = (idProducto, cantidad) =>
  axiosClient.put('/carrito/items', { idProducto, cantidad }).then((r) => r.data);

export const eliminarDelCarrito = (idProducto) =>
  axiosClient.delete(`/carrito/items/${idProducto}`).then((r) => r.data);

export const vaciarCarrito = () => axiosClient.delete('/carrito').then((r) => r.data);
