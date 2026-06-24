import crypto from 'crypto';

export function generarCodigoReserva() {
  const numero = crypto.randomInt(1000, 9999);
  return `RE-${numero}`;
}
