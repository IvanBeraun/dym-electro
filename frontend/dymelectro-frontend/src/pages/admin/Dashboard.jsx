import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TARJETAS_POR_ROL = {
  Administrador: [
    { to: '/panel/usuarios', titulo: 'Usuarios', desc: 'Crear y administrar cuentas del personal interno.' },
    { to: '/panel/compras', titulo: 'Compras', desc: 'Registrar compras a proveedores y reabastecer stock.' },
    { to: '/panel/ventas', titulo: 'Ventas', desc: 'Consultar comprobantes y anular ventas.' },
    { to: '/panel/productos', titulo: 'Catálogo', desc: 'Gestionar imágenes de los productos publicados.' },
  ],
  Vendedor: [
    { to: '/panel/ventas', titulo: 'Ventas', desc: 'Consultar comprobantes generados y anular si corresponde.' },
  ],
  Almacenero: [
    { to: '/panel/compras', titulo: 'Compras', desc: 'Registrar compras a proveedores y reabastecer stock.' },
    { to: '/panel/productos', titulo: 'Catálogo', desc: 'Gestionar imágenes de los productos publicados.' },
  ],
};

export default function Dashboard() {
  const { sesion, rol } = useAuth();
  const tarjetas = TARJETAS_POR_ROL[rol] || [];

  return (
    <div>
      <h1>Hola, {sesion.nombres} 👋</h1>
      <p style={{ color: 'var(--gris-500)' }}>
        Estás en el panel interno de D&M Electro con el rol <strong>{rol}</strong>.
      </p>

      <div className="dashboard-grilla">
        {tarjetas.map((t) => (
          <Link key={t.to} to={t.to} className="dashboard-tarjeta">
            <h3>{t.titulo}</h3>
            <p>{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
