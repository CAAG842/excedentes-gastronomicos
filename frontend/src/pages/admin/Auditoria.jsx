import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Auditoria() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get('/admin/auditoria').then(setLogs).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Log de Auditoría</h1>

      {logs.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No hay registros de auditoría</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{new Date(log.fechaHora).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{log.usuarioActor?.nombre}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{log.accionRealizada}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.detalles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
