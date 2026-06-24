import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';
import { exportComercioExcel, exportComercioPDF } from '../../utils/exportDashboard';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [exportando, setExportando] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    api.get('/comercio/dashboard').then(setData).catch(() => {});
  }, []);

  async function handleExport(tipo) {
    setExportando(tipo);
    try {
      if (tipo === 'excel') exportComercioExcel(data);
      else await exportComercioPDF(data, chartRef);
    } finally {
      setExportando(null);
    }
  }

  if (!data) return <div className="text-center py-16 text-gray-400">Cargando dashboard...</div>;

  const chartData = Object.entries(data.historialMensual).map(([mes, vals]) => ({
    mes: mes.slice(5),
    ingresos: vals.ingresos,
    comisiones: vals.comisiones,
    transacciones: vals.transacciones
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Analítico</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={!!exportando}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exportando === 'excel' ? 'Exportando...' : 'Exportar Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exportando}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {exportando === 'pdf' ? 'Generando...' : 'Exportar PDF'}
          </button>
        </div>
      </div>

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
        <div ref={chartRef} className="bg-white rounded-xl shadow-md p-6">
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
