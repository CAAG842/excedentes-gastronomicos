import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function MisPacks() {
  const [packs, setPacks] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({});

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    api.get('/comercio/packs').then(setPacks).catch(() => {});
  }

  async function eliminar(id) {
    if (!confirm('¿Estás seguro de eliminar este pack?')) return;
    try {
      await api.delete(`/comercio/packs/${id}`);
      setMensaje('Pack eliminado exitosamente');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  }

  function iniciarEdicion(pack) {
    setEditando(pack.id);
    setFormEdit({
      descripcion: pack.descripcion,
      precioOriginal: Number(pack.precioOriginal),
      precioOferta: Number(pack.precioOferta),
      cantidadDisponible: pack.cantidadDisponible,
      horaLimiteRetiro: new Date(pack.horaLimiteRetiro).toISOString().slice(0, 16)
    });
  }

  async function guardarEdicion(id) {
    try {
      await api.put(`/comercio/packs/${id}`, formEdit);
      setMensaje('Pack actualizado exitosamente');
      setEditando(null);
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  }

  const colores = { DISPONIBLE: 'bg-green-100 text-green-800', AGOTADO: 'bg-gray-100 text-gray-600', EXPIRADO: 'bg-red-100 text-red-800' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis Packs Sorpresa</h1>
        <Link to="/comercio/publicar" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
          + Nuevo Pack
        </Link>
      </div>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>}

      {packs.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No has publicado packs aún</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
              {editando === p.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                    <input value={formEdit.descripcion} onChange={e => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Precio original</label>
                      <input type="number" value={formEdit.precioOriginal} onChange={e => setFormEdit({ ...formEdit, precioOriginal: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Precio oferta</label>
                      <input type="number" value={formEdit.precioOferta} onChange={e => setFormEdit({ ...formEdit, precioOferta: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                      <input type="number" value={formEdit.cantidadDisponible} onChange={e => setFormEdit({ ...formEdit, cantidadDisponible: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Hora límite</label>
                      <input type="datetime-local" value={formEdit.horaLimiteRetiro} onChange={e => setFormEdit({ ...formEdit, horaLimiteRetiro: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => guardarEdicion(p.id)} className="flex-1 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">Guardar</button>
                    <button onClick={() => setEditando(null)} className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colores[p.estadoPack]}`}>{p.estadoPack}</span>
                    <span className="text-sm text-gray-400">{new Date(p.fechaPublicacion).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-700 mb-2">{p.descripcion}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 line-through text-sm">Gs. {Number(p.precioOriginal).toLocaleString()}</span>
                    <span className="text-xl font-bold text-emerald-700">Gs. {Number(p.precioOferta).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>Stock: {p.cantidadDisponible}</span>
                    <span>Retiro hasta: {new Date(p.horaLimiteRetiro).toLocaleTimeString()}</span>
                  </div>
                  {p.estadoPack === 'DISPONIBLE' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => iniciarEdicion(p)} className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Editar</button>
                      <button onClick={() => eliminar(p.id)} className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Eliminar</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
