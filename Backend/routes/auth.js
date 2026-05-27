const express = require('express');
const router = express.Router();
const { oracledb } = require('../db'); // importamos el oracledb configurado

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validación básica de entrada
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      mensaje: 'Usuario y contraseña son obligatorios.'
    });
  }

  let connection;
  try {
    // Obtenemos una conexión del pool
    connection = await oracledb.getConnection();

    // 1. Buscar el usuario activo con las credenciales
    const userQuery = `
      SELECT usu_id, usu_username, usu_rol, usu_estado
      FROM Usuario
      WHERE usu_username = :username
        AND usu_password = :password
        AND usu_estado = 'ACTIVO'
    `;
    const userResult = await connection.execute(userQuery, {
      username,
      password
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas o usuario inactivo.'
      });
    }

    const userRow = userResult.rows[0];
    const usu_id = userRow[0];
    const usu_username = userRow[1];
    const usu_rol = userRow[2];
    const usu_estado = userRow[3];

    // 2. Según el rol, consultamos los datos adicionales
    let roleData = {};

    if (usu_rol === 'CLIENTE') {
      const cliQuery = `
        SELECT cli_id, cli_nombre
        FROM Cliente
        WHERE usu_id = :usu_id
      `;
      const cliResult = await connection.execute(cliQuery, { usu_id });
      if (cliResult.rows.length > 0) {
        roleData = {
          clienteId: cliResult.rows[0][0],
          nombre: cliResult.rows[0][1]
        };
      }
    } else if (usu_rol === 'EMPLEADO') {
      const empQuery = `
        SELECT emp_id, emp_nombre, suc_id
        FROM Empleado
        WHERE usu_id = :usu_id
      `;
      const empResult = await connection.execute(empQuery, { usu_id });
      if (empResult.rows.length > 0) {
        roleData = {
          empleadoId: empResult.rows[0][0],
          nombre: empResult.rows[0][1],
          sucursalId: empResult.rows[0][2]
        };
      }
    } else if (usu_rol === 'ADMINISTRADOR') {
      const admQuery = `
        SELECT adm_id, adm_nombre
        FROM Administrador
        WHERE usu_id = :usu_id
      `;
      const admResult = await connection.execute(admQuery, { usu_id });
      if (admResult.rows.length > 0) {
        roleData = {
          adminId: admResult.rows[0][0],
          nombre: admResult.rows[0][1]
        };
      }
    }

    // 3. Respondemos con la misma estructura que espera el frontend
    res.json({
      success: true,
      data: {
        usu_id,
        usu_username,
        usu_rol,
        usu_estado,
        roleData
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error interno del servidor.'
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error cerrando conexión:', err);
      }
    }
  }
});
//Revisar DIOSSS
router.get('/ping', (req, res) => {
  res.json({ mensaje: 'pong' });
});
module.exports = router;