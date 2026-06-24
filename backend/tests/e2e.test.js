/**
 * Suite de Pruebas E2E — GastroRescue
 *
 * Ejecutar: node tests/e2e.test.js
 * Requiere: backend corriendo en http://localhost:3000
 * Requiere: seed ejecutado (admin@excedentes.com, panaderia@demo.com, maria@demo.com)
 *
 * Cubre los 3 roles: Cliente, Comercio, Administrador
 */

const BASE = 'http://localhost:3000/api';
let passed = 0;
let failed = 0;
const failures = [];

// ─── Utilidades ───

async function req(method, path, body, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };

  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function test(nombre, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${nombre}`);
  } catch (err) {
    failed++;
    failures.push({ nombre, error: err.message });
    console.log(`  ✗ ${nombre} → ${err.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

// ─── Tokens ───
let tokenAdmin, tokenComercio, tokenCliente;
let comercioNuevoId, packId, codigoReserva, reservaId, clienteNuevoId;

// ══════════════════════════════════════════════
//  MÓDULO 1: HEALTH CHECK
// ══════════════════════════════════════════════

async function healthCheck() {
  console.log('\n🔹 HEALTH CHECK');
  await test('GET /health responde ok', async () => {
    const { status, data } = await req('GET', '/health');
    assert(status === 200, `Status ${status}`);
    assert(data.status === 'ok', 'Status no es ok');
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 2: AUTENTICACIÓN Y REGISTRO
// ══════════════════════════════════════════════

async function autenticacion() {
  console.log('\n🔹 AUTENTICACIÓN');

  // --- Login válido ---
  await test('Login admin exitoso', async () => {
    const { status, data } = await req('POST', '/auth/login', { correo: 'admin@excedentes.com', contrasena: 'admin123' });
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.token, 'Sin token');
    assert(data.usuario.rol === 'ADMINISTRADOR', 'Rol incorrecto');
    tokenAdmin = data.token;
  });

  await test('Login comercio existente exitoso', async () => {
    const { status, data } = await req('POST', '/auth/login', { correo: 'panaderia@demo.com', contrasena: 'comercio123' });
    assert(status === 200, `Status ${status}: ${data.error}`);
    tokenComercio = data.token;
  });

  await test('Login cliente existente exitoso', async () => {
    const { status, data } = await req('POST', '/auth/login', { correo: 'maria@demo.com', contrasena: 'cliente123' });
    assert(status === 200, `Status ${status}: ${data.error}`);
    tokenCliente = data.token;
  });

  // --- Login inválido ---
  await test('Login con contraseña incorrecta → 401', async () => {
    const { status } = await req('POST', '/auth/login', { correo: 'admin@excedentes.com', contrasena: 'wrongpass' });
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });

  await test('Login con correo inexistente → 401', async () => {
    const { status } = await req('POST', '/auth/login', { correo: 'noexiste@x.com', contrasena: '12345678' });
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });

  await test('Login sin campos → 400', async () => {
    const { status } = await req('POST', '/auth/login', {});
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  // --- Registro cliente ---
  const uid = Date.now();
  await test('Registro cliente exitoso', async () => {
    const { status, data } = await req('POST', '/auth/registro/cliente', {
      nombre: `Test Cliente ${uid}`, correo: `testcliente${uid}@test.com`,
      contrasena: 'TestPass1', telefono: '0981-000000', zonaPreferente: 'Centro'
    });
    assert(status === 201, `Status ${status}: ${data.error}`);
    assert(data.usuario.rol === 'CLIENTE', 'Rol incorrecto');
  });

  await test('Registro cliente duplicado → 409', async () => {
    const { status } = await req('POST', '/auth/registro/cliente', {
      nombre: 'Dup', correo: `testcliente${uid}@test.com`,
      contrasena: 'TestPass1', telefono: '0981', zonaPreferente: 'Centro'
    });
    assert(status === 409, `Esperaba 409, obtuvo ${status}`);
  });

  // --- Validación contraseña ---
  await test('Registro con contraseña débil → 400', async () => {
    const { status, data } = await req('POST', '/auth/registro/cliente', {
      nombre: 'Weak', correo: `weak${uid}@test.com`,
      contrasena: '123', telefono: '0981', zonaPreferente: 'Centro'
    });
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
    assert(data.error.includes('8 caracteres'), `Error inesperado: ${data.error}`);
  });

  await test('Registro sin mayúscula → 400', async () => {
    const { status, data } = await req('POST', '/auth/registro/cliente', {
      nombre: 'NoUpper', correo: `noupper${uid}@test.com`,
      contrasena: 'testpass1', telefono: '0981', zonaPreferente: 'Centro'
    });
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
    assert(data.error.includes('mayúscula'), `Error inesperado: ${data.error}`);
  });

  // --- Campos faltantes ---
  await test('Registro sin campos → 400', async () => {
    const { status } = await req('POST', '/auth/registro/cliente', { nombre: 'Solo Nombre' });
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 3: FLUJO COMERCIO
// ══════════════════════════════════════════════

async function flujoComercio() {
  console.log('\n🔹 COMERCIO — Perfil');

  await test('Obtener perfil comercio', async () => {
    const { status, data } = await req('GET', '/comercio/perfil', undefined, tokenComercio);
    assert(status === 200, `Status ${status}`);
    assert(data.nombreComercial, 'Sin nombre comercial');
  });

  await test('Actualizar perfil comercio', async () => {
    const { status, data } = await req('PUT', '/comercio/perfil', { telefonoContacto: '0981-999999' }, tokenComercio);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.mensaje, 'Sin mensaje');
  });

  await test('Latitud inválida → 400', async () => {
    const { status } = await req('PUT', '/comercio/perfil', { latitudEstatica: 999 }, tokenComercio);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  console.log('\n🔹 COMERCIO — Packs');

  const futuro = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

  await test('Publicar pack exitoso', async () => {
    const { status, data } = await req('POST', '/comercio/packs', {
      descripcion: 'Pack QA Test', precioOriginal: 50000,
      precioOferta: 20000, cantidadDisponible: 5, horaLimiteRetiro: futuro
    }, tokenComercio);
    assert(status === 201, `Status ${status}: ${data.error}`);
    assert(data.pack.id, 'Sin ID de pack');
    packId = data.pack.id;
  });

  await test('Publicar pack con oferta > 50% → 400', async () => {
    const { status } = await req('POST', '/comercio/packs', {
      descripcion: 'Pack Caro', precioOriginal: 50000,
      precioOferta: 40000, cantidadDisponible: 1, horaLimiteRetiro: futuro
    }, tokenComercio);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Publicar pack con hora pasada → 400', async () => {
    const { status } = await req('POST', '/comercio/packs', {
      descripcion: 'Pack Viejo', precioOriginal: 50000,
      precioOferta: 20000, cantidadDisponible: 1, horaLimiteRetiro: '2020-01-01T00:00:00Z'
    }, tokenComercio);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Publicar pack sin campos → 400', async () => {
    const { status } = await req('POST', '/comercio/packs', { descripcion: 'Solo desc' }, tokenComercio);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Listar packs del comercio', async () => {
    const { status, data } = await req('GET', '/comercio/packs', undefined, tokenComercio);
    assert(status === 200, `Status ${status}`);
    assert(Array.isArray(data), 'No es array');
    assert(data.length > 0, 'Sin packs');
  });

  await test('Editar pack disponible', async () => {
    const { status, data } = await req('PUT', `/comercio/packs/${packId}`, { descripcion: 'Pack QA Editado' }, tokenComercio);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.pack.descripcion === 'Pack QA Editado', 'Descripción no actualizada');
  });

  await test('Editar pack ajeno → 404', async () => {
    const { status } = await req('PUT', '/comercio/packs/999999', { descripcion: 'Hack' }, tokenComercio);
    assert(status === 404, `Esperaba 404, obtuvo ${status}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 4: FLUJO CLIENTE
// ══════════════════════════════════════════════

async function flujoCliente() {
  console.log('\n🔹 CLIENTE — Catálogo');

  await test('Ver catálogo', async () => {
    const { status, data } = await req('GET', '/catalogo', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(Array.isArray(data), 'No es array');
  });

  await test('Filtrar catálogo por zona', async () => {
    const { status, data } = await req('GET', '/catalogo?zona=Centro', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(Array.isArray(data), 'No es array');
  });

  await test('Buscar en catálogo por texto', async () => {
    const { status, data } = await req('GET', '/catalogo?busqueda=QA', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(data.some(p => p.descripcion.includes('QA')), 'Búsqueda no encontró el pack');
  });

  await test('Catálogo sin token → 401', async () => {
    const { status } = await req('GET', '/catalogo');
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });

  console.log('\n🔹 CLIENTE — Reservas');

  await test('Reservar pack exitosamente', async () => {
    const { status, data } = await req('POST', '/reservas', { packId, cantidad: 1 }, tokenCliente);
    assert(status === 201, `Status ${status}: ${data.error}`);
    assert(data.reserva.codigoReserva, 'Sin código');
    codigoReserva = data.reserva.codigoReserva;
  });

  await test('Reservar pack inexistente → error', async () => {
    const { status } = await req('POST', '/reservas', { packId: 999999, cantidad: 1 }, tokenCliente);
    assert(status >= 400, `Esperaba error, obtuvo ${status}`);
  });

  await test('Listar mis reservas', async () => {
    const { status, data } = await req('GET', '/reservas', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(data.length > 0, 'Sin reservas');
    reservaId = data[0].id;
  });

  console.log('\n🔹 CLIENTE — Perfil');

  await test('Obtener perfil cliente', async () => {
    const { status, data } = await req('GET', '/cliente/perfil', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(data.telefono, 'Sin teléfono');
  });

  await test('Actualizar perfil cliente', async () => {
    const { status, data } = await req('PUT', '/cliente/perfil', { telefono: '0971-111111' }, tokenCliente);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.mensaje, 'Sin mensaje');
  });

  console.log('\n🔹 CLIENTE — Notificaciones');

  await test('Listar notificaciones', async () => {
    const { status, data } = await req('GET', '/notificaciones', undefined, tokenCliente);
    assert(status === 200, `Status ${status}`);
    assert(Array.isArray(data), 'No es array');
  });

  console.log('\n🔹 CLIENTE — Cambiar contraseña');

  await test('Cambiar contraseña con actual incorrecta → 400', async () => {
    const { status } = await req('POST', '/auth/cambiar-contrasena', {
      contrasenaActual: 'wrongOld', contrasenaNueva: 'NewPass1'
    }, tokenCliente);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Cambiar contraseña con nueva débil → 400', async () => {
    const { status } = await req('POST', '/auth/cambiar-contrasena', {
      contrasenaActual: 'cliente123', contrasenaNueva: '123'
    }, tokenCliente);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Cambiar contraseña sin token → 401', async () => {
    const { status } = await req('POST', '/auth/cambiar-contrasena', {
      contrasenaActual: 'x', contrasenaNueva: 'NewPass1'
    });
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 5: FLUJO COMERCIO — Validación y Entrega
// ══════════════════════════════════════════════

async function flujoEntrega() {
  console.log('\n🔹 COMERCIO — Validación y Entrega');

  await test('Validar código de reserva', async () => {
    const { status, data } = await req('POST', '/comercio/validar-reserva', { codigoReserva }, tokenComercio);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.reserva.codigo === codigoReserva, 'Código no coincide');
  });

  await test('Validar código inexistente → 404', async () => {
    const { status } = await req('POST', '/comercio/validar-reserva', { codigoReserva: 'RE-0000' }, tokenComercio);
    assert(status === 404, `Esperaba 404, obtuvo ${status}`);
  });

  await test('Validar sin código → 400', async () => {
    const { status } = await req('POST', '/comercio/validar-reserva', {}, tokenComercio);
    assert(status === 400, `Esperaba 400, obtuvo ${status}`);
  });

  await test('Confirmar entrega exitosa', async () => {
    const { status, data } = await req('POST', '/comercio/confirmar-entrega', {
      codigoReserva, metodoPago: 'EFECTIVO'
    }, tokenComercio);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.reserva.estadoReserva === 'COMPLETADA', 'No se completó');
  });

  await test('Confirmar entrega de reserva ya completada → error', async () => {
    const { status } = await req('POST', '/comercio/confirmar-entrega', {
      codigoReserva, metodoPago: 'EFECTIVO'
    }, tokenComercio);
    assert(status >= 400, `Esperaba error, obtuvo ${status}`);
  });

  await test('Dashboard comercio carga', async () => {
    const { status, data } = await req('GET', '/comercio/dashboard', undefined, tokenComercio);
    assert(status === 200, `Status ${status}`);
    assert(data.resumen, 'Sin resumen');
    assert(data.resumen.reservasCompletadas >= 1, 'Sin completadas');
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 6: FLUJO CLIENTE — Cancelar reserva
// ══════════════════════════════════════════════

async function flujoCancelacion() {
  console.log('\n🔹 CLIENTE — Cancelar reserva');

  // Crear nueva reserva para cancelar
  const futuro = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
  await req('POST', '/comercio/packs', {
    descripcion: 'Pack para cancelar', precioOriginal: 30000,
    precioOferta: 10000, cantidadDisponible: 3, horaLimiteRetiro: futuro
  }, tokenComercio);

  const catalogo = await req('GET', '/catalogo?busqueda=cancelar', undefined, tokenCliente);
  const packCancelar = catalogo.data[0];

  const resReserva = await req('POST', '/reservas', { packId: packCancelar.id, cantidad: 1 }, tokenCliente);
  const nuevaReservaId = (await req('GET', '/reservas', undefined, tokenCliente)).data[0].id;

  await test('Cancelar reserva pendiente', async () => {
    const { status, data } = await req('PATCH', `/reservas/${nuevaReservaId}/cancelar`, undefined, tokenCliente);
    assert(status === 200, `Status ${status}: ${data.error}`);
    assert(data.reserva.estadoReserva === 'CANCELADA', 'No se canceló');
  });

  await test('Cancelar reserva ya cancelada → error', async () => {
    const { status } = await req('PATCH', `/reservas/${nuevaReservaId}/cancelar`, undefined, tokenCliente);
    assert(status >= 400, `Esperaba error, obtuvo ${status}`);
  });

  await test('Stock se restauró tras cancelación', async () => {
    const catalogo2 = await req('GET', `/catalogo?busqueda=cancelar`, undefined, tokenCliente);
    const packActualizado = catalogo2.data.find(p => p.id === packCancelar.id);
    assert(packActualizado, 'Pack no aparece en catálogo');
    assert(packActualizado.cantidadDisponible === 3, `Stock esperado 3, obtuvo ${packActualizado.cantidadDisponible}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 7: FLUJO ADMINISTRADOR
// ══════════════════════════════════════════════

async function flujoAdmin() {
  console.log('\n🔹 ADMIN — Gestión de Usuarios');

  await test('Listar usuarios paginado', async () => {
    const { status, data } = await req('GET', '/admin/usuarios?pagina=1', undefined, tokenAdmin);
    assert(status === 200, `Status ${status}`);
    assert(data.datos, 'Sin datos');
    assert(data.totalPaginas >= 1, 'Sin paginación');
  });

  await test('Filtrar usuarios por estado ACTIVO', async () => {
    const { status, data } = await req('GET', '/admin/usuarios?estado=ACTIVO', undefined, tokenAdmin);
    assert(status === 200, `Status ${status}`);
    assert(data.datos.every(u => u.estado === 'ACTIVO'), 'Filtro no funciona');
  });

  // Crear comercio nuevo para probar ciclo completo
  const uid2 = Date.now();
  const formData = new FormData();
  formData.append('nombre', `Comercio QA ${uid2}`);
  formData.append('correo', `comercioqa${uid2}@test.com`);
  formData.append('contrasena', 'TestPass1');
  formData.append('nombreComercial', 'Restaurante QA');
  formData.append('direccionFisica', 'Calle Test 123');
  formData.append('ciudadZona', 'Centro');
  formData.append('telefonoContacto', '0981-000001');
  formData.append('documento', new Blob(['test doc'], { type: 'application/pdf' }), 'test.pdf');

  const regRes = await req('POST', '/auth/registro/comercio', formData);

  await test('Registro comercio queda PENDIENTE', async () => {
    assert(regRes.status === 201, `Status ${regRes.status}: ${regRes.data.error}`);
    assert(regRes.data.usuario.estado === 'PENDIENTE', 'No quedó pendiente');
    comercioNuevoId = regRes.data.usuario.id;
  });

  await test('Comercio PENDIENTE no puede loguearse', async () => {
    const { status } = await req('POST', '/auth/login', { correo: `comercioqa${uid2}@test.com`, contrasena: 'TestPass1' });
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Aprobar comercio', async () => {
    const { status, data } = await req('PATCH', `/admin/usuarios/${comercioNuevoId}/aprobar`, undefined, tokenAdmin);
    assert(status === 200, `Status ${status}: ${data.error}`);
  });

  await test('Comercio aprobado puede loguearse', async () => {
    const { status, data } = await req('POST', '/auth/login', { correo: `comercioqa${uid2}@test.com`, contrasena: 'TestPass1' });
    assert(status === 200, `Status ${status}: ${data.error}`);
  });

  await test('Suspender usuario', async () => {
    const { status } = await req('PATCH', `/admin/usuarios/${comercioNuevoId}/suspender`, { motivo: 'Test QA' }, tokenAdmin);
    assert(status === 200, `Status ${status}`);
  });

  await test('Usuario suspendido no puede loguearse', async () => {
    const { status } = await req('POST', '/auth/login', { correo: `comercioqa${uid2}@test.com`, contrasena: 'TestPass1' });
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Reactivar usuario', async () => {
    const { status } = await req('PATCH', `/admin/usuarios/${comercioNuevoId}/reactivar`, undefined, tokenAdmin);
    assert(status === 200, `Status ${status}`);
  });

  await test('Usuario reactivado puede loguearse', async () => {
    const { status } = await req('POST', '/auth/login', { correo: `comercioqa${uid2}@test.com`, contrasena: 'TestPass1' });
    assert(status === 200, `Status ${status}`);
  });

  console.log('\n🔹 ADMIN — Auditoría');

  await test('Ver log de auditoría paginado', async () => {
    const { status, data } = await req('GET', '/admin/auditoria?pagina=1', undefined, tokenAdmin);
    assert(status === 200, `Status ${status}`);
    assert(data.datos.length > 0, 'Sin logs');
    assert(data.datos[0].accionRealizada, 'Sin acción');
  });

  console.log('\n🔹 ADMIN — Dashboard');

  await test('Dashboard admin con gráficos', async () => {
    const { status, data } = await req('GET', '/admin/dashboard', undefined, tokenAdmin);
    assert(status === 200, `Status ${status}`);
    assert(data.totalUsuarios > 0, 'Sin usuarios');
    assert(data.ventasMensuales !== undefined, 'Sin ventas mensuales');
    assert(data.kgRescatados >= 0, 'Sin kg');
  });

  console.log('\n🔹 ADMIN — Uploads protegidos');

  await test('Uploads sin token → 401', async () => {
    const { status } = await req('GET', '/uploads/test.pdf');
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });

  await test('Uploads con token cliente → 403', async () => {
    const { status } = await req('GET', '/uploads/test.pdf', undefined, tokenCliente);
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 8: SEGURIDAD
// ══════════════════════════════════════════════

async function seguridad() {
  console.log('\n🔹 SEGURIDAD');

  await test('Cliente no puede acceder a rutas admin', async () => {
    const { status } = await req('GET', '/admin/usuarios', undefined, tokenCliente);
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Cliente no puede acceder a rutas comercio', async () => {
    const { status } = await req('GET', '/comercio/packs', undefined, tokenCliente);
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Comercio no puede acceder a rutas admin', async () => {
    const { status } = await req('GET', '/admin/usuarios', undefined, tokenComercio);
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Comercio no puede acceder a rutas cliente', async () => {
    const { status } = await req('GET', '/catalogo', undefined, tokenComercio);
    assert(status === 403, `Esperaba 403, obtuvo ${status}`);
  });

  await test('Token inválido → 401', async () => {
    const { status } = await req('GET', '/catalogo', undefined, 'token.invalido.fake');
    assert(status === 401, `Esperaba 401, obtuvo ${status}`);
  });

  await test('Eliminar pack ajeno → 404', async () => {
    const { status } = await req('DELETE', '/comercio/packs/999999', undefined, tokenComercio);
    assert(status === 404, `Esperaba 404, obtuvo ${status}`);
  });

  await test('Cancelar reserva ajena → error', async () => {
    const { status } = await req('PATCH', '/reservas/999999/cancelar', undefined, tokenCliente);
    assert(status >= 400, `Esperaba error, obtuvo ${status}`);
  });
}

// ══════════════════════════════════════════════
//  MÓDULO 9: LIMPIEZA — Eliminar pack de test
// ══════════════════════════════════════════════

async function limpieza() {
  console.log('\n🔹 LIMPIEZA');

  await test('No se puede eliminar pack con reservas completadas (FK constraint)', async () => {
    const packs = await req('GET', '/comercio/packs', undefined, tokenComercio);
    const packTest = packs.data.find(p => p.descripcion === 'Pack QA Editado');
    if (packTest) {
      const { status } = await req('DELETE', `/comercio/packs/${packTest.id}`, undefined, tokenComercio);
      assert(status >= 400, `Esperaba error por FK, obtuvo ${status}`);
    } else {
      assert(true, 'Pack ya no existe');
    }
  });
}

// ══════════════════════════════════════════════
//  RUNNER
// ══════════════════════════════════════════════

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log(' GastroRescue — Suite E2E QA');
  console.log(' Backend: ' + BASE);
  console.log('═══════════════════════════════════════════');

  await healthCheck();
  await autenticacion();
  await flujoComercio();
  await flujoCliente();
  await flujoEntrega();
  await flujoCancelacion();
  await flujoAdmin();
  await seguridad();
  await limpieza();

  console.log('\n═══════════════════════════════════════════');
  console.log(` RESULTADOS: ${passed} pasaron, ${failed} fallaron de ${passed + failed} total`);
  console.log('═══════════════════════════════════════════');

  if (failures.length > 0) {
    console.log('\n🔴 FALLOS:');
    failures.forEach(f => console.log(`  • ${f.nombre}: ${f.error}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

run();
