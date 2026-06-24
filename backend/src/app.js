import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import websocket from '@fastify/websocket';

import { authorize } from './middleware/auth.js';
import { expirarPacksVencidos } from './utils/expirarPacks.js';
import { registrarCliente } from './utils/wsClients.js';
import authRoutes from './routes/auth.js';
import comercioRoutes from './routes/comercio.js';
import clienteRoutes from './routes/cliente.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });
await fastify.register(jwt, { secret: process.env.JWT_SECRET });
await fastify.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } });
await fastify.register(rateLimit, {
  global: false
});
await fastify.register(websocket);

// WebSocket: clientes se conectan con su token para recibir notificaciones
fastify.get('/api/ws', { websocket: true }, async (socket, request) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const token = url.searchParams.get('token');
  if (!token) return socket.close();
  try {
    const decoded = fastify.jwt.verify(token);
    registrarCliente(decoded.id, socket);
  } catch {
    socket.close();
  }
});

// Uploads protegidos: solo admins pueden ver documentos
fastify.get('/api/uploads/:filename', { preHandler: authorize('ADMINISTRADOR') }, async (request, reply) => {
  const filename = path.basename(request.params.filename);
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    return reply.code(404).send({ error: 'Archivo no encontrado' });
  }
  const stream = fs.createReadStream(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
  reply.type(mimeTypes[ext] || 'application/octet-stream');
  return reply.send(stream);
});

await fastify.register(authRoutes);
await fastify.register(comercioRoutes);
await fastify.register(clienteRoutes);
await fastify.register(adminRoutes);

fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Servidor corriendo en http://localhost:${port}`);

    // Expirar packs vencidos cada 60 segundos
    expirarPacksVencidos();
    setInterval(expirarPacksVencidos, 60 * 1000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
