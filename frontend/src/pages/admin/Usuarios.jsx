import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => { cargar(); }, [filtro]);

  async function cargar() {
    const params = filtro ? `?estado=${filtro}` : '';
    const data = await api.get(`/admin/usuarios${params}`);
    setUsuarios(data);
  }

  async function aprobar(id) {
    await api.patch(`/admin/usuarios/${id}/aprobar`);
    setMensaje('Comercio aprobado exitosamente');
    cargar();
  }

  async function rechazar(id) {
    await api.patch(`/admin/usuarios/${id}/rechazar`, { motivo: 'Datos incompletos' });
    setMensaje('Comercio rechazado');
    cargar();
  }

  async function suspender(id) {
    await api.patch(`/admin/usuarios/${id}/suspender`, { motivo: 'Incumplimiento de políticas' });
    setMensaje('Cuenta suspendida');
    cargar();
  }

  const colores = { ACTIVO: 'bg-green-100 text-green-800', PENDIENTE: 'bg-yellow-100 text-yellow-800', SUSPENDIDO: 'bg-red-100 text-red-800' };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios</h1>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>}

      <div className="flex gap-2 mb-6">
        {['', 'PENDIENTE', 'ACTIVO', 'SUSPENDIDO'].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {f || 'Todos'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comercio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{u.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.correo}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.rol}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colores[u.estado]}`}>{u.estado}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.comercioPerfil?.nombreComercial || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.estado === 'PENDIENTE' && (
                        <>
                          <button onClick={() => aprobar(u.id)} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Aprobar</button>
                          <button onClick={() => rechazar(u.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Rechazar</button>
                        </>
                      )}
                      {u.estado === 'ACTIVO' && u.rol !== 'ADMINISTRADOR' && (
                        <button onClick={() => suspender(u.id)} className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700">Suspender</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
