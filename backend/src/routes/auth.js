import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export default async function authRoutes(fastify) {

  // CU-01: Cliente - Registrarse
  fastify.post('/api/auth/registro/cliente', async (request, reply) => {
    const { nombre, correo, contrasena, telefono, zonaPreferente } = request.body;

    if (!nombre || !correo || !contrasena || !telefono || !zonaPreferente) {
      return reply.code(400).send({ error: 'Todos los campos son obligatorios' });
    }

    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) {
      return reply.code(409).send({ error: 'El correo electrónico ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: hash,
        rol: 'CLIENTE',
        estado: 'ACTIVO',
        clientePerfil: {
          create: { telefono, zonaPreferente }
        }
      },
      include: { clientePerfil: true }
    });

    reply.code(201).send({
      mensaje: 'Registro exitoso. Puede iniciar sesión.',
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
    });
  });

  // CU-02: Comercio Gastronómico - Registrarse (multipart con documento)
  fastify.post('/api/auth/registro/comercio', async (request, reply) => {
    const parts = request.parts();
    const fields = {};
    let documentoFilename = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        if (part.fieldname === 'documento') {
          const ext = path.extname(part.filename).toLowerCase();
          const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
          if (!allowed.includes(ext)) {
            return reply.code(400).send({ error: 'Formato de documento no permitido. Use PDF, JPG o PNG.' });
          }
          documentoFilename = `${randomUUID()}${ext}`;
          const filePath = path.join(uploadsDir, documentoFilename);
          const writeStream = fs.createWriteStream(filePath);
          await part.file.pipe(writeStream);
          await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
          });
        } else {
          await part.toBuffer();
        }
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    const { nombre, correo, contrasena, nombreComercial, direccionFisica, ciudadZona, telefonoContacto } = fields;

    if (!nombre || !correo || !contrasena || !nombreComercial || !direccionFisica || !ciudadZona || !telefonoContacto) {
      return reply.code(400).send({ error: 'Todos los campos son obligatorios' });
    }

    if (!documentoFilename) {
      return reply.code(400).send({ error: 'El documento de habilitación es obligatorio' });
    }

    const existente = await prisma.usuario.findUnique({ where: { correo } });
    if (existente) {
      return reply.code(409).send({ error: 'El correo electrónico ya está registrado' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        correo,
        contrasenaHash: hash,
        rol: 'COMERCIO',
        estado: 'PENDIENTE',
        comercioPerfil: {
          create: { nombreComercial, direccionFisica, ciudadZona, telefonoContacto, documentoHabilitacion: documentoFilename }
        }
      },
      include: { comercioPerfil: true }
    });

    reply.code(201).send({
      mensaje: 'Registro exitoso. Su cuenta está pendiente de aprobación por el administrador.',
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol, estado: usuario.estado }
    });
  });

  // CU-03: Usuario (General) - Iniciar Sesión
  fastify.post('/api/auth/login', async (request, reply) => {
    const { correo, contrasena } = request.body;

    if (!correo || !contrasena) {
      return reply.code(400).send({ error: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      include: { clientePerfil: true, comercioPerfil: true }
    });

    if (!usuario) {
      return reply.code(401).send({ error: 'Correo o contraseña no válidos' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) {
      return reply.code(401).send({ error: 'Correo o contraseña no válidos' });
    }

    if (usuario.estado === 'PENDIENTE') {
      return reply.code(403).send({ error: 'Su cuenta está pendiente de aprobación' });
    }
    if (usuario.estado === 'SUSPENDIDO') {
      return reply.code(403).send({ error: 'Su cuenta ha sido suspendida' });
    }

    const token = fastify.jwt.sign({
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
      perfilId: usuario.clientePerfil?.id || usuario.comercioPerfil?.id || null
    });

    reply.send({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        perfil: usuario.clientePerfil || usuario.comercioPerfil || null
      }
    });
  });
}
