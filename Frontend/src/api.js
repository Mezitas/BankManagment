// src/api.js
// Módulo centralizado para consumir la API del backend (Oracle)
// Reemplaza la lógica del JSON simulado por llamadas reales al servidor Express

const BASE_URL = 'http://192.168.20.37:3001/api'; // Ajusta si tu frontend corre en otro host/puerto

// Función auxiliar para manejar respuestas y errores
async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.mensaje || data.message || 'Error en la petición');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

// ---------- AUTENTICACIÓN ----------

/**
 * Inicia sesión con username y password.
 * Retorna los datos del usuario, incluyendo información del rol.
 */
export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return handleResponse(res);
}

// ---------- CLIENTES ----------

/**
 * Inserta un nuevo cliente (usado por empleados o admin).
 * Espera: { username, password, nombre, documento, telefono, email }
 */
export async function crearCliente(datos) {
  const res = await fetch(`${BASE_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

/**
 * Actualiza teléfono y email de un cliente.
 * Espera: { cli_id, telefono, email }
 */
export async function actualizarCliente(datos) {
  const res = await fetch(`${BASE_URL}/clientes/${datos.cli_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

/**
 * Desactiva un cliente (baja lógica).
 * Espera: { cli_id }
 */
export async function desactivarCliente(cli_id) {
  const res = await fetch(`${BASE_URL}/clientes/${cli_id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

/**
 * Obtiene los datos completos de un cliente por su ID.
 */
export async function consultarCliente(cli_id) {
  const res = await fetch(`${BASE_URL}/clientes/${cli_id}`);
  return handleResponse(res);
}

/**
 * Lista todos los clientes activos.
 */
export async function listarClientesActivos() {
  const res = await fetch(`${BASE_URL}/clientes`);
  return handleResponse(res);
}

// ---------- CUENTAS ----------

/**
 * Crea una nueva cuenta bancaria.
 * Espera: { tipo, saldo, sucursal, cliente }
 */
export async function crearCuenta(datos) {
  const res = await fetch(`${BASE_URL}/cuentas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

/**
 * Bloquea una cuenta.
 * Espera: cue_id en la URL
 */
export async function bloquearCuenta(cue_id) {
  const res = await fetch(`${BASE_URL}/cuentas/${cue_id}/bloquear`, {
    method: 'PUT'
  });
  return handleResponse(res);
}

/**
 * Consulta el saldo y estado de una cuenta.
 */
export async function consultarSaldo(cue_id) {
  const res = await fetch(`${BASE_URL}/cuentas/${cue_id}/saldo`);
  return handleResponse(res);
}

/**
 * Obtiene el historial de transacciones de una cuenta.
 */
export async function historialCuenta(cue_id) {
  const res = await fetch(`${BASE_URL}/cuentas/${cue_id}/historial`);
  return handleResponse(res);
}

// ---------- TRANSACCIONES ----------

/**
 * Realiza una consignación en una cuenta.
 * Espera: { cuenta, monto }
 */
export async function consignar(datos) {
  const res = await fetch(`${BASE_URL}/transacciones/consignar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

/**
 * Realiza un retiro de una cuenta.
 * Espera: { cuenta, monto }
 */
export async function retirar(datos) {
  const res = await fetch(`${BASE_URL}/transacciones/retirar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

/**
 * Realiza una transferencia entre cuentas.
 * Espera: { origen, destino, monto }
 */
export async function transferir(datos) {
  const res = await fetch(`${BASE_URL}/transacciones/transferir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

// ---------- USUARIOS (ADMIN) ----------

/**
 * Lista todos los usuarios (para panel de administración).
 */
export async function listarUsuarios() {
  const res = await fetch(`${BASE_URL}/usuarios`);
  return handleResponse(res);
}

/**
 * Cambia el estado de un usuario (activar/desactivar).
 * Espera: { usu_id, estado }
 */
export async function cambiarEstadoUsuario(usu_id, estado) {
  const res = await fetch(`${BASE_URL}/usuarios/${usu_id}/estado`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado })
  });
  return handleResponse(res);
}

// Listar todas las cuentas (admin)
export async function listarCuentas() {
  const res = await fetch(`${BASE_URL}/cuentas`);
  return handleResponse(res);
}

/**
 * Crea un nuevo usuario (con su respectivo rol: CLIENTE, EMPLEADO, ADMINISTRADOR).
 * Espera: { username, password, rol, nombre, documento?, telefono?, email?, emp_rol?, suc_id? }
 */
export async function crearUsuario(datos) {
  const res = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

// ---------- SUCURSALES ----------

/**
 * Lista todas las sucursales.
 */
export async function listarSucursales() {
  const res = await fetch(`${BASE_URL}/sucursales`);
  return handleResponse(res);
}

/**
 * Crea una nueva sucursal.
 * Espera: { codigo, ubicacion }
 */
export async function crearSucursal(datos) {
  const res = await fetch(`${BASE_URL}/sucursales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  return handleResponse(res);
}

// ---------- BITÁCORA ----------

/**
 * Consulta los registros de la bitácora.
 * Opcionalmente se puede pasar un filtro por acción o tabla.
 */
export async function consultarBitacora(filtro = '') {
  const url = filtro
    ? `${BASE_URL}/bitacora?filtro=${encodeURIComponent(filtro)}`
    : `${BASE_URL}/bitacora`;
  const res = await fetch(url);
  return handleResponse(res);
}

// Cuentas de un cliente
export async function listarCuentasPorCliente(clienteId) {
  const res = await fetch(`${BASE_URL}/cuentas/cliente/${clienteId}`);
  return handleResponse(res);
}

// Clientes de un empleado
export async function obtenerClientesEmpleado(empId) {
  const res = await fetch(`${BASE_URL}/empleados/${empId}/clientes`);
  return handleResponse(res);
}

// Listar todas las transacciones (admin)
export async function listarTransacciones() {
  const res = await fetch(`${BASE_URL}/transacciones`);
  return handleResponse(res);
}