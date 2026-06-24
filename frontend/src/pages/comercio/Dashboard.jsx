import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/comercio/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="text-center py-16 text-gray-400">Cargando dashboard...</div>;

  const chartData = Object.entries(data.historialMensual).map(([mes, vals]) => ({
    mes: mes.slice(5),
    ingresos: vals.ingresos,
    comisiones: vals.comisiones,
    transacciones: vals.transacciones
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Analítico</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card label="Ingresos Brutos" value={`Gs. ${data.resumen.ingresosBrutos.toLocaleString()}`} color="emerald" />
        <Card label="Ingresos Netos" value={`Gs. ${data.resumen.ingresosNetos.toLocaleString()}`} color="blue" />
        <Card label="Comisiones Devengadas" value={`Gs. ${data.resumen.comisionesTotal.toLocaleString()}`} color="orange" />
        <Card label="Kg Rescatados" value={`${data.resumen.kgRescatados.toFixed(1)} kg`} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card label="Reservas Completadas" value={data.resumen.reservasCompletadas} color="emerald" />
        <Card label="Total Reservas" value={data.resumen.reservasTotales} color="gray" />
        <Card label="Tasa de Éxito" value={`${data.resumen.tasaCompletadas}%`} color="blue" />
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ingresos Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(val) => `Gs. ${val.toLocaleString()}`} />
              <Bar dataKey="ingresos" fill="#059669" name="Ingresos" />
              <Bar dataKey="comisiones" fill="#f59e0b" name="Comisiones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, color }) {
  const colors = {
    emerald: 'border-emerald-200 bg-emerald-50',
    blue: 'border-blue-200 bg-blue-50',
    orange: 'border-orange-200 bg-orange-50',
    green: 'border-green-200 bg-green-50',
    gray: 'border-gray-200 bg-gray-50',
  };
  return (
    <div className={`rounded-xl border-2 p-5 ${colors[color]}`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
