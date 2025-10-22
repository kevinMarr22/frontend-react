// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { CrearTarea } from './AdminSections';
import TareasHoyAdmin from './TareasHoyAdmin';
import ReportesAvanzado from './ReportesAvanzado';
import UsuariosCrud from './UsuariosCrud';

function AdminPanel() {
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', correo: '', contrasena: '' });
  const [tarea, setTarea] = useState({ titulo: '', descripcion: '', pago: '' });
  const [reportes, setReportes] = useState({});
  const [usuariosEstado, setUsuariosEstado] = useState([]);
  const [seccion, setSeccion] = useState('usuarios');

  useEffect(() => {
    cargarEstadoUsuarios();
  }, []);

  const crearUsuario = async () => {
    await fetch('http://localhost:3000/api/usuarios/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...nuevoUsuario, rol: 'usuario' })
    });
    alert('Usuario creado');
  };

  const crearTarea = async () => {
    await fetch('http://localhost:3000/api/tareas/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarea)
    });
    alert('Tarea creada');
  };

  const cargarReportes = async (periodo = '') => {
    const url = periodo
      ? `http://localhost:3000/api/reportes/por-fecha/${periodo}`
      : 'http://localhost:3000/api/reportes';
    const res = await fetch(url);
    const data = await res.json();
    setReportes(data);
  };

  const exportar = (formato) => {
    window.open(`http://localhost:3000/api/reportes/exportar/${formato}`, '_blank');
  };

  const cargarEstadoUsuarios = async () => {
    const res = await fetch('http://localhost:3000/api/reportes/estado-usuarios');
    const data = await res.json();
    setUsuariosEstado(data);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Menú</h2>
        <ul>
          <li>
            <button className={seccion === 'usuarios' ? 'active' : ''} onClick={() => setSeccion('usuarios')}>Usuarios</button>
          </li>
          <li>
            <button className={seccion === 'tareas' ? 'active' : ''} onClick={() => setSeccion('tareas')}>Tareas</button>
          </li>
          <li>
            <button className={seccion === 'reportes' ? 'active' : ''} onClick={() => setSeccion('reportes')}>Reportes</button>
          </li>
          <li>
            <button className={seccion === 'estado' ? 'active' : ''} onClick={() => setSeccion('estado')}>Estado de trabajadores</button>
          </li>
        </ul>
      </aside>
      <div className="admin-content">
        <h1>Panel Administrador</h1>
        {seccion === 'usuarios' && (
          <UsuariosCrud />
        )}
        {seccion === 'tareas' && (
          <TareasHoyAdmin />
        )}
        {seccion === 'reportes' && (
          <ReportesAvanzado />
        )}
        {seccion === 'estado' && (
          <section>
            <h2>Estado de los trabajadores</h2>
            {usuariosEstado.map(u => (
              <div key={u.correo} className="card" style={{ backgroundColor: u.estado === 'activo' ? '#d4edda' : '#f8d7da' }}>
                <strong>{u.nombre}</strong><br />
                {u.correo}<br />
                Estado: <span>{u.estado === 'activo' ? 'Realizando tarea' : 'Sin tarea'}</span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
