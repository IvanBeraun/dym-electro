export function formatearMoneda(valor) {
  const numero = Number(valor ?? 0);
  return numero.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
}

export function formatearFecha(valor) {
  if (!valor) return '-';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
