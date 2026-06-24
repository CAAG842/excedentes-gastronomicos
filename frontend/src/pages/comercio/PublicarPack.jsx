import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function PublicarPack() {
  const [form, setForm] = useState({ descripcion: '', precioOriginal: '', precioOferta: '', cantidadDisponible: '', horaLimiteRetiro: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const descuento = form.precioOriginal && form.precioOferta
    ? Math.round((1 - form.precioOferta / form.precioOriginal) * 100) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/comercio/packs', form);
      navigate('/comercio/packs');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Publicar Pack Sorpresa</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del pack</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Ej: Pack sorpresa de panadería - incluye pan, medialunas y facturas del día" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio original (Gs.)</label>
            <input name="precioOriginal" type="number" value={form.precioOriginal} onChange={handleChange} required min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta (Gs.)</label>
            <input name="precioOferta" type="number" value={form.precioOferta} onChange={handleChange} required min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        {form.precioOriginal && form.precioOferta && (
          <p className={`text-sm font-medium ${descuento >= 50 ? 'text-green-600' : 'text-red-600'}`}>
            Descuento: {descuento}% {descuento < 50 ? '(mínimo requerido: 50%)' : ''}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad disponible</label>
            <input name="cantidadDisponible" type="number" value={form.cantidadDisponible} onChange={handleChange} required min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora límite de retiro</label>
            <input name="horaLimiteRetiro" type="datetime-local" value={form.horaLimiteRetiro} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
        <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
          Publicar Pack
        </button>
      </form>
    </div>
  );
}
