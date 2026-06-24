import prisma from '../config/database.js';
import { authorize } from '../middleware/auth.js';

export default async function adminRoutes(fastify) {

  // CU-12: Administrador - Gestionar Usuarios y Auditoría
  fastify.get('/api/admin/usuarios', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const { estado, rol } = request.query;
    const where = {};
    if (estado) where.estado = estado;
    if (rol) where.rol = rol;

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true, nombre: true, correo: true, rol: true, estado: true, fechaRegistro: true,
        comercioPerfil: true,
        clientePerfil: true
      },
      orderBy: { fechaRegistro: 'desc' }
    });
    reply.send(usuarios);
  });

  // Aprobar comercio
  fastify.patch('/api/admin/usuarios/:id/aprobar', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const userId = parseInt(request.params.id);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: userId },
        data: { estado: 'ACTIVO' }
      });

      await tx.logAuditoria.create({
        data: {
          usuarioActorId: request.user.id,
          accionRealizada: 'APROBAR_COMERCIO',
          detalles: `Cuenta de comercio aprobada: ${usuario.nombre} (ID: ${usuario.id})`
        }
      });

      return usuario;
    });

    reply.send({ mensaje: 'Comercio aprobado exitosamente', usuario: resultado });
  });

  // Rechazar comercio
  fastify.patch('/api/admin/usuarios/:id/rechazar', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const userId = parseInt(request.params.id);
    const { motivo } = request.body;

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: userId },
        data: { estado: 'SUSPENDIDO' }
      });

      await tx.logAuditoria.create({
        data: {
          usuarioActorId: request.user.id,
          accionRealizada: 'RECHAZAR_COMERCIO',
          detalles: `Cuenta rechazada: ${usuario.nombre} (ID: ${usuario.id}). Motivo: ${motivo || 'No especificado'}`
        }
      });

      return usuario;
    });

    reply.send({ mensaje: 'Comercio rechazado', usuario: resultado });
  });

  // Suspender cuenta
  fastify.patch('/api/admin/usuarios/:id/suspender', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const userId = parseInt(request.params.id);
    const { motivo } = request.body;

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.update({
        where: { id: userId },
        data: { estado: 'SUSPENDIDO' }
      });

      await tx.logAuditoria.create({
        data: {
          usuarioActorId: request.user.id,
          accionRealizada: 'SUSPENDER_CUENTA',
          detalles: `Cuenta suspendida: ${usuario.nombre} (ID: ${usuario.id}). Motivo: ${motivo || 'Incumplimiento de políticas'}`
        }
      });

      return usuario;
    });

    reply.send({ mensaje: 'Cuenta suspendida', usuario: resultado });
  });

  // Reactivar cuenta suspendida
  fastify.patch('/api/admin/usuarios/:id/reactivar', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const userId = parseInt(request.params.id);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({ where: { id: userId } });

      if (!usuario || usuario.estado !== 'SUSPENDIDO') {
        throw new Error('Solo se pueden reactivar cuentas suspendidas');
      }

      const actualizado = await tx.usuario.update({
        where: { id: userId },
        data: { estado: 'ACTIVO' }
      });

      await tx.logAuditoria.create({
        data: {
          usuarioActorId: request.user.id,
          accionRealizada: 'REACTIVAR_CUENTA',
          detalles: `Cuenta reactivada: ${actualizado.nombre} (ID: ${actualizado.id})`
        }
      });

      return actualizado;
    });

    reply.send({ mensaje: 'Cuenta reactivada exitosamente', usuario: resultado });
  });

  // Log de auditoría
  fastify.get('/api/admin/auditoria', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const logs = await prisma.logAuditoria.findMany({
      include: {
        usuarioActor: { select: { nombre: true, correo: true, rol: true } }
      },
      orderBy: { fechaHora: 'desc' },
      take: 100
    });
    reply.send(logs);
  });

  // Dashboard admin global
  fastify.get('/api/admin/dashboard', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
    const [totalUsuarios, totalComercios, totalClientes, comerciosPendientes, totalPacks, totalReservas, reservasCompletadas, historial] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({ where: { rol: 'COMERCIO' } }),
      prisma.usuario.count({ where: { rol: 'CLIENTE' } }),
      prisma.usuario.count({ where: { rol: 'COMERCIO', estado: 'PENDIENTE' } }),
      prisma.packSorpresa.count(),
      prisma.reserva.count(),
      prisma.reserva.count({ where: { estadoReserva: 'COMPLETADA' } }),
      prisma.historialFinanciero.findMany()
    ]);

    const comisionesTotal = historial.reduce((sum, h) => sum + Number(h.montoComisionPlataforma), 0);
    const ventasTotal = historial.reduce((sum, h) => sum + Number(h.montoVenta), 0);

    reply.send({
      totalUsuarios,
      totalComercios,
      totalClientes,
      comerciosPendientes,
      totalPacks,
      totalReservas,
      reservasCompletadas,
      comisionesTotal,
      ventasTotal,
      kgRescatados: reservasCompletadas * 0.8
    });
  });
}
