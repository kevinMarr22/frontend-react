
import React, { useState } from 'react';
import ListaUsuarios from './ListaUsuarios';
import { useApi } from '../hooks/useApi';

function UsuariosCrud() {
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [mostrarAdmins, setMostrarAdmins] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', correo: '', contrasena: '', rol: 'usuario' });
  const { request } = useApi();

  const crearUsuario = async () => {
    try {
      await request('/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
      });
      setNuevo({ nombre: '', correo: '', contrasena: '', rol: 'usuario' });
      alert('Usuario creado');
    } catch (err) {
      alert('Error al crear usuario: ' + err.message);
    }
  };

  return (
    <section style={{position:'relative'}}>
      <h2>Usuarios</h2>
      <div style={{marginBottom:20, display:'flex', gap:12}}>
        <button onClick={() => setMostrarCrear(m => !m)} style={{marginBottom:12, background:'#28a745', color:'#fff'}}>
          {mostrarCrear ? 'Cancelar' : 'Crear Usuario'}
        </button>
        <button onClick={() => setMostrarLista(m => !m)} style={{marginBottom:12, background:'#218838', color:'#fff'}}>
          {mostrarLista ? 'Ocultar lista' : 'Ver usuarios'}
        </button>
        <button onClick={() => setMostrarAdmins(a => !a)} style={{marginBottom:12, background:'#dc3545', color:'#fff', fontWeight:'bold', border:'2px solid #a00'}}>
          {mostrarAdmins ? 'Ocultar admins' : 'Ver administradores'}
        </button>
      </div>
      {mostrarCrear && (
        <div style={{marginTop:10, marginBottom:10, background:'#f8f9fa', padding:16, borderRadius:8}}>
          <input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <input placeholder="Correo" value={nuevo.correo} onChange={e => setNuevo({ ...nuevo, correo: e.target.value })} />
          <input placeholder="Contraseña" type="password" value={nuevo.contrasena} onChange={e => setNuevo({ ...nuevo, contrasena: e.target.value })} />
          <select value={nuevo.rol} onChange={e => setNuevo({ ...nuevo, rol: e.target.value })} style={{marginLeft:8}}>
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
          <button onClick={crearUsuario} style={{marginTop:8, marginLeft:8}}>Crear Usuario</button>
        </div>
      )}
      {mostrarLista && (
        <div style={{marginTop:10, marginBottom:10, background:'#f8f9fa', padding:16, borderRadius:8}}>
          <ListaUsuarios mostrarAdmins={mostrarAdmins} />
        </div>
      )}
      {mostrarAdmins && (
        <div style={{marginTop:10, marginBottom:10, background:'#fff0f0', padding:16, borderRadius:8, border:'1.5px solid #dc3545'}}>
          <h3 style={{color:'#dc3545', marginTop:0}}>Administradores</h3>
          <ListaUsuarios mostrarSoloAdmins={true} />
        </div>
      )}
    </section>
  );
}

export default UsuariosCrud;
