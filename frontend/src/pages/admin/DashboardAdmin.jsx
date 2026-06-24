import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';
import { exportAdminExcel, exportAdminPDF } from '../../utils/exportDashboard';

export default function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [exportando, setExportando] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(() => {});
  }, []);

  function handleExport(tipo) {
    setExportando(tipo);
    try {
      if (tipo === 'excel') exportAdminExcel(data);
      else exportAdminPDF(data);
    } finally {
      setExportando(null);
    }
  }

  if (!data) return <div className="text-center py-16 text-gray-400">Cargando...</div>;

  const chartData = data.ventasMensuales
    ? Object.entries(data.ventasMensuales).map(([mes, vals]) => ({
        mes: mes.slice(5),
        ventas: vals.ventas,
        comisiones: vals.comisiones,
        transacciones: vals.transacciones
      }))
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
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

      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ventas y Comisiones Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(val) => `Gs. ${val.toLocaleString()}`} />
              <Bar dataKey="ventas" fill="#059669" name="Ventas" />
              <Bar dataKey="comisiones" fill="#f59e0b" name="Comisiones" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
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
