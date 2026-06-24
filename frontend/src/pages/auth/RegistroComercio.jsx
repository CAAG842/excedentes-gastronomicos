import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const ZONAS = ['Centro', 'Villa Morra', 'Sajonia', 'San Pablo', 'Lambaré', 'San Lorenzo', 'Luque', 'Fernando de la Mora', 'Mariano Roque Alonso', 'Recoleta', 'Barrio Obrero', 'Trinidad', 'Zeballos Cué', 'Jara', 'Tacumbú'];

export default function RegistroComercio() {
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', nombreComercial: '', direccionFisica: '', ciudadZona: '', telefonoContacto: '' });
  const [documento, setDocumento] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return setDocumento(null);
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Formato no permitido. Solo PDF, JPG o PNG.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    setDocumento(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!documento) {
      setError('Debe adjuntar un documento de habilitación.');
      return;
    }
    setEnviando(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      formData.append('documento', documento);
      const data = await api.post('/auth/registro/comercio', formData);
      setExito(data.mensaje);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-emerald-700 text-center mb-6">Registro de Comercio / Mipyme</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
        {exito && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{exito}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del responsable</label>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre comercial</label>
              <input name="nombreComercial" value={form.nombreComercial} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección del local</label>
            <input name="direccionFisica" value={form.direccionFisica} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zona / Barrio</label>
              <select name="ciudadZona" value={form.ciudadZona} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="">Seleccionar...</option>
                {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
              <input name="telefonoContacto" value={form.telefonoContacto} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Documento de habilitación</label>
            <p className="text-xs text-gray-500 mb-2">Suba un documento que acredite la habilitación para venta de alimentos (registro sanitario, patente municipal, etc.). Formatos: PDF, JPG, PNG. Máx. 5 MB.</p>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            {documento && (
              <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {documento.name}
              </p>
            )}
          </div>
          <button type="submit" disabled={enviando} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {enviando ? 'Enviando...' : 'Solicitar Registro'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
          ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-600 hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
