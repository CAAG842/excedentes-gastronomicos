import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function DashboardAdmin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="text-center py-16 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Usuarios" value={data.totalUsuarios} />
        <Card label="Comercios Registrados" value={data.totalComercios} />
        <Card label="Clientes Registrados" value={data.totalClientes} />
        <Card label="Comercios Pendientes" value={data.comerciosPendientes} highlight />
        <Card label="Packs Publicados" value={data.totalPacks} />
        <Card label="Reservas Totales" value={data.totalReservas} />
        <Card label="Reservas Completadas" value={data.reservasCompletadas} />
        <Card label="Kg Rescatados" value={`${data.kgRescatados.toFixed(1)} kg`} />
        <Card label="Ventas Totales" value={`Gs. ${data.ventasTotal.toLocaleString()}`} />
        <Card label="Comisiones Acumuladas" value={`Gs. ${data.comisionesTotal.toLocaleString()}`} />
      </div>
    </div>
  );
}

function Card({ label, value, highlight }) {
  return (
    <div className={`rounded-xl border-2 p-5 ${highlight ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-orange-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
