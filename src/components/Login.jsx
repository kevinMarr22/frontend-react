// src/components/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';




function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { request, loading: apiLoading, error: apiError } = useApi();

  const validar = () => {
    if (!correo.trim() || !contrasena.trim()) return 'Todos los campos son obligatorios';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return 'Correo inválido';
    if (contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const errorMsg = validar();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    setLoading(true);
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      localStorage.setItem('usuario', JSON.stringify(data));
      // Guardar un token dummy para que RequireAuth funcione
      localStorage.setItem('token', data.id || 'dummy-token');
      if (data.rol === 'admin') navigate('/admin');
      else navigate('/usuario');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="contenedor" style={{
        width: '100%',
        maxWidth: 400,
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,255,0.93)'
      }}>
        <h1>Iniciar sesión</h1>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            style={{ border: error && !correo ? '1px solid red' : '' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={e => setContrasena(e.target.value)}
            style={{ border: error && !contrasena ? '1px solid red' : '' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#aaa' : '#28a745',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

