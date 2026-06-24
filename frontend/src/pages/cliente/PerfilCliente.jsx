import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ZONAS = ['Centro', 'Villa Morra', 'Sajonia', 'San Pablo', 'Lambaré', 'San Lorenzo', 'Luque', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Recoleta', 'Barrio Obrero', 'Trinidad', 'Zeballos Cué', 'Jara', 'Tacumbú'];

export default function PerfilCliente() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({ telefono: '', zonaPreferente: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/cliente/perfil').then(data => {
      setPerfil(data);
      setForm({ telefono: data.telefono, zonaPreferente: data.zonaPreferente });
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const data = await api.put('/cliente/perfil', form);
      setMensaje(data.mensaje);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!perfil) return <div className="text-center py-16 text-gray-400">Cargando perfil...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <p className="text-sm text-gray-500">Nombre</p>
        <p className="text-lg font-medium text-gray-800 mb-3">{perfil.usuario?.nombre}</p>
        <p className="text-sm text-gray-500">Correo</p>
        <p className="text-lg font-medium text-gray-800">{perfil.usuario?.correo}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="0981-123456" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zona preferente</label>
          <select value={form.zonaPreferente} onChange={e => setForm({ ...form, zonaPreferente: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">Recibirás notificaciones de ofertas en esta zona.</p>
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
