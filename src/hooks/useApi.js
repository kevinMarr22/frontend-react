// Hook personalizado para peticiones a la API
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-1-erzl.onrender.com/api';
console.log('API_URL:', API_URL);

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en la petición');
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { request, loading, error };
}
