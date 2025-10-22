
import React, { useEffect, useState } from 'react';
import { exportarReportePDF } from '../utils/pdfUtils';
import { FaFilePdf } from 'react-icons/fa';
import { useApi } from '../hooks/useApi';

function ReportesAvanzado() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [saldo, setSaldo] = useState(null);
  const [pagando, setPagando] = useState(false);
  const [resumen, setResumen] = useState({});
  const [tareas, setTareas] = useState([]);
  const { request } = useApi();


  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await request('/usuarios');
        setUsuarios(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      }
    };
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioId) {
      cargarTareasUsuario(usuarioId, periodo);
      cargarSaldo(usuarioId, periodo);
    } else {
      cargarTodasTareasPorPeriodo(periodo);
      setDetalleUsuario(null);
      setSaldo(null);
    }
    // eslint-disable-next-line
  }, [usuarioId, periodo]);


  // Cargar todas las tareas asignadas filtradas por periodo
  const cargarTodasTareasPorPeriodo = async (periodoSel = '') => {
    try {
      const params = new URLSearchParams();
      if (periodoSel) params.append('periodo', periodoSel);
      const endpoint = `/reportes/por-usuario?${params.toString()}`;
      const data = await request(endpoint);
      // Solo tareas asignadas
      const tareasAsignadas = data.filter(t => t.asignadoA);
      setTareas(tareasAsignadas.map(t => ({
        ...t,
        usuario: t.asignadoA?.nombre || ''
      })));
    } catch (err) {
      console.error('Error al cargar tareas por periodo:', err);
    }
  };


  const cargarTareasUsuario = async (usuarioIdSel, periodoSel = '') => {
    try {
      const params = new URLSearchParams({ usuarioId: usuarioIdSel });
      if (periodoSel) params.append('periodo', periodoSel);
      const endpoint = `/reportes/por-usuario?${params.toString()}`;
      const data = await request(endpoint);
      setDetalleUsuario({ tareas: data });
    } catch (err) {
      console.error('Error al cargar tareas de usuario:', err);
    }
  };

  const cargarSaldo = async (usuarioIdSel, periodoSel = '') => {
    try {
      const params = new URLSearchParams({ usuarioId: usuarioIdSel });
      if (periodoSel) params.append('periodo', periodoSel);
      const endpoint = `/reportes/saldo-pendiente?${params.toString()}`;
      const data = await request(endpoint);
      setSaldo(data);
    } catch (err) {
      console.error('Error al cargar saldo:', err);
    }
  };

  const marcarPagado = async () => {
    setPagando(true);
    try {
      await request('/reportes/marcar-pagadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, periodo })
      });
      cargarSaldo(usuarioId, periodo);
      cargarTareasUsuario(usuarioId, periodo);
    } catch (err) {
      console.error('Error al marcar pagado:', err);
    }
    setPagando(false);
  };

  return (
    <section>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, gap:12}}>
        <h2 style={{margin:0}}>Reportes</h2>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button onClick={() => setPeriodo('')} style={{background: periodo===''?'#28a745':'#007bff', color:'#fff', fontSize:15, padding:'6px 14px', borderRadius:6, border:'none', fontWeight:'bold'}}>Todos</button>
          <button onClick={() => setPeriodo('dia')} style={{background: periodo==='dia'?'#28a745':'#007bff', color:'#fff', fontSize:15, padding:'6px 14px', borderRadius:6, border:'none', fontWeight:'bold'}}>Hoy</button>
          <button onClick={() => setPeriodo('semana')} style={{background: periodo==='semana'?'#28a745':'#007bff', color:'#fff', fontSize:15, padding:'6px 14px', borderRadius:6, border:'none', fontWeight:'bold'}}>Semana</button>
          <button onClick={() => setPeriodo('mes')} style={{background: periodo==='mes'?'#28a745':'#007bff', color:'#fff', fontSize:15, padding:'6px 14px', borderRadius:6, border:'none', fontWeight:'bold'}}>Mes</button>
          <button
            onClick={() => {
              const fecha = new Date();
              const yyyy = fecha.getFullYear();
              const mm = String(fecha.getMonth() + 1).padStart(2, '0');
              const dd = String(fecha.getDate()).padStart(2, '0');
              let nombre = 'reporte';
              if (usuarioId) {
                const usuario = usuarios.find(u => u._id === usuarioId);
                if (usuario) nombre += `_${usuario.nombre.replace(/\s+/g, '_')}`;
              }
              nombre += `_${yyyy}-${mm}-${dd}.pdf`;
              exportarReportePDF('reporte-pdf', nombre);
            }}
            style={{
              background:'#dc3545',
              color:'#fff',
              borderRadius:6,
              padding:'6px 14px',
              fontWeight:'bold',
              fontSize:15,
              border:'none',
              display:'flex',
              alignItems:'center',
              gap:6
            }}
            title="Descargar PDF"
          >
            <FaFilePdf size={18} /> PDF
          </button>
        </div>
        <div style={{
          background: '#f4f4f4',
          borderRadius: 8,
          padding: '10px 18px',
          boxShadow: '0 2px 8px #0001',
          maxWidth: 340,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <label style={{fontWeight:600, color:'#333', fontSize:15, marginRight:8}}>Filtrar por persona:</label>
          <select
            value={usuarioId}
            onChange={e => setUsuarioId(e.target.value)}
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
            <option value="">Todos</option>
            {usuarios.filter(u => u.rol === 'usuario').map(u => (
              <option key={u._id} value={u._id}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      <div id="reporte-pdf">
      {detalleUsuario ? (
        <div style={{marginTop:24}}>
          <h3 style={{color:'#28a745'}}>Tareas realizadas por {usuarios.find(u => u._id === usuarioId)?.nombre || ''}</h3>
          {/* Resumen de pagos para usuario filtrado */}
          {detalleUsuario.tareas && detalleUsuario.tareas.length > 0 && (
            <div style={{marginBottom:18}}>
              <h3 style={{color:'#218838', marginBottom:8}}>Resumen de pagos</h3>
              <table style={{width:'100%', background:'#f8f9fa', borderRadius:8, marginBottom:18, fontSize:15}}>
                <thead>
                  <tr style={{background:'#eafbe7'}}>
                    <th style={{padding:'8px 6px', textAlign:'left'}}>Trabajador</th>
                    <th style={{padding:'8px 6px', textAlign:'left'}}>Total pagado</th>
                    <th style={{padding:'8px 6px', textAlign:'left'}}>Tareas</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Solo hay un usuario filtrado
                    const totalPagado = detalleUsuario.tareas.reduce((acc, t) => t.pagado ? acc + (Number(t.pago) || 0) : acc, 0);
                    const totalTareas = detalleUsuario.tareas.length;
                    return (
                      <tr>
                        <td style={{padding:'6px 6px'}}>{usuarios.find(u => u._id === usuarioId)?.nombre || ''}</td>
                        <td style={{padding:'6px 6px', color:'#28a745', fontWeight:'bold'}}>Q{totalPagado.toFixed(2)}</td>
                        <td style={{padding:'6px 6px'}}>{totalTareas}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          )}
          {saldo && (
            <div style={{marginBottom:18, background:'#f8f9fa', padding:16, borderRadius:8, display:'flex', alignItems:'center', gap:16}}>
              <span style={{fontWeight:'bold', color: saldo.total > 0 ? '#dc3545' : '#28a745'}}>
                {saldo.total > 0 ? `Saldo pendiente: Q${saldo.total.toFixed(2)}` : 'Todo pagado'}
              </span>
              {saldo.total > 0 ? (
                <button onClick={marcarPagado} disabled={pagando} style={{background:'#28a745', color:'#fff', borderRadius:6, padding:'8px 18px'}}>
                  {pagando ? 'Procesando...' : 'Marcar como pagado'}
                </button>
              ) : (
                <span style={{color:'#28a745', fontWeight:'bold'}}>Cancelado</span>
              )}
            </div>
          )}
          {detalleUsuario.tareas.length === 0 && <p>No hay tareas para mostrar.</p>}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:20}}>
            {detalleUsuario.tareas.map(t => (
              <div key={t._id} style={{
                borderLeft:'6px solid #28a745',
                boxShadow:'0 2px 12px #28a74522',
                background: t.estado === 'en progreso' ? '#e9ecef' : t.estado === 'finalizado' ? '#d4edda' : '#fff',
                opacity: t.estado === 'pendiente' ? 1 : 0.95,
                padding:16, borderRadius:8, position:'relative', marginBottom:8
              }}>
                <strong>{t.titulo}</strong><br/>
                <span style={{color:'#555'}}>{t.descripcion}</span><br/>
                <span style={{color:'#28a745'}}>Pago: Q{t.pago}</span><br/>
                <span>Estado: <b style={{color:t.estado==='finalizado'?'#28a745':t.estado==='en progreso'?'#888':'#333'}}>{t.estado}</b></span><br/>
                <span>Asignada: {t.fechaAsignacion && new Date(t.fechaAsignacion).toLocaleString()}</span><br/>
                <span>Finalizada: {t.fechaFinalizacion && new Date(t.fechaFinalizacion).toLocaleString()}</span><br/>
                <span style={{color: t.pagado ? '#28a745' : '#dc3545', fontWeight:'bold'}}>
                  {t.pagado ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {tareas.length === 0 && <p>No hay tareas para mostrar.</p>}
          <div className="tareas-grid">
            {tareas.map(t => (
              <div key={t._id} className="card tarea-card" style={{
                background: t.estado === 'pendiente' ? '#d4edda' : '#ffd6d6',
                borderLeft: t.estado === 'pendiente' ? '6px solid #28a745' : '6px solid #dc3545',
                marginBottom: 12
              }}>
                <div className="tarea-header">
                  <h3>{t.titulo}</h3>
                  <span className={`tarea-estado tarea-estado-${t.estado}`}>{t.estado}</span>
                </div>
                <p className="tarea-desc">{t.descripcion}</p>
                <div className="tarea-info">
                  <span><b>Usuario:</b> {t.usuario}</span>
                  <span><b>Pago:</b> Q{t.pago}</span>
                </div>
                <div style={{fontSize:'0.95em', color:'#555'}}>
                  <span><b>Asignada:</b> {t.fechaAsignacion && new Date(t.fechaAsignacion).toLocaleString()}</span><br/>
                  <span><b>Finalizada:</b> {t.fechaFinalizacion && new Date(t.fechaFinalizacion).toLocaleString()}</span>
                </div>
                <span style={{color: t.pagado ? '#28a745' : '#dc3545', fontWeight:'bold'}}>
                  {t.pagado ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

export default ReportesAvanzado;
