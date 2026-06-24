import prisma from '../config/database.js';

export async function expirarPacksVencidos() {
  const resultado = await prisma.packSorpresa.updateMany({
    where: {
      estadoPack: 'DISPONIBLE',
      horaLimiteRetiro: { lt: new Date() }
    },
    data: { estadoPack: 'EXPIRADO' }
  });

  const reservasExpiradas = await prisma.reserva.updateMany({
    where: {
      estadoReserva: 'PENDIENTE_RETIRO',
      pack: { horaLimiteRetiro: { lt: new Date() } }
    },
    data: { estadoReserva: 'EXPIRADA' }
  });

  if (resultado.count > 0 || reservasExpiradas.count > 0) {
    console.log(`[Expiración] ${resultado.count} packs y ${reservasExpiradas.count} reservas expiradas`);
  }
}
