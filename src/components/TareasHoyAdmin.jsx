
import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import AsignarTareaUsuario from './AsignarTareaUsuario';


function TareasHoyAdmin() {
  const [tareas, setTareas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ titulo: '', descripcion: '', pago: '' });
  const [verTodas, setVerTodas] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const { request, loading, error } = useApi();



  useEffect(() => {
    cargarTareas();
    cargarUsuarios();
    // eslint-disable-next-line
  }, [verTodas]);

  const cargarUsuarios = async () => {
    try {
      const data = await request('/usuarios');
      setUsuarios(data.filter(u => u.rol === 'usuario' && !u.suspendido));
    } catch (err) {
      // No bloquear si falla
    }
  };

  const cargarTareas = async () => {
    try {
      const data = await request('/tareas/todas');
      if (verTodas) {
        setTareas(data);
      } else {
        // Filtrar solo tareas de hoy
        const hoy = new Date();
        const esHoy = (fecha) => {
          if (!fecha) return false;
          const d = new Date(fecha);
          return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth() && d.getDate() === hoy.getDate();
        };
        setTareas(data.filter(t => esHoy(t.createdAt)));
      }
    } catch (err) {
      setMensaje(err.message);
    }
  };


  const validarForm = () => {
    if (!form.titulo.trim()) return 'El título es obligatorio';
    if (!form.descripcion.trim()) return 'La descripción es obligatoria';
    if (form.pago === '' || isNaN(Number(form.pago))) return 'El pago debe ser un número';
    return null;
  };

  const handleCrear = async () => {
    setMensaje(null);
    const errorMsg = validarForm();
    if (errorMsg) {
      setMensaje(errorMsg);
      return;
    }
    try {
      await request('/tareas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setForm({ titulo: '', descripcion: '', pago: '' });
      setMostrarForm(false);
      cargarTareas();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const handleEditar = (tarea) => {
    if (tarea.asignadoA) {
      setMensaje('No se puede modificar una tarea que ya fue asignada.');
      return;
    }
    setEditando(tarea);
    setForm({ titulo: tarea.titulo, descripcion: tarea.descripcion, pago: tarea.pago });
    setMostrarForm(true);
  };


  const handleGuardarEdicion = async () => {
    setMensaje(null);
    const errorMsg = validarForm();
    if (errorMsg) {
      setMensaje(errorMsg);
      return;
    }
    try {
      await request(`/tareas/${editando._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setEditando(null);
      setForm({ titulo: '', descripcion: '', pago: '' });
      setMostrarForm(false);
      cargarTareas();
    } catch (err) {
      setMensaje(err.message);
    }
  };


  const handleEliminar = async (id) => {
    setMensaje(null);
    try {
      await request(`/tareas/${id}`, { method: 'DELETE' });
      cargarTareas();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  // Funciones para asignar/finalizar tareas con manejo de error

  const handleAsignarTarea = async (id, usuarioId) => {
    setMensaje(null);
    try {
      await request(`/tareas/asignar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });
      cargarTareas();
    } catch (err) {
      setMensaje(err.message);
    }
  };


  const handleFinalizarTarea = async (id, usuarioId) => {
    setMensaje(null);
    try {
      await request(`/tareas/finalizar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });
      cargarTareas();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <section>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, gap:12}}>
        <h2 style={{margin:0}}>{verTodas ? 'Todas las tareas' : 'Tareas de hoy'}</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={() => { setMostrarForm(m => !m); setEditando(null); }} style={{background:'#28a745', color:'#fff'}}>
            {mostrarForm && !editando ? 'Cancelar' : 'Crear Tarea'}
          </button>
          <button onClick={() => setVerTodas(v => !v)} style={{background:'#007bff', color:'#fff'}}>
            {verTodas ? 'Ver solo hoy' : 'Ver todas'}
          </button>
        </div>
      </div>
      {mensaje && (
        <div style={{background:'#ffd6d6', color:'#a00', padding:10, borderRadius:6, marginBottom:16, textAlign:'center'}}>{mensaje}</div>
      )}
      {mostrarForm && (
        <div style={{background:'#f8f9fa', padding:16, borderRadius:8, marginBottom:18, maxWidth:420, marginLeft:'auto', marginRight:'auto'}}>
          <input placeholder="Título" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion: e.target.value}))}></textarea>
          <input placeholder="Pago" type="number" value={form.pago} onChange={e => setForm(f => ({...f, pago: e.target.value}))} />
          {editando ? (
            <button onClick={handleGuardarEdicion} style={{marginTop:8, background:'#007bff', color:'#fff'}}>Guardar Cambios</button>
          ) : (
            <button onClick={handleCrear} style={{marginTop:8}}>Crear Tarea</button>
          )}
        </div>
      )}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20}}>
        {tareas.length === 0 && <p>No hay tareas para mostrar.</p>}
        {tareas.map(t => (
          <div key={t._id} style={{
            borderLeft:'6px solid #28a745',
            boxShadow:'0 2px 12px #28a74522',
            background: t.estado === 'en progreso' ? '#e9ecef' : t.estado === 'finalizado' ? '#d4edda' : '#fff',
            opacity: t.estado === 'pendiente' ? 1 : 0.95,
            padding:16, borderRadius:8, position:'relative'
          }}>
            <strong>{t.titulo}</strong><br/>
            <span style={{color:'#555'}}>{t.descripcion}</span><br/>
            <span style={{color:'#28a745'}}>Pago: Q{t.pago}</span><br/>
            <span>Estado: <b style={{color:t.estado==='finalizado'?'#28a745':t.estado==='en progreso'?'#888':'#333'}}>{t.estado}</b></span><br/>
            <div style={{marginTop:10, display:'flex', gap:8}}>
              {/* Mostrar botón Editar solo si la tarea NO está finalizada */}
              {t.estado !== 'finalizado' && (
                <button onClick={() => handleEditar(t)} style={{background:'#007bff', color:'#fff'}}>Editar</button>
              )}
              {/* Mostrar botón Eliminar si la tarea no tiene usuario asignado o si está finalizada y pagada */}
              {(
                (!t.asignadoA) ||
                (t.estado === 'finalizado' && t.pagado)
              ) && (
                <button onClick={() => handleEliminar(t._id)} style={{background:'#dc3545', color:'#fff'}}>Eliminar</button>
              )}
            </div>
            {/* Asignar tarea a usuario si está pendiente */}
            {t.estado === 'pendiente' && usuarios.length > 0 && (
              <AsignarTareaUsuario
                usuarios={usuarios}
                tareaId={t._id}
                onAsignar={handleAsignarTarea}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TareasHoyAdmin;
