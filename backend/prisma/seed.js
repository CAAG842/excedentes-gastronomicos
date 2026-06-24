import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear administrador por defecto
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { correo: 'admin@excedentes.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      correo: 'admin@excedentes.com',
      contrasenaHash: adminHash,
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    }
  });

  // Crear comercio de prueba
  const comercioHash = await bcrypt.hash('comercio123', 10);
  await prisma.usuario.upsert({
    where: { correo: 'panaderia@demo.com' },
    update: {},
    create: {
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
    }
  });

  // Crear cliente de prueba
  const clienteHash = await bcrypt.hash('cliente123', 10);
  await prisma.usuario.upsert({
    where: { correo: 'maria@demo.com' },
    update: {},
    create: {
      nombre: 'María González',
      correo: 'maria@demo.com',
      contrasenaHash: clienteHash,
      rol: 'CLIENTE',
      estado: 'ACTIVO',
      clientePerfil: {
        create: {
          telefono: '0971-654321',
          zonaPreferente: 'Centro'
        }
      }
    }
  });

  console.log('Seed ejecutado exitosamente');
  console.log('Credenciales de prueba:');
  console.log('  Admin: admin@excedentes.com / admin123');
  console.log('  Comercio: panaderia@demo.com / comercio123');
  console.log('  Cliente: maria@demo.com / cliente123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
