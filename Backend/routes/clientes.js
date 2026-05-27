const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- POST /api/clientes ----------------------
router.post('/', async (req, res) => {
  const { username, password, nombre, documento, telefono, email } = req.body;

  if (!username || !password || !nombre || !documento) {
    return res.status(400).json({
      success: false,
      mensaje: 'Faltan datos obligatorios: username, password, nombre, documento.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_cliente.sp_insertar_cliente(
          p_username    => :username,
          p_password    => :password,
          p_nombre      => :nombre,
          p_documento   => :documento,
          p_telefono    => :telefono,
          p_email       => :email,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      username,
      password,
      nombre,
      documento,
      telefono: telefono || null,
      email: email || null,
      out_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(sql, bindVars);
    const success = result.outBinds.out_success;
    const message = result.outBinds.out_message;

    if (success === 1) {
      res.json({ success: true, mensaje: message });
    } else {
      res.status(400).json({ success: false, mensaje: message });
    }

  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- PUT /api/clientes/:id ----------------------
router.put('/:id', async (req, res) => {
  const cli_id = parseInt(req.params.id, 10);
  const { telefono, email } = req.body;

  if (isNaN(cli_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cliente inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_cliente.sp_actualizar_cliente(
          p_cli_id      => :cli_id,
          p_telefono    => :telefono,
          p_email       => :email,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      cli_id,
      telefono: telefono || null,
      email: email || null,
      out_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(sql, bindVars);
    const success = result.outBinds.out_success;
    const message = result.outBinds.out_message;

    if (success === 1) {
      res.json({ success: true, mensaje: message });
    } else {
      res.status(400).json({ success: false, mensaje: message });
    }

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- DELETE /api/clientes/:id ----------------------
router.delete('/:id', async (req, res) => {
  const cli_id = parseInt(req.params.id, 10);

  if (isNaN(cli_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cliente inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_cliente.sp_desactivar_cliente(
          p_cli_id      => :cli_id,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      cli_id,
      out_success: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_message: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 }
    };

    const result = await connection.execute(sql, bindVars);
    const success = result.outBinds.out_success;
    const message = result.outBinds.out_message;

    if (success === 1) {
      res.json({ success: true, mensaje: message });
    } else {
      res.status(400).json({ success: false, mensaje: message });
    }

  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- GET /api/clientes/:id ----------------------
router.get('/:id', async (req, res) => {
  const cli_id = parseInt(req.params.id, 10);

  if (isNaN(cli_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cliente inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        :cursor := pkg_cliente.fn_consultar_cliente(:cli_id);
      END;
    `;

    const bindVars = {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      cli_id
    };

    const result = await connection.execute(sql, bindVars);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();

    await resultSet.close(); // buena práctica cerrar el cursor

    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Cliente no encontrado.' });
    }

    const cliente = rows[0];
    const data = {
      cli_id: cliente[0],
      usu_username: cliente[1],
      cli_nombre: cliente[2],
      cli_documento: cliente[3],
      cli_telefono: cliente[4],
      cli_email: cliente[5],
      cli_estado: cliente[6]
    };

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error al consultar cliente:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- GET /api/clientes ----------------------
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        :cursor := pkg_cliente.fn_listar_clientes_activos();
      END;
    `;

    const bindVars = {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    };

    const result = await connection.execute(sql, bindVars);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();

    await resultSet.close(); // cerrar cursor

    const clientes = rows.map(row => ({
      cli_id: row[0],
      cli_nombre: row[1],
      cli_documento: row[2],
      cli_telefono: row[3],
      cli_email: row[4]
    }));

    res.json({ success: true, data: clientes });

  } catch (error) {
    console.error('Error al listar clientes activos:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

module.exports = router;