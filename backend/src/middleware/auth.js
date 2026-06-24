export async function authenticate(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Token no válido o expirado' });
  }
}

export function authorize(...roles) {
  return async (request, reply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    if (!roles.includes(request.user.rol)) {
      reply.code(403).send({ error: 'No tiene permisos para acceder a este recurso' });
    }
  };
}
