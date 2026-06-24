import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CambiarContrasena from '../../components/CambiarContrasena';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/comercio/perfil').then(data => { setPerfil(data); setForm(data); }).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setError('');
    try {
      const data = await api.put('/comercio/perfil', form);
      setMensaje(data.mensaje);
      setPerfil(data.perfil);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!perfil) return <div className="text-center py-16 text-gray-400">Cargando perfil...</div>;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Perfil del Comercio</h1>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
          <input name="nombreComercial" value={form.nombreComercial || ''} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección física</label>
          <input name="direccionFisica" value={form.direccionFisica || ''} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
          <input name="telefonoContacto" value={form.telefonoContacto || ''} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input name="latitudEstatica" type="number" step="any" value={form.latitudEstatica || ''} onChange={handleChange}
              placeholder="-25.2637"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input name="longitudEstatica" type="number" step="any" value={form.longitudEstatica || ''} onChange={handleChange}
              placeholder="-57.5759"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        <p className="text-xs text-gray-400">Las coordenadas se usan para generar los enlaces a Google Maps y Waze para tus clientes.</p>
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          Guardar Cambios
        </button>
      </form>

      <div className="mt-6">
        <CambiarContrasena />
      </div>
    </div>
  );
}
