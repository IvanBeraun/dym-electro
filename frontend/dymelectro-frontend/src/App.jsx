import { Routes, Route, Navigate } from 'react-router-dom';

import ClienteLayout from './components/layout/ClienteLayout';
import AdminLayout from './components/layout/AdminLayout';
import RutaProtegida from './routes/RutaProtegida';

import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';

import Catalogo from './pages/cliente/Catalogo';
import ProductoDetalle from './pages/cliente/ProductoDetalle';
import Carrito from './pages/cliente/Carrito';
import Checkout from './pages/cliente/Checkout';
import MisCompras from './pages/cliente/MisCompras';
import Comprobante from './pages/cliente/Comprobante';
import Perfil from './pages/cliente/Perfil';

import Dashboard from './pages/admin/Dashboard';
import Usuarios from './pages/admin/Usuarios';
import Compras from './pages/admin/Compras';
import Ventas from './pages/admin/Ventas';
import Productos from './pages/admin/Productos';

import NoEncontrado from './pages/NoEncontrado';
import NoAutorizado from './pages/NoAutorizado';

export default function App() {
  return (
    <Routes>
      {/* Login / registro (sin layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* Tienda: catálogo público + zona de cliente autenticado */}
      <Route element={<ClienteLayout />}>
        <Route path="/" element={<Catalogo />} />
        <Route path="/productos/:idProducto" element={<ProductoDetalle />} />

        {/* El comprobante lo puede ver cualquier sesión valida (cliente dueño o personal interno) */}
        <Route element={<RutaProtegida />}>
          <Route path="/comprobante/:idVenta" element={<Comprobante />} />
        </Route>

        {/* Rutas exclusivas de clientes */}
        <Route element={<RutaProtegida tipoRequerido="CLIENTE" />}>
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-compras" element={<MisCompras />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* Menú segun el rol */}
      <Route element={<RutaProtegida tipoRequerido="USUARIO" />}>
        <Route element={<AdminLayout />}>
          <Route path="/panel" element={<Dashboard />} />

          <Route element={<RutaProtegida tipoRequerido="USUARIO" rolesPermitidos={['Administrador']} />}>
            <Route path="/panel/usuarios" element={<Usuarios />} />
          </Route>

          <Route
            element={<RutaProtegida tipoRequerido="USUARIO" rolesPermitidos={['Administrador', 'Almacenero']} />}
          >
            <Route path="/panel/compras" element={<Compras />} />
            <Route path="/panel/productos" element={<Productos />} />
          </Route>

          <Route
            element={<RutaProtegida tipoRequerido="USUARIO" rolesPermitidos={['Administrador', 'Vendedor']} />}
          >
            <Route path="/panel/ventas" element={<Ventas />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NoEncontrado />} />
    </Routes>
  );
}
