import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // Detectar ruta actual para mostrar los botones correctos
  const path = window.location.pathname;

  return (
    <div className="layout-root">
      <header className="layout-header">
        <div className="layout-title" onClick={() => navigate(usuario?.rol === 'admin' ? '/admin' : '/usuario')}>
          Sistema de Tareas
        </div>
        <nav className="layout-nav">
          <button onClick={handleLogout}>Cerrar sesión</button>
          {usuario && usuario.rol === 'admin' && path === '/admin' && (
            <>
              <button onClick={() => navigate('/usuario')}>Ver panel usuario</button>
            </>
          )}
          {usuario && usuario.rol === 'admin' && path === '/usuario' && (
            <>
              <button onClick={() => navigate('/admin')}>Regresar a admin</button>
            </>
          )}
        </nav>
      </header>
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
