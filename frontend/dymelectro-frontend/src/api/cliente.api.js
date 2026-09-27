import axiosClient from './axiosClient';

export const listarClientes = () => axiosClient.get('/clientes').then((r) => r.data);

export const obtenerMiPerfilCliente = () => axiosClient.get('/clientes/me').then((r) => r.data);

export const editarMiPerfilCliente = (payload) =>
  axiosClient.put('/clientes/me', payload).then((r) => r.data);