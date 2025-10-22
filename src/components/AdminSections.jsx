import React, { useState } from 'react';

function CrearUsuario({ crearUsuario, setNuevoUsuario }) {
  return (
    <section>
      <h2>Crear Usuario</h2>
      <input placeholder="Nombre" onChange={e => setNuevoUsuario(prev => ({ ...prev, nombre: e.target.value }))} />
      <input placeholder="Correo" onChange={e => setNuevoUsuario(prev => ({ ...prev, correo: e.target.value }))} />
      <input placeholder="Contraseña" type="password" onChange={e => setNuevoUsuario(prev => ({ ...prev, contrasena: e.target.value }))} />
      <button onClick={crearUsuario}>Crear Usuario</button>
    </section>
  );
}

function CrearTarea({ crearTarea, setTarea }) {
  return (
    <section>
      <h2>Crear Tarea</h2>
      <input placeholder="Título" onChange={e => setTarea(prev => ({ ...prev, titulo: e.target.value }))} />
      <textarea placeholder="Descripción" onChange={e => setTarea(prev => ({ ...prev, descripcion: e.target.value }))}></textarea>
      <input placeholder="Pago" type="number" onChange={e => setTarea(prev => ({ ...prev, pago: e.target.value }))} />
      <button onClick={crearTarea}>Crear Tarea</button>
    </section>
  );
}

function Reportes({ cargarReportes, exportar, reportes }) {
  return (
    <section>
      <h2>Reportes</h2>
      <button onClick={() => cargarReportes()}>Todos</button>
      <button onClick={() => cargarReportes('dia')}>Hoy</button>
      <button onClick={() => cargarReportes('semana')}>Semana</button>
      <button onClick={() => cargarReportes('mes')}>Mes</button>
      <button onClick={() => exportar('excel')}>Descargar Excel</button>
      <button onClick={() => exportar('pdf')}>Descargar PDF</button>
      {Object.keys(reportes).map(nombre => (
        <div key={nombre} className="card">
          <strong>{nombre}</strong><br />
          Tareas: {reportes[nombre].tareas}<br />
          Total: Q{reportes[nombre].pagoTotal}<br />
          Tiempo Total: {reportes[nombre].totalMin} min<br />
          Promedio: {reportes[nombre].promedioMin} min
        </div>
      ))}
    </section>
  );
}

export { CrearUsuario, CrearTarea, Reportes };
