import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const ZONAS = ['Centro', 'Villa Morra', 'Sajonia', 'San Pablo', 'Lambaré', 'San Lorenzo', 'Luque', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Recoleta', 'Barrio Obrero', 'Trinidad', 'Zeballos Cué', 'Jara', 'Tacumbú'];

export default function RegistroCliente() {
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', telefono: '', zonaPreferente: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/auth/registro/cliente', form);
      setExito(data.mensaje);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">Registro de Cliente</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {exito && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{exito}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, una mayúscula, una minúscula y un número.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0981-123456" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zona preferente</label>
            <select name="zonaPreferente" value={form.zonaPreferente} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="">Seleccionar zona...</option>
              {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Registrarme
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
          ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-600 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
