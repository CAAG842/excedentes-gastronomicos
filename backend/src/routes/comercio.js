import prisma from '../config/database.js';
import { authorize } from '../middleware/auth.js';

export default async function comercioRoutes(fastify) {

  // CU-04: Comercio - Gestionar Perfil y Coordenadas Estáticas
  fastify.get('/api/comercio/perfil', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const perfil = await prisma.comercioPerfil.findUnique({
      where: { usuarioId: request.user.id }
    });
    if (!perfil) return reply.code(404).send({ error: 'Perfil no encontrado' });
    reply.send(perfil);
  });

  fastify.put('/api/comercio/perfil', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const { nombreComercial, direccionFisica, ciudadZona, telefonoContacto, latitudEstatica, longitudEstatica } = request.body;

    if (latitudEstatica !== undefined) {
      const lat = parseFloat(latitudEstatica);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return reply.code(400).send({ error: 'Latitud inválida. Debe ser un valor decimal entre -90 y 90' });
      }
    }
    if (longitudEstatica !== undefined) {
      const lng = parseFloat(longitudEstatica);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return reply.code(400).send({ error: 'Longitud inválida. Debe ser un valor decimal entre -180 y 180' });
      }
    }

    const perfil = await prisma.comercioPerfil.update({
      where: { usuarioId: request.user.id },
      data: {
        ...(nombreComercial && { nombreComercial }),
        ...(direccionFisica && { direccionFisica }),
        ...(ciudadZona && { ciudadZona }),
        ...(telefonoContacto && { telefonoContacto }),
        ...(latitudEstatica !== undefined && { latitudEstatica: parseFloat(latitudEstatica) }),
        ...(longitudEstatica !== undefined && { longitudEstatica: parseFloat(longitudEstatica) })
      }
    });

    reply.send({ mensaje: 'Perfil actualizado exitosamente', perfil });
  });

  // CU-05: Comercio - Publicar Pack Sorpresa
  fastify.post('/api/comercio/packs', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const { descripcion, precioOriginal, precioOferta, cantidadDisponible, horaLimiteRetiro } = request.body;

    if (!descripcion || !precioOriginal || !precioOferta || !cantidadDisponible || !horaLimiteRetiro) {
      return reply.code(400).send({ error: 'Todos los campos son obligatorios' });
    }

    const original = parseFloat(precioOriginal);
    const oferta = parseFloat(precioOferta);

    if (oferta > original * 0.5) {
      return reply.code(400).send({ error: 'El precio de oferta debe ser al menos 50% menor que el precio original' });
    }

    const limite = new Date(horaLimiteRetiro);
    if (limite <= new Date()) {
      return reply.code(400).send({ error: 'La hora límite de retiro debe ser posterior a la hora actual' });
    }

    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });

    const pack = await prisma.packSorpresa.create({
      data: {
        comercioId: perfil.id,
        descripcion,
        precioOriginal: original,
        precioOferta: oferta,
        cantidadDisponible: parseInt(cantidadDisponible),
        horaLimiteRetiro: limite
      }
    });

    // CU-06: Disparar notificaciones a clientes de la misma zona
    const clientesZona = await prisma.clientePerfil.findMany({
      where: { zonaPreferente: { equals: perfil.ciudadZona, mode: 'insensitive' } },
      include: { usuario: true }
    });

    if (clientesZona.length > 0) {
      await prisma.notificacion.createMany({
        data: clientesZona.map(cliente => ({
          usuarioId: cliente.usuarioId,
          titulo: `Nueva oferta en ${perfil.ciudadZona}`,
          mensaje: `${perfil.nombreComercial} publicó un pack sorpresa: ${descripcion} a Gs. ${oferta.toLocaleString()}`,
          packId: pack.id
        }))
      });
    }

    reply.code(201).send({ mensaje: 'Pack sorpresa publicado exitosamente', pack });
  });

  // Listar packs del comercio
  fastify.get('/api/comercio/packs', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });
    const packs = await prisma.packSorpresa.findMany({
      where: { comercioId: perfil.id },
      orderBy: { fechaPublicacion: 'desc' }
    });
    reply.send(packs);
  });

  // CU-10: Comercio - Digitar Código de Reserva y Entregar Pack
  fastify.post('/api/comercio/validar-reserva', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const { codigoReserva } = request.body;

    if (!codigoReserva) {
      return reply.code(400).send({ error: 'El código de reserva es obligatorio' });
    }

    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });

    const reserva = await prisma.reserva.findUnique({
      where: { codigoReserva: codigoReserva.toUpperCase() },
      include: { pack: true, cliente: { include: { usuario: true } } }
    });

    if (!reserva) {
      return reply.code(404).send({ error: 'Código de reserva inválido o inexistente' });
    }

    if (reserva.pack.comercioId !== perfil.id) {
      return reply.code(403).send({ error: 'Esta reserva no pertenece a su comercio' });
    }

    if (reserva.estadoReserva === 'COMPLETADA') {
      return reply.code(409).send({ error: 'Esta reserva ya fue reclamada anteriormente' });
    }

    if (reserva.estadoReserva === 'EXPIRADA' || reserva.estadoReserva === 'CANCELADA') {
      return reply.code(410).send({ error: 'Esta reserva ha expirado o fue cancelada' });
    }

    if (new Date() > reserva.pack.horaLimiteRetiro) {
      await prisma.reserva.update({
        where: { id: reserva.id },
        data: { estadoReserva: 'EXPIRADA' }
      });
      return reply.code(410).send({ error: 'Se sobrepasó la hora límite de retiro' });
    }

    reply.send({
      mensaje: 'Reserva válida',
      reserva: {
        codigo: reserva.codigoReserva,
        cliente: reserva.cliente.usuario.nombre,
        cantidad: reserva.cantidadReservada,
        monto: reserva.montoTotal,
        estado: reserva.estadoReserva,
        packDescripcion: reserva.pack.descripcion
      }
    });
  });

  // Confirmar entrega y pago presencial
  fastify.post('/api/comercio/confirmar-entrega', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const { codigoReserva, metodoPago } = request.body;

    const comisionRate = parseFloat(process.env.COMISION_PLATAFORMA || '0.10');

    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });

    const resultado = await prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { codigoReserva: codigoReserva.toUpperCase() },
        include: { pack: true }
      });

      if (!reserva || reserva.pack.comercioId !== perfil.id) {
        throw new Error('Reserva no encontrada');
      }
      if (reserva.estadoReserva !== 'PENDIENTE_RETIRO') {
        throw new Error('La reserva no está pendiente de retiro');
      }

      const reservaActualizada = await tx.reserva.update({
        where: { id: reserva.id },
        data: { estadoReserva: 'COMPLETADA' }
      });

      const montoVenta = Number(reserva.montoTotal);
      const comision = montoVenta * comisionRate;

      await tx.historialFinanciero.create({
        data: {
          reservaId: reserva.id,
          comercioId: perfil.id,
          montoVenta,
          montoComisionPlataforma: comision,
          metodoPagoPresencial: metodoPago || 'EFECTIVO'
        }
      });

      return reservaActualizada;
    });

    reply.send({ mensaje: 'Entrega confirmada y pago registrado exitosamente', reserva: resultado });
  });

  // CU-11: Comercio - Consultar Dashboard Analítico
  fastify.get('/api/comercio/dashboard', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });

    const historial = await prisma.historialFinanciero.findMany({
      where: { comercioId: perfil.id }
    });

    const reservasCompletadas = await prisma.reserva.count({
      where: {
        pack: { comercioId: perfil.id },
        estadoReserva: 'COMPLETADA'
      }
    });

    const reservasTotales = await prisma.reserva.count({
      where: { pack: { comercioId: perfil.id } }
    });

    const ingresosBrutos = historial.reduce((sum, h) => sum + Number(h.montoVenta), 0);
    const comisionesTotal = historial.reduce((sum, h) => sum + Number(h.montoComisionPlataforma), 0);
    const ingresosNetos = ingresosBrutos - comisionesTotal;
    // Estimación: cada pack ~ 0.8 kg de comida rescatada
    const kgRescatados = reservasCompletadas * 0.8;

    const historialMensual = {};
    historial.forEach(h => {
      const mes = h.fechaRegistro.toISOString().slice(0, 7);
      if (!historialMensual[mes]) historialMensual[mes] = { ingresos: 0, comisiones: 0, transacciones: 0 };
      historialMensual[mes].ingresos += Number(h.montoVenta);
      historialMensual[mes].comisiones += Number(h.montoComisionPlataforma);
      historialMensual[mes].transacciones += 1;
    });

    reply.send({
      resumen: {
        ingresosBrutos,
        comisionesTotal,
        ingresosNetos,
        kgRescatados,
        reservasCompletadas,
        reservasTotales,
        tasaCompletadas: reservasTotales > 0 ? ((reservasCompletadas / reservasTotales) * 100).toFixed(1) : 0
      },
      historialMensual
    });
  });

  // Listar reservas pendientes del comercio
  fastify.get('/api/comercio/reservas', { preHandler: authorize('COMERCIO') }, async (request, reply) => {
    const perfil = await prisma.comercioPerfil.findUnique({ where: { usuarioId: request.user.id } });
    const reservas = await prisma.reserva.findMany({
      where: { pack: { comercioId: perfil.id } },
      include: {
        pack: true,
        cliente: { include: { usuario: { select: { nombre: true } } } }
      },
      orderBy: { fechaReserva: 'desc' }
    });
    reply.send(reservas);
  });
}
