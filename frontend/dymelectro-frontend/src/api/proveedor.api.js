import axiosClient from './axiosClient';

export const listarProveedores = () => axiosClient.get('/proveedores').then((r) => r.data);