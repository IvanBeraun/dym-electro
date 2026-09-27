import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoDym from '../../img/logo_dym.png';
import './ClienteLayout.css';

export default function ClienteLayout() {
  const { sesion, estaAutenticado, esCliente, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate('/');
  }

  return (
    <div className="cliente-layout">
      <div className="franja-seguridad" />
      <header className="cliente-nav">
        <div className="contenedor cliente-nav__interior">
          <NavLink to="/" className="cliente-nav__marca">
            <img src={logoDym} alt="D&M Electro" className="cliente-nav__logo-img" />
          </NavLink>

          <nav className="cliente-nav__links">
            <NavLink to="/" end>
              Catálogo
            </NavLink>
            {esCliente && <NavLink to="/carrito">Carrito</NavLink>}
            {esCliente && <NavLink to="/mis-compras">Mis compras</NavLink>}
            {esCliente && <NavLink to="/perfil">Mi perfil</NavLink>}
          </nav>

          <div className="cliente-nav__sesion">
            {estaAutenticado ? (
              <>
                <span className="cliente-nav__usuario">Hola, {sesion.nombres}</span>
                <button className="btn btn-fantasma btn-sm" onClick={salir}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-fantasma btn-sm">
                  Ingresar
                </NavLink>
                <NavLink to="/registro" className="btn btn-acento btn-sm">
                  Crear cuenta
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="cliente-main contenedor">
        <Outlet />
      </main>

      <footer className="cliente-footer">
        <div className="franja-seguridad" />

        <div className="cliente-footer__grid">
          <div className="cliente-footer__marca">
            <span className="cliente-footer__logo">
              <img src={logoDym} alt="D&M Electro" className="cliente-footer__logo-img" />
            </span>
            <p>
              Soluciones y Proyectos S.A.C. — climatización, seguridad
              electrónica, radioenlace, protección contra incendios,
              electricidad industrial, automatización y estructuras
              metálicas.
            </p>
          </div>

          <div className="cliente-footer__col">
            <h4>Especialidades</h4>
            <ul>
              <li>Climatización</li>
              <li>Seguridad electrónica</li>
              <li>Radioenlace</li>
              <li>Alarma contra incendio</li>
              <li>Electricidad industrial</li>
              <li>Automatización industrial</li>
              <li>Estructuras metálicas</li>
            </ul>
          </div>

          <div className="cliente-footer__col">
            <h4>Enlaces</h4>
            <ul>
              <li>
                <NavLink to="/">Catálogo</NavLink>
              </li>
              <li>
                <NavLink to="/login">Ingresar</NavLink>
              </li>
              <li>
                <NavLink to="/registro">Crear cuenta</NavLink>
              </li>
            </ul>
          </div>

          <div className="cliente-footer__col">
            <h4>Contacto</h4>
            <ul className="cliente-footer__contacto">
              <li>📍 Calle Constantino Bayle #3420 Urb. Condevilla - SMP</li>
              <li>📞 +51 990 837 632</li>
              <li>✉️ santos.delacruz@dym-electrosolutions.com.pe</li>
            </ul>
          </div>
        </div>

        <div className="cliente-footer__legal">
          <span>
            © {new Date().getFullYear()} D&M Electro Soluciones y Proyectos
            S.A.C.
          </span>
          <span className="mono">RUC 20603140037</span>
        </div>
      </footer>
    </div>
  );
}