const clients = new Map();

export function registrarCliente(userId, socket) {
  clients.set(userId, socket);
  socket.on('close', () => clients.delete(userId));
}

export function notificarUsuario(userId, data) {
  const socket = clients.get(userId);
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
}

export function notificarUsuarios(userIds, data) {
  for (const id of userIds) {
    notificarUsuario(id, data);
  }
}
