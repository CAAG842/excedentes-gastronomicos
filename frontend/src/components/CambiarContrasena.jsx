import { useState } from 'react';
import { api } from '../services/api';

export default function CambiarContrasena() {
  const [form, setForm] = useState({ contrasenaActual: '', contrasenaNueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (form.contrasenaNueva !== form.confirmar) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      const data = await api.post('/auth/cambiar-contrasena', {
        contrasenaActual: form.contrasenaActual,
        contrasenaNueva: form.contrasenaNueva
      });
      setMensaje(data.mensaje);
      setForm({ contrasenaActual: '', contrasenaNueva: '', confirmar: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Cambiar contraseña</h2>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{mensaje}</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
        <input type="password" value={form.contrasenaActual} onChange={e => setForm({ ...form, contrasenaActual: e.target.value })} required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
        <input type="password" value={form.contrasenaNueva} onChange={e => setForm({ ...form, contrasenaNueva: e.target.value })} required minLength={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
        <input type="password" value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })} required minLength={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
      </div>
      <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
        Cambiar contraseña
      </button>
    </form>
  );
}
