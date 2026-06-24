import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => { setPagina(1); }, [filtro]);
  useEffect(() => { cargar(); }, [filtro, pagina]);

  async function cargar() {
    const params = new URLSearchParams({ pagina });
    if (filtro) params.set('estado', filtro);
    const data = await api.get(`/admin/usuarios?${params}`);
    setUsuarios(data.datos);
    setTotalPaginas(data.totalPaginas);
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

  async function reactivar(id) {
    await api.patch(`/admin/usuarios/${id}/reactivar`);
    setMensaje('Cuenta reactivada exitosamente');
    cargar();
  }

  function verDocumento(filename) {
    const token = localStorage.getItem('token');
    fetch(`/api/uploads/${filename}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar el documento');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
      .catch(() => setMensaje('Error al abrir el documento'));
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
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
                  <td className="px-4 py-3 text-sm">
                    {u.comercioPerfil?.documentoHabilitacion ? (
                      <button
                        onClick={() => verDocumento(u.comercioPerfil.documentoHabilitacion)}
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.estado === 'PENDIENTE' && (
                        <>
                          <button onClick={() => setConfirmacion({ msg: `¿Aprobar a ${u.nombre}?`, fn: () => aprobar(u.id) })} className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">Aprobar</button>
                          <button onClick={() => setConfirmacion({ msg: `¿Rechazar a ${u.nombre}?`, fn: () => rechazar(u.id) })} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Rechazar</button>
                        </>
                      )}
                      {u.estado === 'ACTIVO' && u.rol !== 'ADMINISTRADOR' && (
                        <button onClick={() => setConfirmacion({ msg: `¿Suspender a ${u.nombre}?`, fn: () => suspender(u.id) })} className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700">Suspender</button>
                      )}
                      {u.estado === 'SUSPENDIDO' && (
                        <button onClick={() => setConfirmacion({ msg: `¿Reactivar a ${u.nombre}?`, fn: () => reactivar(u.id) })} className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Reactivar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-600">Página {pagina} de {totalPaginas}</p>
            <div className="flex gap-2">
              <button onClick={() => setPagina(p => p - 1)} disabled={pagina <= 1}
                className="px-3 py-1 text-sm bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Anterior</button>
              <button onClick={() => setPagina(p => p + 1)} disabled={pagina >= totalPaginas}
                className="px-3 py-1 text-sm bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {confirmacion && (
        <ConfirmModal
          mensaje={confirmacion.msg}
          onConfirm={() => { confirmacion.fn(); setConfirmacion(null); }}
          onCancel={() => setConfirmacion(null)}
        />
      )}
    </div>
  );
}
