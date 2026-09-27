import { useEffect, useState } from 'react';
import { listarUsuarios, crearUsuario, editarUsuario, cambiarEstadoUsuario } from '../../api/usuario.api';
import Alerta from '../../components/ui/Alerta';
import Spinner from '../../components/ui/Spinner';
import EstadoVacio from '../../components/ui/EstadoVacio';
import { formatearFecha } from '../../utils/formato';

const ROLES = [
  { id: 1, nombre: 'Administrador' },
  { id: 2, nombre: 'Vendedor' },
  { id: 3, nombre: 'Almacenero' },
];

const FORM_VACIO = { idRol: 2, nombres: '', apellidos: '', email: '', password: '' };
const EDICION_VACIA = { idUsuario: null, idRol: 2, nombres: '', apellidos: '', email: '' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);

  const [formEdicion, setFormEdicion] = useState(EDICION_VACIA);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  async function cargarUsuarios() {
    setCargando(true);
    setError('');
    try {
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError('');
    setExito('');
    try {
      const { idUsuario } = await crearUsuario({ ...form, idRol: Number(form.idRol) });
      setExito(`Usuario creado con ID ${idUsuario}.`);
      setForm(FORM_VACIO);
      await cargarUsuarios();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setCreando(false);
    }
  }

  function iniciarEdicion(usuario) {
    setError('');
    setExito('');
    setFormEdicion({
      idUsuario: usuario.idUsuario,
      idRol: usuario.idRol,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
    });
  }

  function cancelarEdicion() {
    setFormEdicion(EDICION_VACIA);
  }

  async function manejarEditar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setGuardandoEdicion(true);
    try {
      await editarUsuario(formEdicion.idUsuario, {
        idRol: Number(formEdicion.idRol),
        nombres: formEdicion.nombres,
        apellidos: formEdicion.apellidos,
        email: formEdicion.email,
      });
      setExito(`Usuario ${formEdicion.idUsuario} actualizado.`);
      setFormEdicion(EDICION_VACIA);
      await cargarUsuarios();
    } catch (err) {
      setError(err.mensaje);
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function manejarCambiarEstado(idUsuario, estadoActual) {
    setError('');
    try {
      await cambiarEstadoUsuario(idUsuario, !estadoActual);
      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === idUsuario ? { ...u, estado: !estadoActual } : u))
      );
    } catch (err) {
      setError(err.mensaje);
    }
  }

  return (
    <div>
      <div className="admin-main__cabecera">
        <h1>Usuarios internos</h1>
      </div>

      <Alerta tipo="error">{error}</Alerta>
      <Alerta tipo="info">{exito}</Alerta>

      <div className="panel-2col">
        <div className="tarjeta tarjeta-pad">
          <h3>Crear usuario</h3>
          <form onSubmit={manejarCrear}>
            <div className="campo">
              <label>Rol</label>
              <select value={form.idRol} onChange={(e) => actualizar('idRol', e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="fila-2">
              <div className="campo">
                <label>Nombres</label>
                <input required value={form.nombres} onChange={(e) => actualizar('nombres', e.target.value)} />
              </div>
              <div className="campo">
                <label>Apellidos</label>
                <input required value={form.apellidos} onChange={(e) => actualizar('apellidos', e.target.value)} />
              </div>
            </div>
            <div className="campo">
              <label>Correo</label>
              <input type="email" required value={form.email} onChange={(e) => actualizar('email', e.target.value)} />
            </div>
            <div className="campo">
              <label>Contraseña (mínimo 8 caracteres)</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => actualizar('password', e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primario btn-full" disabled={creando}>
              {creando ? 'Creando…' : 'Crear usuario'}
            </button>
          </form>
        </div>

        <div className="tarjeta tarjeta-pad">
          <h3>{formEdicion.idUsuario ? `Editar usuario #${formEdicion.idUsuario}` : 'Editar usuario'}</h3>
          {!formEdicion.idUsuario ? (
            <p style={{ color: 'var(--gris-500)', fontSize: '0.88rem' }}>
              Selecciona "Editar" en algún usuario de la tabla para cargar sus datos aquí.
            </p>
          ) : (
            <form onSubmit={manejarEditar}>
              <div className="campo">
                <label>Rol</label>
                <select
                  value={formEdicion.idRol}
                  onChange={(e) => setFormEdicion((p) => ({ ...p, idRol: e.target.value }))}
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fila-2">
                <div className="campo">
                  <label>Nombres</label>
                  <input
                    required
                    value={formEdicion.nombres}
                    onChange={(e) => setFormEdicion((p) => ({ ...p, nombres: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Apellidos</label>
                  <input
                    required
                    value={formEdicion.apellidos}
                    onChange={(e) => setFormEdicion((p) => ({ ...p, apellidos: e.target.value }))}
                  />
                </div>
              </div>
              <div className="campo">
                <label>Correo</label>
                <input
                  type="email"
                  required
                  value={formEdicion.email}
                  onChange={(e) => setFormEdicion((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primario btn-full" disabled={guardandoEdicion}>
                  {guardandoEdicion ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button type="button" className="btn btn-fantasma" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="tarjeta" style={{ marginTop: 24 }}>
        {cargando ? (
          <Spinner texto="Cargando usuarios…" />
        ) : usuarios.length === 0 ? (
          <EstadoVacio titulo="Sin usuarios" descripcion="Aún no hay usuarios internos registrados." />
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.idUsuario}>
                  <td className="mono">{u.idUsuario}</td>
                  <td>
                    {u.nombres} {u.apellidos}
                  </td>
                  <td>{u.email}</td>
                  <td>{u.nombreRol}</td>
                  <td>{formatearFecha(u.fechaCreacion)}</td>
                  <td>
                    <span className={`badge ${u.estado ? 'badge-exito' : 'badge-peligro'}`}>
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-fantasma btn-sm" onClick={() => iniciarEdicion(u)}>
                      Editar
                    </button>
                    <button
                      className="btn btn-fantasma btn-sm"
                      onClick={() => manejarCambiarEstado(u.idUsuario, u.estado)}
                    >
                      {u.estado ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}