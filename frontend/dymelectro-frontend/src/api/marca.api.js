import axiosClient from './axiosClient';

export const listarMarcas = () => axiosClient.get('/marcas').then((r) => r.data);