import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ZONAS = ['', 'Centro', 'Villa Morra', 'Sajonia', 'San Pablo', 'Lambaré', 'San Lorenzo', 'Luque', 'Fernando de la Mora', 'Recoleta', 'Trinidad'];

export default function Catalogo() {
  const [packs, setPacks] = useState([]);
  const [zona, setZona] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [reservando, setReservando] = useState(null);

  useEffect(() => { cargar(); }, [zona, busqueda]);

  async function cargar() {
    try {
      const params = new URLSearchParams();
      if (zona) params.set('zona', zona);
      if (busqueda) params.set('busqueda', busqueda);
      const query = params.toString();
      const data = await api.get(`/catalogo${query ? `?${query}` : ''}`);
      setPacks(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function reservar(packId) {
    setReservando(packId);
    setMensaje('');
    setError('');
    try {
      const data = await api.post('/reservas', { packId, cantidad: 1 });
      setMensaje(`Reserva exitosa! Código: ${data.reserva.codigoReserva} - Presenta este código en ${data.reserva.comercio} antes de las ${new Date(data.reserva.horaLimiteRetiro).toLocaleTimeString()}`);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setReservando(null);
    }
  }

  function deepLink(lat, lng, nombre) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(nombre)}`;
  }

  function deepLinkWaze(lat, lng) {
    return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }

  function tiempoRestante(hora) {
    const diff = new Date(hora) - new Date();
    if (diff <= 0) return 'Expirado';
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    return hrs > 0 ? `${hrs}h ${mins % 60}min` : `${mins}min`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Ofertas</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar comercio o descripción..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          />
          <select value={zona} onChange={e => setZona(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
            <option value="">Todas las zonas</option>
            {ZONAS.filter(Boolean).map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>

      {mensaje && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-4 rounded-lg mb-6 font-medium">
          {mensaje}
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

      {packs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-xl">No hay ofertas disponibles en este momento</p>
          <p className="mt-2">Intenta con otra zona o vuelve más tarde</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map(pack => (
            <div key={pack.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-emerald-600 text-white px-4 py-3">
                <h3 className="font-bold text-lg">{pack.comercio.nombreComercial}</h3>
                <p className="text-emerald-100 text-sm">{pack.comercio.ciudadZona} - {pack.comercio.direccionFisica}</p>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-3">{pack.descripcion}</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-gray-400 line-through text-sm">Gs. {Number(pack.precioOriginal).toLocaleString()}</span>
                  <span className="text-2xl font-bold text-emerald-700">Gs. {Number(pack.precioOferta).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>Disponibles: {pack.cantidadDisponible}</span>
                  <span className="text-orange-600 font-medium">Retiro: {tiempoRestante(pack.horaLimiteRetiro)}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => reservar(pack.id)}
                    disabled={reservando === pack.id}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {reservando === pack.id ? 'Reservando...' : 'Reservar Pack'}
                  </button>
                  {pack.comercio.latitudEstatica && pack.comercio.longitudEstatica && (
                    <div className="flex gap-2">
                      <a href={deepLink(pack.comercio.latitudEstatica, pack.comercio.longitudEstatica, pack.comercio.nombreComercial)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-center bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        Google Maps
                      </a>
                      <a href={deepLinkWaze(pack.comercio.latitudEstatica, pack.comercio.longitudEstatica)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-center bg-cyan-50 text-cyan-700 py-2 rounded-lg text-sm font-medium hover:bg-cyan-100 transition-colors">
                        Waze
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
