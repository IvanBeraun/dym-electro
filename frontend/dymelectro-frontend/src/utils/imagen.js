const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const URL_BASE_ESTATICOS = API_URL.replace(/\/api\/?$/, '');

export function urlImagen(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta; // ya viene como URL completa
  return `${URL_BASE_ESTATICOS}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}