import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { generarComprobante } from '../../utils/exportReserva';
import ConfirmModal from '../../components/ConfirmModal';

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    api.get('/reservas').then(setReservas).catch(() => {});
  }

  async function cancelar(id) {
    try {
      await api.patch(`/reservas/${id}/cancelar`);
      setMensaje('Reserva cancelada exitosamente');
      cargar();
    } catch (err) {
      setMensaje(err.message);
    }
  }

  const colores = {
    PENDIENTE_RETIRO: 'bg-yellow-100 text-yellow-800',
    COMPLETADA: 'bg-green-100 text-green-800',
    EXPIRADA: 'bg-gray-100 text-gray-600',
    CANCELADA: 'bg-red-100 text-red-800'
  };

  const etiquetas = {
    PENDIENTE_RETIRO: 'Pendiente de Retiro',
    COMPLETADA: 'Completada',
    EXPIRADA: 'Expirada',
    CANCELADA: 'Cancelada'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Reservas</h1>

      {mensaje && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">{mensaje}</div>}

      {reservas.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No tienes reservas aún</p>
      ) : (
        <div className="space-y-4">
          {reservas.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-mono font-bold text-emerald-700">{r.codigoReserva}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colores[r.estadoReserva]}`}>
                      {etiquetas[r.estadoReserva]}
                    </span>
                  </div>
                  <p className="font-medium text-gray-800">{r.pack?.comercio?.nombreComercial}</p>
                  <p className="text-sm text-gray-500">{r.pack?.descripcion}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {r.pack?.comercio?.direccionFisica} - {r.pack?.comercio?.ciudadZona}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-700">Gs. {Number(r.montoTotal).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Cant: {r.cantidadReservada}</p>
                  <p className="text-sm text-gray-500">{new Date(r.fechaReserva).toLocaleString()}</p>
                  <button onClick={() => generarComprobante(r)}
                    className="mt-2 text-emerald-600 text-sm font-medium hover:text-emerald-800 hover:underline">
                    Descargar comprobante
                  </button>
                  {r.estadoReserva === 'PENDIENTE_RETIRO' && (
                    <div className="flex flex-col items-end gap-2 mt-2">
                      {r.pack?.comercio?.latitudEstatica && (
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${r.pack.comercio.latitudEstatica},${r.pack.comercio.longitudEstatica}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 text-sm font-medium hover:underline">
                          Cómo llegar
                        </a>
                      )}
                      <button onClick={() => setConfirmacion({ msg: '¿Estás seguro de cancelar esta reserva?', fn: () => cancelar(r.id) })}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Cancelar reserva
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
