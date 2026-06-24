import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

function descargarArchivo(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function fechaReporte() {
  return new Date().toLocaleDateString('es-PY', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ── COMERCIO: Excel ──

export function exportComercioExcel(data) {
  const wb = XLSX.utils.book_new();

  const resumenRows = [
    ['Indicador', 'Valor'],
    ['Ingresos Brutos (Gs.)', data.resumen.ingresosBrutos],
    ['Ingresos Netos (Gs.)', data.resumen.ingresosNetos],
    ['Comisiones Devengadas (Gs.)', data.resumen.comisionesTotal],
    ['Kg Rescatados', data.resumen.kgRescatados],
    ['Reservas Completadas', data.resumen.reservasCompletadas],
    ['Total Reservas', data.resumen.reservasTotales],
    ['Tasa de Éxito (%)', data.resumen.tasaCompletadas],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  const meses = Object.entries(data.historialMensual);
  if (meses.length > 0) {
    const historialRows = [['Mes', 'Ingresos (Gs.)', 'Comisiones (Gs.)', 'Transacciones']];
    meses.forEach(([mes, vals]) => {
      historialRows.push([mes, vals.ingresos, vals.comisiones, vals.transacciones]);
    });
    const wsHistorial = XLSX.utils.aoa_to_sheet(historialRows);
    wsHistorial['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsHistorial, 'Historial Mensual');
  }

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  descargarArchivo(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `dashboard_comercio_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

// ── COMERCIO: PDF ──

export async function exportComercioPDF(data, chartRef) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text('GastroRescue - Dashboard Comercio', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${fechaReporte()}`, 14, 28);

  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(13);
  doc.setTextColor(40);
  doc.text('Resumen General', 14, 40);

  autoTable(doc, {
    startY: 44,
    head: [['Indicador', 'Valor']],
    body: [
      ['Ingresos Brutos', `Gs. ${data.resumen.ingresosBrutos.toLocaleString()}`],
      ['Ingresos Netos', `Gs. ${data.resumen.ingresosNetos.toLocaleString()}`],
      ['Comisiones Devengadas', `Gs. ${data.resumen.comisionesTotal.toLocaleString()}`],
      ['Kg Rescatados', `${data.resumen.kgRescatados.toFixed(1)} kg`],
      ['Reservas Completadas', String(data.resumen.reservasCompletadas)],
      ['Total Reservas', String(data.resumen.reservasTotales)],
      ['Tasa de Éxito', `${data.resumen.tasaCompletadas}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  const meses = Object.entries(data.historialMensual);
  if (meses.length > 0) {
    let y = doc.lastAutoTable.finalY + 12;

    doc.setFontSize(13);
    doc.setTextColor(40);
    doc.text('Historial Mensual', 14, y);

    autoTable(doc, {
      startY: y + 4,
      head: [['Mes', 'Ingresos (Gs.)', 'Comisiones (Gs.)', 'Transacciones']],
      body: meses.map(([mes, v]) => [
        mes,
        `Gs. ${v.ingresos.toLocaleString()}`,
        `Gs. ${v.comisiones.toLocaleString()}`,
        String(v.transacciones),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      styles: { fontSize: 10, cellPadding: 4 },
    });
  }

  if (chartRef?.current) {
    try {
      const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = doc.lastAutoTable.finalY + 12;
      if (y + imgHeight > 280) doc.addPage();
      y = y + imgHeight > 280 ? 20 : y;

      doc.setFontSize(13);
      doc.setTextColor(40);
      doc.text('Gráfico de Ingresos Mensuales', 14, y);
      doc.addImage(imgData, 'PNG', 14, y + 4, imgWidth, imgHeight);
    } catch {
      // Si falla la captura del gráfico, el PDF se genera sin él
    }
  }

  doc.save(`dashboard_comercio_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── ADMIN: Excel ──

export function exportAdminExcel(data) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ['Indicador', 'Valor'],
    ['Total Usuarios', data.totalUsuarios],
    ['Comercios Registrados', data.totalComercios],
    ['Clientes Registrados', data.totalClientes],
    ['Comercios Pendientes', data.comerciosPendientes],
    ['Packs Publicados', data.totalPacks],
    ['Reservas Totales', data.totalReservas],
    ['Reservas Completadas', data.reservasCompletadas],
    ['Kg Rescatados', data.kgRescatados],
    ['Ventas Totales (Gs.)', data.ventasTotal],
    ['Comisiones Acumuladas (Gs.)', data.comisionesTotal],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Panel Administración');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  descargarArchivo(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `dashboard_admin_${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

// ── ADMIN: PDF ──

export function exportAdminPDF(data) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(5, 150, 105);
  doc.text('GastroRescue - Panel de Administración', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el ${fechaReporte()}`, 14, 28);

  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(13);
  doc.setTextColor(40);
  doc.text('Indicadores Generales', 14, 40);

  autoTable(doc, {
    startY: 44,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total Usuarios', String(data.totalUsuarios)],
      ['Comercios Registrados', String(data.totalComercios)],
      ['Clientes Registrados', String(data.totalClientes)],
      ['Comercios Pendientes', String(data.comerciosPendientes)],
      ['Packs Publicados', String(data.totalPacks)],
      ['Reservas Totales', String(data.totalReservas)],
      ['Reservas Completadas', String(data.reservasCompletadas)],
      ['Kg Rescatados', `${data.kgRescatados.toFixed(1)} kg`],
      ['Ventas Totales', `Gs. ${data.ventasTotal.toLocaleString()}`],
      ['Comisiones Acumuladas', `Gs. ${data.comisionesTotal.toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 10, cellPadding: 4 },
  });

  doc.save(`dashboard_admin_${new Date().toISOString().slice(0, 10)}.pdf`);
}
