

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaUserPlus, FaMoneyBillWave, FaTasks } from 'react-icons/fa';
import { MenuUsuario } from './UserMenu';
import { useApi } from '../hooks/useApi';

function UserPanel() {
  const [tareas, setTareas] = useState([]);
  const [opcion, setOpcion] = useState('todas');
  const [filtroDia, setFiltroDia] = useState('hoy'); // 'todas' | 'hoy'
  const [mensaje, setMensaje] = useState(null);
  const { request } = useApi();

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line
  }, []);

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esUsuario = usuario && usuario.rol === 'usuario';

  const cargarTareas = async () => {
    try {
      const data = await request('/tareas/todas');
      setTareas(data);
    } catch (err) {
      setMensaje('Error al cargar tareas: ' + err.message);
    }
  };

  const asignarTarea = async (id) => {
    try {
      await request(`/tareas/asignar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: usuario.id })
      });
      // Esperar a que el backend actualice el estado a 'en progreso' tras asignar
      setTimeout(cargarTareas, 300); // Pequeño delay para asegurar actualización
    } catch (err) {
      setMensaje('Error al asignar tarea: ' + err.message);
    }
  };

  const finalizarTarea = async (id, tarea) => {
    setMensaje(null);
    // Solo permitir finalizar si la tarea está asignada al usuario actual
    if (!tarea.asignadoA || tarea.asignadoA._id !== usuario.id) {
      setMensaje('Solo puedes finalizar tareas que te han sido asignadas.');
      return;
    }
    try {
      await request(`/tareas/finalizar/${id}`, { method: 'PUT' });
      cargarTareas();
    } catch (err) {
      setMensaje('Error al finalizar tarea: ' + err.message);
    }
  };

  // Filtrado y orden según opción y filtro de día
  let tareasFiltradas = tareas;
  if (opcion === 'asignadas') {
    tareasFiltradas = tareas.filter(t => t.asignadoA && t.asignadoA._id === usuario.id);
  }
  const hoy = new Date();
  const esHoy = (fecha) => {
    if (!fecha) return false;
    const d = new Date(fecha);
    return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
  };
  if (filtroDia === 'hoy') {
    tareasFiltradas = tareasFiltradas.filter(t => esHoy(t.createdAt));
  }
  // Ordenar: primero disponibles de hoy, luego el resto
  tareasFiltradas = [
    ...tareasFiltradas.filter(t => t.estado === 'pendiente' && esHoy(t.createdAt)),
    ...tareasFiltradas.filter(t => !(t.estado === 'pendiente' && esHoy(t.createdAt)))
  ];

  return (
    <div className="usuario-layout">
      <MenuUsuario opcion={opcion} setOpcion={setOpcion} />
      <div className="usuario-content">
        <h1><FaTasks style={{marginRight:8}}/> {opcion === 'todas' ? 'Todas las tareas' : 'Mis tareas asignadas'}</h1>
        <div style={{
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#f4f4f4',
          borderRadius: 8,
          padding: '10px 18px',
          boxShadow: '0 2px 8px #0001',
          maxWidth: 340
        }}>
          <label style={{fontWeight:600, color:'#333', fontSize:15}}>Filtrar por:</label>
          <select
            value={filtroDia}
            onChange={e => setFiltroDia(e.target.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #bbb',
              fontSize: 15,
              background: '#fff',
              color: '#222',
              outline: 'none',
              boxShadow: '0 1px 3px #0001'
            }}
          >
            <option value="todas">Todas las tareas</option>
            <option value="hoy">Tareas de hoy</option>
          </select>
        </div>
        <div className="tareas-grid">
          {tareasFiltradas.length === 0 && <p>No hay tareas para mostrar.</p>}
          {tareasFiltradas.map(t => {
            const inicio = new Date(t.fechaAsignacion);
            // Colores: verde si disponible, rojo si no
            let bg = '#fff';
            if (t.estado === 'pendiente') bg = '#d4edda';
            else if (t.estado !== 'pendiente') bg = '#ffd6d6';
            return (
              <div key={t._id} className={`card tarea-card tarea-${t.estado.replace(/\s/g, '-')}`}
                style={{ background: bg, borderLeft: t.estado === 'pendiente' ? '6px solid #28a745' : '6px solid #dc3545' }}>
                <div className="tarea-header">
                  <h3>{t.titulo}</h3>
                  <span className={`tarea-estado tarea-estado-${t.estado}`}>{t.estado === 'pendiente' ? <FaUserPlus/> : t.estado === 'en progreso' ? <FaClock/> : <FaCheckCircle/>} {t.estado}</span>
                </div>
                <p className="tarea-desc">{t.descripcion}</p>
                <div className="tarea-info">
                  <span><FaMoneyBillWave/> Q{t.pago}</span>
                </div>
                {t.estado === 'pendiente' && esUsuario && (!t.asignadoA || t.asignadoA._id !== usuario.id) && (
                  <button onClick={() => asignarTarea(t._id)}>Asignarme</button>
                )}
                {t.estado === 'en progreso' && t.asignadoA && t.asignadoA._id === usuario.id && (
                  <>
                    <Contador inicio={inicio} />
                    <button onClick={() => finalizarTarea(t._id, t)}>
                      Finalizar
                    </button>
                  </>
                )}
                {t.estado === 'en progreso' && (!t.asignadoA || t.asignadoA._id !== usuario.id) && (
                  <Contador inicio={inicio} />
                )}
                {mensaje && <div style={{background:'#ffd6d6', color:'#a00', padding:10, borderRadius:6, marginBottom:16, textAlign:'center'}}>{mensaje}</div>}
                {t.estado === 'finalizado' && <p className="tarea-completada"><FaCheckCircle color="#28a745"/> <strong>Completado</strong></p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Contador({ inicio }) {
  const [tiempo, setTiempo] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date() - inicio) / 1000);
      const min = Math.floor(diff / 60);
      const seg = diff % 60;
      setTiempo(`${min}m ${seg < 10 ? '0' : ''}${seg}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [inicio]);

  return <p className="tarea-tiempo"><FaClock/> Tiempo en tarea: {tiempo}</p>;
}

export default UserPanel;
