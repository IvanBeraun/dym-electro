import axiosClient from './axiosClient';

export const listarUsuarios = () => axiosClient.get('/usuarios').then((r) => r.data);

export const obtenerMiUsuario = () => axiosClient.get('/usuarios/me').then((r) => r.data);

export const crearUsuario = (payload) => axiosClient.post('/usuarios', payload).then((r) => r.data);

export const editarUsuario = (idUsuario, payload) =>
  axiosClient.put(`/usuarios/${idUsuario}`, payload).then((r) => r.data);

export const cambiarEstadoUsuario = (idUsuario, estado) =>
  axiosClient.patch(`/usuarios/${idUsuario}/estado`, { estado }).then((r) => r.data);