import React from 'react';
import { FaTasks, FaClipboardCheck } from 'react-icons/fa';

export function MenuUsuario({ opcion, setOpcion }) {
  return (
    <aside className="usuario-sidebar">
      <h2>Menú</h2>
      <ul>
        <li>
          <button className={opcion === 'todas' ? 'active' : ''} onClick={() => setOpcion('todas')}>
            <FaTasks style={{marginRight:8}}/> Todas las tareas
          </button>
        </li>
        <li>
          <button className={opcion === 'asignadas' ? 'active' : ''} onClick={() => setOpcion('asignadas')}>
            <FaClipboardCheck style={{marginRight:8}}/> Mis tareas asignadas
          </button>
        </li>
      </ul>
    </aside>
  );
}
