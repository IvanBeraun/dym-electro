import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../api/auth.api';
import { useAuth } from '../../context/AuthContext';
import Alerta from '../../components/ui/Alerta';
import CampoPassword from '../../components/ui/CampoPassword';

const VACIO = {
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  email: '',
  password: '',
  telefono: '',
  direccion: '',
};

export default function Registro() {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { ingresarComoCliente } = useAuth();
  const navigate = useNavigate();

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await registrarCliente(form);
      // Tras registrarse, se inicia sesion automáticamente con las mismas credenciales.
      await ingresarComoCliente(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.mensaje || 'No se pudo completar el registro');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="pagina-auth">
      <div className="franja-seguridad" />
      <Link to="/" className="pagina-auth__volver">
        ← Volver al catálogo
      </Link>
      <div className="pagina-auth__contenido">
        <div className="tarjeta tarjeta-pad pagina-auth__tarjeta" style={{ maxWidth: 520 }}>
          <div className="pagina-auth__marca">
            <span className="pagina-auth__marca-dym">D&M</span> Electro
          </div>
          <h1>Crear cuenta</h1>

          <Alerta tipo="error">{error}</Alerta>

          <form onSubmit={manejarSubmit}>
            <div className="fila-2">
              <div className="campo">
                <label htmlFor="tipoDocumento">Tipo de documento</label>
                <select
                  id="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={(e) => actualizar('tipoDocumento', e.target.value)}
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">Carné de extranjería</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="numeroDocumento">N° de documento</label>
                <input
                  id="numeroDocumento"
                  required
                  value={form.numeroDocumento}
                  onChange={(e) => actualizar('numeroDocumento', e.target.value)}
                />
              </div>
            </div>

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
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => actualizar('email', e.target.value)}
              />
            </div>

            <CampoPassword
              id="password"
              label="Contraseña (mínimo 8 caracteres)"
              value={form.password}
              onChange={(e) => actualizar('password', e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />

            <div className="fila-2">
              <div className="campo">
                <label htmlFor="telefono">Teléfono (opcional)</label>
                <input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => actualizar('telefono', e.target.value)}
                />
              </div>
              <div className="campo">
                <label htmlFor="direccion">Dirección (opcional)</label>
                <input
                  id="direccion"
                  value={form.direccion}
                  onChange={(e) => actualizar('direccion', e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primario btn-full" disabled={cargando}>
              {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: '0.88rem' }}>
            ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}