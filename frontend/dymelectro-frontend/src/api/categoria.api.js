import axiosClient from './axiosClient';

export const listarCategorias = () => axiosClient.get('/categorias').then((r) => r.data);