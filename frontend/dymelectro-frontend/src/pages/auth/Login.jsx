import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Alerta from '../../components/ui/Alerta';
import CampoPassword from '../../components/ui/CampoPassword';

const ROL_A_RUTA = {
  Administrador: '/panel',
  Vendedor: '/panel',
  Almacenero: '/panel',
};

export default function Login() {
  const [modo, setModo] = useState('cliente'); // 'cliente' | 'interno'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { ingresarComoCliente, ingresarComoUsuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destinoPrevio = location.state?.from;

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (modo === 'cliente') {
        await ingresarComoCliente(email, password);
        navigate(destinoPrevio || '/');
      } else {
        const data = await ingresarComoUsuario(email, password);
        navigate(destinoPrevio || ROL_A_RUTA[data.rol] || '/panel');
      }
    } catch (err) {
      setError(err.mensaje || 'No se pudo iniciar sesión');
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
        <div className="tarjeta tarjeta-pad pagina-auth__tarjeta">
          <div className="pagina-auth__marca">
            <span className="pagina-auth__marca-dym">D&M</span> Electro
          </div>
          <h1>Ingresar</h1>

          <div className="tabs">
            <button
              type="button"
              className={`tabs__item ${modo === 'cliente' ? 'tabs__item--activo' : ''}`}
              onClick={() => setModo('cliente')}
            >
              Soy cliente
            </button>
            <button
              type="button"
              className={`tabs__item ${modo === 'interno' ? 'tabs__item--activo' : ''}`}
              onClick={() => setModo('interno')}
            >
              Personal D&M
            </button>
          </div>

          <Alerta tipo="error">{error}</Alerta>

          <form onSubmit={manejarSubmit}>
            <div className="campo">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <CampoPassword
              id="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button type="submit" className="btn btn-primario btn-full" disabled={cargando}>
              {cargando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          {modo === 'cliente' && (
            <p style={{ marginTop: 18, fontSize: '0.88rem' }}>
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}