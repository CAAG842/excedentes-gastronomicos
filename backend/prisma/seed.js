import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Limpiar todo en orden (respetando FK constraints)
  await prisma.notificacion.deleteMany();
  await prisma.logAuditoria.deleteMany();
  await prisma.historialFinanciero.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.packSorpresa.deleteMany();
  await prisma.clientePerfil.deleteMany();
  await prisma.comercioPerfil.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Base de datos limpiada');

  // ── Usuarios ──

  const adminHash = await bcrypt.hash('Admin123', 10);
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      correo: 'admin@excedentes.com',
      contrasenaHash: adminHash,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    }
  });

  const comercioHash = await bcrypt.hash('Comercio123', 10);
  const comercio1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      correo: 'panaderia@demo.com',
      contrasenaHash: comercioHash,
      rol: 'COMERCIO',
      estado: 'ACTIVO',
      comercioPerfil: {
        create: {
          nombreComercial: 'Panadería Don Juan',
          direccionFisica: 'Av. Mcal. López 1234, Asunción',
          ciudadZona: 'Centro',
          latitudEstatica: -25.2637,
          longitudEstatica: -57.5759,
          telefonoContacto: '0981-123456'
        }
      }
    },
    include: { comercioPerfil: true }
  });

  const comercio2 = await prisma.usuario.create({
    data: {
      nombre: 'Ana Martínez',
      correo: 'sushi@demo.com',
      contrasenaHash: comercioHash,
      rol: 'COMERCIO',
      estado: 'ACTIVO',
      comercioPerfil: {
        create: {
          nombreComercial: 'Sushi Express',
          direccionFisica: 'Av. España 456, Villa Morra',
          ciudadZona: 'Villa Morra',
          latitudEstatica: -25.2867,
          longitudEstatica: -57.5803,
          telefonoContacto: '0982-654321'
        }
      }
    },
    include: { comercioPerfil: true }
  });

  const clienteHash = await bcrypt.hash('Cliente123', 10);
  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'María González',
      correo: 'maria@demo.com',
      contrasenaHash: clienteHash,
      rol: 'CLIENTE',
      estado: 'ACTIVO',
      clientePerfil: {
        create: { telefono: '0971-654321', zonaPreferente: 'Centro' }
      }
    },
    include: { clientePerfil: true }
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'Carlos López',
      correo: 'carlos@demo.com',
      contrasenaHash: clienteHash,
      rol: 'CLIENTE',
      estado: 'ACTIVO',
      clientePerfil: {
        create: { telefono: '0983-111222', zonaPreferente: 'Villa Morra' }
      }
    },
    include: { clientePerfil: true }
  });

  // ── Packs ──

  const ahora = new Date();
  const en4horas = new Date(ahora.getTime() + 4 * 60 * 60 * 1000);
  const en6horas = new Date(ahora.getTime() + 6 * 60 * 60 * 1000);
  const ayer = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

  const pack1 = await prisma.packSorpresa.create({
    data: {
      comercioId: comercio1.comercioPerfil.id,
      descripcion: 'Pack de medialunas y facturas surtidas del día',
      precioOriginal: 35000, precioOferta: 15000,
      cantidadDisponible: 8, horaLimiteRetiro: en4horas
    }
  });

  const pack2 = await prisma.packSorpresa.create({
    data: {
      comercioId: comercio1.comercioPerfil.id,
      descripcion: 'Pack de pan artesanal y chipá',
      precioOriginal: 25000, precioOferta: 10000,
      cantidadDisponible: 5, horaLimiteRetiro: en6horas
    }
  });

  const pack3 = await prisma.packSorpresa.create({
    data: {
      comercioId: comercio2.comercioPerfil.id,
      descripcion: 'Combo sushi variado 20 piezas',
      precioOriginal: 80000, precioOferta: 35000,
      cantidadDisponible: 3, horaLimiteRetiro: en4horas
    }
  });

  const packExpirado = await prisma.packSorpresa.create({
    data: {
      comercioId: comercio1.comercioPerfil.id,
      descripcion: 'Pack empanadas (expirado)',
      precioOriginal: 40000, precioOferta: 18000,
      cantidadDisponible: 0, horaLimiteRetiro: ayer,
      estadoPack: 'EXPIRADO'
    }
  });

  // ── Reservas ──

  const reserva1 = await prisma.reserva.create({
    data: {
      clienteId: cliente1.clientePerfil.id,
      packId: pack1.id,
      codigoReserva: 'RE-1001',
      cantidadReservada: 2, montoTotal: 30000,
      estadoReserva: 'COMPLETADA'
    }
  });

  await prisma.historialFinanciero.create({
    data: {
      reservaId: reserva1.id,
      comercioId: comercio1.comercioPerfil.id,
      montoVenta: 30000, montoComisionPlataforma: 3000,
      metodoPagoPresencial: 'EFECTIVO'
    }
  });

  await prisma.reserva.create({
    data: {
      clienteId: cliente1.clientePerfil.id,
      packId: pack3.id,
      codigoReserva: 'RE-1002',
      cantidadReservada: 1, montoTotal: 35000,
      estadoReserva: 'PENDIENTE_RETIRO'
    }
  });

  const reserva3 = await prisma.reserva.create({
    data: {
      clienteId: cliente2.clientePerfil.id,
      packId: pack2.id,
      codigoReserva: 'RE-1003',
      cantidadReservada: 1, montoTotal: 10000,
      estadoReserva: 'COMPLETADA'
    }
  });

  await prisma.historialFinanciero.create({
    data: {
      reservaId: reserva3.id,
      comercioId: comercio1.comercioPerfil.id,
      montoVenta: 10000, montoComisionPlataforma: 1000,
      metodoPagoPresencial: 'TRANSFERENCIA'
    }
  });

  await prisma.reserva.create({
    data: {
      clienteId: cliente2.clientePerfil.id,
      packId: pack1.id,
      codigoReserva: 'RE-1004',
      cantidadReservada: 1, montoTotal: 15000,
      estadoReserva: 'CANCELADA'
    }
  });

  // ── Notificaciones ──

  await prisma.notificacion.createMany({
    data: [
      { usuarioId: cliente1.id, titulo: 'Nueva oferta en Centro', mensaje: 'Panadería Don Juan publicó un pack sorpresa: medialunas y facturas a Gs. 15.000', packId: pack1.id },
      { usuarioId: cliente1.id, titulo: 'Nueva oferta en Centro', mensaje: 'Panadería Don Juan publicó un pack de pan artesanal a Gs. 10.000', packId: pack2.id, leida: true },
      { usuarioId: cliente2.id, titulo: 'Nueva oferta en Villa Morra', mensaje: 'Sushi Express publicó un combo sushi 20 piezas a Gs. 35.000', packId: pack3.id },
    ]
  });

  // ── Log de auditoría ──

  await prisma.logAuditoria.createMany({
    data: [
      { usuarioActorId: admin.id, accionRealizada: 'APROBAR_COMERCIO', detalles: 'Cuenta de comercio aprobada: Juan Pérez (Panadería Don Juan)' },
      { usuarioActorId: admin.id, accionRealizada: 'APROBAR_COMERCIO', detalles: 'Cuenta de comercio aprobada: Ana Martínez (Sushi Express)' },
    ]
  });

  console.log('\nSeed ejecutado exitosamente');
  console.log('\n┌─────────────────────────────────────────────┐');
  console.log('│         Credenciales de prueba               │');
  console.log('├─────────────────────────────────────────────┤');
  console.log('│  Admin:    admin@excedentes.com / Admin123   │');
  console.log('│  Comercio: panaderia@demo.com / Comercio123  │');
  console.log('│  Comercio: sushi@demo.com / Comercio123      │');
  console.log('│  Cliente:  maria@demo.com / Cliente123       │');
  console.log('│  Cliente:  carlos@demo.com / Cliente123      │');
  console.log('└─────────────────────────────────────────────┘');
  console.log('\nDatos de demo:');
  console.log('  • 3 packs disponibles + 1 expirado');
  console.log('  • 4 reservas (2 completadas, 1 pendiente, 1 cancelada)');
  console.log('  • 3 notificaciones');
  console.log('  • 2 registros financieros');
  console.log('  • 2 logs de auditoría');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
