import axiosClient from './axiosClient';

export const loginUsuario = (email, password) =>
  axiosClient.post('/auth/login/usuario', { email, password }).then((r) => r.data);

export const loginCliente = (email, password) =>
  axiosClient.post('/auth/login/cliente', { email, password }).then((r) => r.data);

export const registrarCliente = (payload) =>
  axiosClient.post('/auth/registro/cliente', payload).then((r) => r.data);
