const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- POST /api/cuentas ----------------------
// Crea una cuenta: pkg_cuenta.sp_crear_cuenta
router.post('/', async (req, res) => {
  const { tipo, saldo, sucursal, cliente } = req.body;

  // Validación básica
  if (!tipo || saldo === undefined || !sucursal || !cliente) {
    return res.status(400).json({
      success: false,
      mensaje: 'Faltan datos: tipo, saldo, sucursal, cliente.'
    });
  }

  const saldoNum = parseFloat(saldo);
  if (isNaN(saldoNum) || saldoNum < 0) {
    return res.status(400).json({
      success: false,
      mensaje: 'El saldo debe ser un número no negativo.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_cuenta.sp_crear_cuenta(
          p_tipo        => :tipo,
          p_saldo       => :saldo,
          p_sucursal    => :sucursal,
          p_cliente     => :cliente,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      tipo,
      saldo: saldoNum,
      sucursal: parseInt(sucursal, 10),
      cliente: parseInt(cliente, 10),
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
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- PUT /api/cuentas/:id/bloquear ----------------------
// Bloquea una cuenta: pkg_cuenta.sp_bloquear_cuenta
router.put('/:id/bloquear', async (req, res) => {
  const cue_id = parseInt(req.params.id, 10);

  if (isNaN(cue_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cuenta inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_cuenta.sp_bloquear_cuenta(
          p_cue_id      => :cue_id,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      cue_id,
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
    console.error('Error al bloquear cuenta:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- GET /api/cuentas/:id/saldo ----------------------
// Consulta saldo de una cuenta: pkg_cuenta.fn_consultar_saldo
router.get('/:id/saldo', async (req, res) => {
  const cue_id = parseInt(req.params.id, 10);

  if (isNaN(cue_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cuenta inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        :cursor := pkg_cuenta.fn_consultar_saldo(:cue_id);
      END;
    `;

    const bindVars = {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      cue_id
    };

    const result = await connection.execute(sql, bindVars);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();

    if (rows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Cuenta no encontrada.' });
    }

    const cuenta = rows[0];
    const data = {
      cue_id: cuenta[0],
      cue_saldo: cuenta[1],
      cue_estado: cuenta[2],
      cue_tipo: cuenta[3]
    };

    res.json({ success: true, data });

  } catch (error) {
    console.error('Error al consultar saldo:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- GET /api/cuentas/:id/historial ----------------------
// Historial de transacciones de una cuenta: pkg_cuenta.fn_historial_cuenta
router.get('/:id/historial', async (req, res) => {
  const cue_id = parseInt(req.params.id, 10);

  if (isNaN(cue_id)) {
    return res.status(400).json({ success: false, mensaje: 'ID de cuenta inválido.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        :cursor := pkg_cuenta.fn_historial_cuenta(:cue_id);
      END;
    `;

    const bindVars = {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      cue_id
    };

    const result = await connection.execute(sql, bindVars);
    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows();
    await resultSet.close();

    // El cursor devuelve: tra_id, tra_monto, tra_fecha, tra_estado, tra_canal, tipo_transaccion, flujo
    const historial = rows.map(row => ({
      tra_id: row[0],
      tra_monto: row[1],
      tra_fecha: row[2],
      tra_estado: row[3],
      tra_canal: row[4],
      tipo_transaccion: row[5],
      flujo: row[6]
    }));

    res.json({ success: true, data: historial });

  } catch (error) {
    console.error('Error al obtener historial de cuenta:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// GET /api/cuentas/cliente/:clienteId
router.get('/cliente/:clienteId', async (req, res) => {
  const cliId = parseInt(req.params.clienteId, 10);
  if (isNaN(cliId)) return res.status(400).json({ success: false, mensaje: 'ID de cliente inválido' });

  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`
      SELECT cu.cue_id, cu.cue_tipo, cu.cue_saldo, cu.cue_estado, cu.cue_fecha_apertura, cu.suc_id,
             s.suc_codigo, s.suc_ubicacion
      FROM Cuenta cu
      JOIN Cliente_Cuenta cc ON cu.cue_id = cc.cue_id
      LEFT JOIN Sucursal s ON cu.suc_id = s.suc_id
      WHERE cc.cli_id = :cliId
      ORDER BY cu.cue_id
    `, { cliId });

    const cuentas = result.rows.map(r => ({
      cue_id: r[0],
      cue_tipo: r[1],
      cue_saldo: r[2],
      cue_estado: r[3],
      cue_fecha_apertura: r[4],
      suc_id: r[5],
      suc_codigo: r[6],
      suc_ubicacion: r[7]
    }));
    res.json({ success: true, data: cuentas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
});

// GET /api/cuentas (admin)
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`
      SELECT cue_id, cue_tipo, cue_saldo, cue_estado, cue_fecha_apertura, suc_id
      FROM Cuenta ORDER BY cue_id
    `);
    const cuentas = result.rows.map(row => ({
      cue_id: row[0],
      cue_tipo: row[1],
      cue_saldo: row[2],
      cue_estado: row[3],
      cue_fecha_apertura: row[4],
      suc_id: row[5]
    }));
    res.json({ success: true, data: cuentas });
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

module.exports = router;