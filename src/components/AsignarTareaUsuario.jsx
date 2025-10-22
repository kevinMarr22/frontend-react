import React, { useEffect, useState } from 'react';

export default function AsignarTareaUsuario({ usuarios, onAsignar, tareaId }) {
  const [usuarioId, setUsuarioId] = useState('');

  useEffect(() => {
    if (usuarios.length > 0) {
      setUsuarioId(usuarios[0]._id);
    }
  }, [usuarios]);

  return (
    <div style={{
      marginTop: 12,
      marginBottom: 12,
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      background: '#f8f9fa',
      borderRadius: 8,
      padding: '8px 8px',
      boxShadow: '0 2px 8px #28a74522',
      border: '1.5px solid #28a745',
      minWidth: 0,
      width: '100%',
      maxWidth: '100%'
    }}>
  <span style={{fontWeight:600, color:'#218838', fontSize:14, marginRight:4, minWidth:70}}>Asignar a:</span>
      <select
        value={usuarioId}
        onChange={e => setUsuarioId(e.target.value)}
        style={{
          padding: '5px 10px',
          borderRadius: 6,
          border: '1.5px solid #28a745',
          fontSize: 14,
          background: '#fff',
          color: '#222',
          outline: 'none',
          boxShadow: '0 1px 3px #28a74522',
          minWidth: 0,
          flex: 1,
          maxWidth: 170
        }}
      >
        {usuarios.map(u => (
          <option key={u._id} value={u._id}>{u.nombre}</option>
        ))}
      </select>
      <button
        style={{
          marginLeft: 0,
          background: 'linear-gradient(90deg, #28a745 60%, #218838 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #28a74522',
          transition: 'background 0.2s',
          minWidth: 80
        }}
        onClick={() => onAsignar(tareaId, usuarioId)}
      >
        Asignar
      </button>
    </div>
  );
}
