import { useState } from 'react';
import { api } from '../../services/api';

export default function ValidarReserva() {
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function buscar(e) {
    e.preventDefault();
    setError('');
    setExito('');
    setReserva(null);
    try {
      const data = await api.post('/comercio/validar-reserva', { codigoReserva: codigo });
      setReserva(data.reserva);
    } catch (err) {
      setError(err.message);
    }
  }

  async function confirmar() {
    try {
      await api.post('/comercio/confirmar-entrega', { codigoReserva: codigo, metodoPago: 'EFECTIVO' });
      setExito('Entrega confirmada y pago registrado exitosamente');
      setReserva(null);
      setCodigo('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Validar Reserva en Caja</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {exito && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">{exito}</div>}

      <form onSubmit={buscar} className="bg-white rounded-xl shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Código de reserva del cliente</label>
        <div className="flex gap-3">
          <input
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            placeholder="RE-4812"
            required
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-xl font-mono text-center tracking-widest focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
            Buscar
          </button>
        </div>
      </form>

      {reserva && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-700 mb-4">Detalles de la Reserva</h3>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">Código:</span> {reserva.codigo}</p>
            <p><span className="font-medium">Cliente:</span> {reserva.cliente}</p>
            <p><span className="font-medium">Pack:</span> {reserva.packDescripcion}</p>
            <p><span className="font-medium">Cantidad:</span> {reserva.cantidad}</p>
            <p><span className="font-medium">Monto a cobrar:</span> <span className="text-xl font-bold text-emerald-700">Gs. {Number(reserva.monto).toLocaleString()}</span></p>
          </div>
          <button onClick={confirmar}
            className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-lg">
            Confirmar Entrega y Pago Presencial
          </button>
        </div>
      )}
    </div>
  );
}
