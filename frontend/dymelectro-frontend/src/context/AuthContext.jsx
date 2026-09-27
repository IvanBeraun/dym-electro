import { createContext, useContext, useState, useCallback } from 'react';
import { loginCliente, loginUsuario } from '../api/auth.api';

const AuthContext = createContext(null);

function leerSesionGuardada() {
  try {
    const raw = localStorage.getItem('dym_sesion');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesionGuardada);

  const guardarSesion = useCallback((data) => {
    // data: { token, tipoCuenta, id, nombres, apellidos, rol }
    localStorage.setItem('dym_token', data.token);
    localStorage.setItem('dym_sesion', JSON.stringify(data));
    setSesion(data);
  }, []);

  const ingresarComoCliente = useCallback(
    async (email, password) => {
      const data = await loginCliente(email, password);
      guardarSesion(data);
      return data;
    },
    [guardarSesion]
  );

  const ingresarComoUsuario = useCallback(
    async (email, password) => {
      const data = await loginUsuario(email, password);
      guardarSesion(data);
      return data;
    },
    [guardarSesion]
  );

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('dym_token');
    localStorage.removeItem('dym_sesion');
    setSesion(null);
  }, []);

  const value = {
    sesion,
    estaAutenticado: !!sesion,
    esCliente: sesion?.tipoCuenta === 'CLIENTE',
    esUsuarioInterno: sesion?.tipoCuenta === 'USUARIO',
    rol: sesion?.rol || null, // 'Administrador' | 'Vendedor' | 'Almacenero' | null
    ingresarComoCliente,
    ingresarComoUsuario,
    cerrarSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
