import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoDym from '../../img/logo_dym.png';
import './AdminLayout.css';

const MENU_POR_ROL = {
  Administrador: [
    { to: '/panel', etiqueta: 'Resumen', fin: true },
    { to: '/panel/usuarios', etiqueta: 'Usuarios' },
    { to: '/panel/compras', etiqueta: 'Compras' },
    { to: '/panel/ventas', etiqueta: 'Ventas' },
    { to: '/panel/productos', etiqueta: 'Catálogo' },
  ],
  Vendedor: [
    { to: '/panel', etiqueta: 'Resumen', fin: true },
    { to: '/panel/ventas', etiqueta: 'Ventas' },
  ],
  Almacenero: [
    { to: '/panel', etiqueta: 'Resumen', fin: true },
    { to: '/panel/compras', etiqueta: 'Compras' },
    { to: '/panel/productos', etiqueta: 'Catálogo' },
  ],
};

export default function AdminLayout() {
  const { sesion, rol, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const items = MENU_POR_ROL[rol] || [];

  function salir() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="admin-layout" data-tema="admin">
      <aside className="admin-sidebar">
        <div className="franja-seguridad" />
        <div className="admin-sidebar__marca">
          <img src={logoDym} alt="D&M Electro" className="admin-sidebar__logo-img" />
          <span className="admin-sidebar__panel">Panel interno</span>
        </div>

        <nav className="admin-sidebar__nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.fin}>
              {item.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__usuario">
          <div className="admin-sidebar__usuario-nombre">
            {sesion.nombres} {sesion.apellidos}
          </div>
          <div className="badge badge-acento">{rol}</div>
          <button className="btn btn-fantasma btn-sm btn-full" style={{ marginTop: 12 }} onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
