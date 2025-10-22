import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

// ...existing code...
function ListaUsuarios({ onSeleccionar, mostrarAdmins, mostrarSoloAdmins }) {
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [editData, setEditData] = useState({ nombre: '', correo: '', contrasena: '' });
  const { request } = useApi();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await request('/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      await request(`/usuarios/${id}`, { method: 'DELETE' });
      setSeleccionado(null);
      cargarUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
    }
  };

  const seleccionarUsuario = (usuario) => {
    setSeleccionado(usuario);
    setEditData({ nombre: usuario.nombre || '', correo: usuario.correo || '', contrasena: '' });
  };

  const guardarEdicion = async () => {
    try {
      await request(`/usuarios/${seleccionado._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      setSeleccionado(null);
      cargarUsuarios();
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  return (
    <div>
      <div style={{overflowX:'auto'}}>
        <table style={{
          width:'100%',
          background:'#fff',
          borderRadius:8,
          boxShadow:'0 2px 12px #28a74522',
          marginBottom:20,
          borderCollapse:'separate',
          borderSpacing:0,
          minWidth:400
        }}>
          <thead>
            <tr style={{background:'rgba(40,167,69,0.85)', color:'#fff', position:'sticky', top:0}}>
              <th style={{padding:'10px 8px', fontWeight:'bold', borderTopLeftRadius:8}}>Nombre</th>
              <th style={{padding:'10px 8px', fontWeight:'bold'}}>Correo</th>
              <th style={{padding:'10px 8px', fontWeight:'bold', borderTopRightRadius:8}}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios
              .filter(u => mostrarSoloAdmins ? u.rol === 'admin' : u.rol !== 'admin')
              .map((u, idx) => (
                <tr key={u._id} style={{
                  background: u.suspendido
                    ? 'rgba(220,53,69,0.18)'
                    : (idx%2===0 ? 'rgba(40,167,69,0.04)' : 'rgba(0,0,0,0.01)'),
                  color: u.suspendido ? '#dc3545' : undefined
                }}>
                  <td style={{padding:'10px 8px', borderBottom:'1px solid #e0e0e0'}}>{u.nombre}</td>
                  <td style={{padding:'10px 8px', borderBottom:'1px solid #e0e0e0'}}>{u.correo}</td>
                  <td style={{padding:'10px 8px', borderBottom:'1px solid #e0e0e0'}}>
                    <button onClick={() => seleccionarUsuario(u)} style={{
                      background:'#28a745', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px', fontSize:'0.98rem', cursor:'pointer', boxShadow:'0 1px 4px #28a74522', transition:'background 0.2s'}}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {seleccionado && (
        <div style={{
          marginTop:18,
          marginBottom:10,
          background:'#e9fbe9',
          padding:16,
          borderRadius:8,
          boxShadow:'0 1px 8px #28a74522',
          maxWidth:420,
          marginLeft:'auto',
          marginRight:'auto',
          display:'flex',
          flexDirection:'column',
          alignItems:'center'
        }}>
          <h3 style={{marginBottom:12, color:'#218838'}}>Editar Usuario</h3>
          <input value={editData.nombre} onChange={e => setEditData({...editData, nombre: e.target.value})} placeholder="Nombre" style={{width:'100%'}} />
          <input value={editData.correo} onChange={e => setEditData({...editData, correo: e.target.value})} placeholder="Correo" style={{width:'100%'}} />
          <input value={editData.contrasena} onChange={e => setEditData({...editData, contrasena: e.target.value})} placeholder="Contraseña (opcional)" type="password" style={{width:'100%'}} />
          <div style={{display:'flex', gap:8, marginTop:10, flexWrap:'wrap', justifyContent:'center'}}>
            <button onClick={guardarEdicion} style={{background:'#28a745', color:'#fff'}}>Guardar</button>
            <button onClick={() => eliminarUsuario(seleccionado._id)} style={{background:'#dc3545', color:'#fff'}}>Eliminar</button>
            {seleccionado.suspendido ? (
              <button onClick={async () => {
                try {
                  await request(`/usuarios/${seleccionado._id}/activar`, { method: 'PUT' });
                  setSeleccionado(null);
                  cargarUsuarios();
                } catch (err) {
                  console.error('Error al activar usuario:', err);
                }
              }} style={{background:'#007bff', color:'#fff'}}>Activar</button>
            ) : (
              <button onClick={async () => {
                try {
                  await request(`/usuarios/${seleccionado._id}/suspender`, { method: 'PUT' });
                  setSeleccionado(null);
                  cargarUsuarios();
                } catch (err) {
                  console.error('Error al suspender usuario:', err);
                }
              }} style={{background:'#ffc107', color:'#333'}}>Suspender</button>
            )}
            <button onClick={() => setSeleccionado(null)} style={{background:'#888', color:'#fff'}}>Cerrar</button>
          </div>
          {seleccionado.suspendido && <p style={{color:'#dc3545', marginTop:12, fontWeight:'bold'}}>Usuario suspendido</p>}
        </div>
      )}
    </div>
  );
}

export default ListaUsuarios;
