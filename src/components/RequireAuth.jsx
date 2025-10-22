// src/components/RequireAuth.jsx
import { Navigate } from 'react-router-dom';

import { useLocation } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem('usuario'));
  } catch {
    usuario = null;
  }
  const location = useLocation();

  // Si no hay token o usuario válido, redirigir siempre a login
  if (!token || !usuario || !usuario.rol) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Protección de ruta /admin: solo admin puede entrar
  if (location.pathname.startsWith('/admin')) {
    if (usuario.rol !== 'admin') {
      return <Navigate to="/usuario" replace />;
    }
  }

  // Protección de ruta /usuario: solo usuario puede entrar
  if (location.pathname.startsWith('/usuario')) {
    if (usuario.rol !== 'usuario') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
}
