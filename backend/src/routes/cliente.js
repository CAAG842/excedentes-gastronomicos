import prisma from '../config/database.js';
import { authorize } from '../middleware/auth.js';
import { generarCodigoReserva } from '../utils/codigoReserva.js';

export default async function clienteRoutes(fastify) {

  // CU-07: Cliente - Visualizar Catálogo de Ofertas
  fastify.get('/api/catalogo', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const { zona } = request.query;

    const where = {
      estadoPack: 'DISPONIBLE',
      cantidadDisponible: { gt: 0 },
      horaLimiteRetiro: { gt: new Date() }
    };

    if (zona) {
      where.comercio = { ciudadZona: { contains: zona, mode: 'insensitive' } };
    }

    const packs = await prisma.packSorpresa.findMany({
      where,
      include: {
        comercio: {
          select: {
            id: true,
            nombreComercial: true,
            direccionFisica: true,
            ciudadZona: true,
            latitudEstatica: true,
            longitudEstatica: true,
            telefonoContacto: true
          }
        }
      },
      orderBy: { fechaPublicacion: 'desc' }
    });

    reply.send(packs);
  });

  // Detalle de un pack
  fastify.get('/api/catalogo/:id', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const pack = await prisma.packSorpresa.findUnique({
      where: { id: parseInt(request.params.id) },
      include: {
        comercio: {
          select: {
            id: true,
            nombreComercial: true,
            direccionFisica: true,
            ciudadZona: true,
            latitudEstatica: true,
            longitudEstatica: true,
            telefonoContacto: true
          }
        }
      }
    });

    if (!pack) return reply.code(404).send({ error: 'Pack no encontrado' });
    reply.send(pack);
  });

  // CU-08 + CU-09: Cliente - Reservar Pack Sorpresa + Generar Comprobante
  fastify.post('/api/reservas', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const { packId, cantidad } = request.body;
    const cantidadInt = parseInt(cantidad) || 1;

    const resultado = await prisma.$transaction(async (tx) => {
      const pack = await tx.packSorpresa.findUnique({ where: { id: parseInt(packId) } });

      if (!pack) throw new Error('Pack no encontrado');
      if (pack.estadoPack !== 'DISPONIBLE') throw new Error('El pack ya no está disponible');
      if (pack.cantidadDisponible < cantidadInt) throw new Error('Stock insuficiente');
      if (new Date() > pack.horaLimiteRetiro) throw new Error('El horario de retiro ha expirado');

      const nuevoStock = pack.cantidadDisponible - cantidadInt;

      await tx.packSorpresa.update({
        where: { id: pack.id },
        data: {
          cantidadDisponible: nuevoStock,
          estadoPack: nuevoStock === 0 ? 'AGOTADO' : 'DISPONIBLE'
        }
      });

      let codigoReserva;
      let intentos = 0;
      while (intentos < 10) {
        codigoReserva = generarCodigoReserva();
        const existe = await tx.reserva.findUnique({ where: { codigoReserva } });
        if (!existe) break;
        intentos++;
      }

      const montoTotal = Number(pack.precioOferta) * cantidadInt;

      const reserva = await tx.reserva.create({
        data: {
          clienteId: request.user.perfilId,
          packId: pack.id,
          codigoReserva,
          cantidadReservada: cantidadInt,
          montoTotal
        },
        include: {
          pack: { include: { comercio: true } }
        }
      });

      return reserva;
    });

    reply.code(201).send({
      mensaje: 'Reserva realizada exitosamente',
      reserva: {
        codigoReserva: resultado.codigoReserva,
        comercio: resultado.pack.comercio.nombreComercial,
        direccion: resultado.pack.comercio.direccionFisica,
        descripcionPack: resultado.pack.descripcion,
        cantidad: resultado.cantidadReservada,
        montoTotal: resultado.montoTotal,
        horaLimiteRetiro: resultado.pack.horaLimiteRetiro,
        estado: resultado.estadoReserva
      }
    });
  });

  // Mis reservas
  fastify.get('/api/reservas', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const reservas = await prisma.reserva.findMany({
      where: { clienteId: request.user.perfilId },
      include: {
        pack: {
          include: {
            comercio: {
              select: { nombreComercial: true, direccionFisica: true, ciudadZona: true, latitudEstatica: true, longitudEstatica: true }
            }
          }
        }
      },
      orderBy: { fechaReserva: 'desc' }
    });
    reply.send(reservas);
  });

  // Notificaciones del cliente
  fastify.get('/api/notificaciones', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const notificaciones = await prisma.notificacion.findMany({
      where: { usuarioId: request.user.id },
      orderBy: { fechaCreacion: 'desc' },
      take: 50
    });
    reply.send(notificaciones);
  });

  // Marcar notificación como leída
  fastify.patch('/api/notificaciones/:id', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    await prisma.notificacion.update({
      where: { id: parseInt(request.params.id) },
      data: { leida: true }
    });
    reply.send({ mensaje: 'Notificación marcada como leída' });
  });

  // Perfil del cliente
  fastify.get('/api/cliente/perfil', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const perfil = await prisma.clientePerfil.findUnique({
      where: { usuarioId: request.user.id },
      include: { usuario: { select: { nombre: true, correo: true } } }
    });
    reply.send(perfil);
  });

  fastify.put('/api/cliente/perfil', { preHandler: authorize('CLIENTE') }, async (request, reply) => {
    const { telefono, zonaPreferente } = request.body;
    const perfil = await prisma.clientePerfil.update({
      where: { usuarioId: request.user.id },
      data: {
        ...(telefono && { telefono }),
        ...(zonaPreferente && { zonaPreferente })
      }
    });
    reply.send({ mensaje: 'Perfil actualizado', perfil });
  });
}
