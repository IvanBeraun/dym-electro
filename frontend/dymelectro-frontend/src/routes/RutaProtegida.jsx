import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ tipoRequerido, rolesPermitidos }) {
  const { sesion, estaAutenticado, rol } = useAuth();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (tipoRequerido && sesion.tipoCuenta !== tipoRequerido) {
    return <Navigate to="/no-autorizado" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}
