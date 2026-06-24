import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    api.get('/notificaciones').then(setNotificaciones).catch(() => {});
  }, []);

  const onWsMessage = useCallback((data) => {
    if (data.tipo === 'NUEVA_OFERTA') {
      setNotificaciones(prev => [{
        id: Date.now(),
        titulo: data.titulo,
        mensaje: data.mensaje,
        leida: false,
        fechaCreacion: new Date().toISOString()
      }, ...prev]);
    }
  }, []);

  useWebSocket(onWsMessage);

  async function marcarLeida(id) {
    await api.patch(`/notificaciones/${id}`);
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notificaciones</h1>

      {notificaciones.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No tienes notificaciones</p>
      ) : (
        <div className="space-y-3">
          {notificaciones.map(n => (
            <div key={n.id}
              className={`rounded-lg p-4 border cursor-pointer transition-colors ${n.leida ? 'bg-gray-50 border-gray-200' : 'bg-emerald-50 border-emerald-200'}`}
              onClick={() => !n.leida && marcarLeida(n.id)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`font-medium ${n.leida ? 'text-gray-600' : 'text-emerald-800'}`}>{n.titulo}</p>
                  <p className="text-sm text-gray-500 mt-1">{n.mensaje}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {new Date(n.fechaCreacion).toLocaleString()}
                </span>
              </div>
              {!n.leida && <span className="inline-block mt-2 w-2 h-2 rounded-full bg-emerald-500"></span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
