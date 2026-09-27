import axiosClient from './axiosClient';

export const listarCatalogo = () => axiosClient.get('/catalogo').then((r) => r.data);

export const buscarCatalogo = (texto) =>
  axiosClient.get('/catalogo/buscar', { params: { texto } }).then((r) => r.data);

export const filtrarCatalogo = ({ idCategoria, idMarca, precioMin, precioMax }) =>
  axiosClient
    .get('/catalogo/filtrar', { params: { idCategoria, idMarca, precioMin, precioMax } })
    .then((r) => r.data);

export const obtenerDetalleProducto = (idProducto) =>
  axiosClient.get(`/catalogo/${idProducto}`).then((r) => r.data);

export const agregarImagenProducto = (payload) =>
  axiosClient.post('/catalogo/imagenes', payload).then((r) => r.data);

export const eliminarImagenProducto = (idImagen) =>
  axiosClient.delete(`/catalogo/imagenes/${idImagen}`).then((r) => r.data);