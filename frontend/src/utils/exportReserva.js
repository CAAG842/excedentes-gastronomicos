import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generarComprobante(reserva) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(5, 150, 105);
  doc.text('GastroRescue', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('Comprobante de Reserva', 14, 30);

  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.5);
  doc.line(14, 34, 196, 34);

  doc.setFontSize(28);
  doc.setTextColor(5, 150, 105);
  doc.text(reserva.codigoReserva, 105, 52, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Presenta este código en el comercio para retirar tu pack', 105, 60, { align: 'center' });

  autoTable(doc, {
    startY: 68,
    head: [['Detalle', 'Información']],
    body: [
      ['Comercio', reserva.pack?.comercio?.nombreComercial || '-'],
      ['Dirección', `${reserva.pack?.comercio?.direccionFisica || ''} - ${reserva.pack?.comercio?.ciudadZona || ''}`],
      ['Descripción', reserva.pack?.descripcion || '-'],
      ['Cantidad', String(reserva.cantidadReservada)],
      ['Monto Total', `Gs. ${Number(reserva.montoTotal).toLocaleString()}`],
      ['Estado', reserva.estadoReserva.replace('_', ' ')],
      ['Fecha de Reserva', new Date(reserva.fechaReserva).toLocaleString()],
      ['Retiro hasta', new Date(reserva.pack?.horaLimiteRetiro).toLocaleString()],
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 244] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  });

  const y = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generado el ${new Date().toLocaleString()} - GastroRescue`, 105, y, { align: 'center' });

  doc.save(`comprobante_${reserva.codigoReserva}.pdf`);
}
