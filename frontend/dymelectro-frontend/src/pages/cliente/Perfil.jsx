import { useEffect, useState } from 'react';
import { obtenerMiPerfilCliente, editarMiPerfilCliente } from '../../api/cliente.api';
import Spinner from '../../components/ui/Spinner';
import Alerta from '../../components/ui/Alerta';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ nombres: '', apellidos: '', telefono: '', direccion: '' });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    obtenerMiPerfilCliente()
      .then((data) => {
        setPerfil(data);
        setForm({
          nombres: data.nombres,
          apellidos: data.apellidos,
          telefono: data.telefono || '',
          direccion: data.direccion || '',
        });
      })
      .catch((err) => setError(err.mensaje))
      .finally(() => setCargando(false));
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setExito('');
    try {
      await editarMiPerfilCliente(form);
      setExito('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Spinner texto="Cargando perfil…" />;
  if (!perfil) return <Alerta tipo="error">{error}</Alerta>;

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>Mi perfil</h1>

      <div className="tarjeta tarjeta-pad">
        <div className="fila-2" style={{ marginBottom: 8 }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gris-500)' }}>Documento</span>
            <p style={{ margin: '2px 0', fontWeight: 600 }}>
              {perfil.tipoDocumento} {perfil.numeroDocumento}
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--gris-500)' }}>Correo</span>
            <p style={{ margin: '2px 0', fontWeight: 600 }}>{perfil.email}</p>
          </div>
        </div>

        <Alerta tipo="error">{error}</Alerta>
        <Alerta tipo="info">{exito}</Alerta>

        <form onSubmit={manejarSubmit}>
          <div className="fila-2">
            <div className="campo">
              <label htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                required
                value={form.nombres}
                onChange={(e) => actualizar('nombres', e.target.value)}
              />
            </div>
            <div className="campo">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                required
                value={form.apellidos}
                onChange={(e) => actualizar('apellidos', e.target.value)}
              />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" value={form.telefono} onChange={(e) => actualizar('telefono', e.target.value)} />
          </div>
          <div className="campo">
            <label htmlFor="direccion">Dirección</label>
            <input id="direccion" value={form.direccion} onChange={(e) => actualizar('direccion', e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
