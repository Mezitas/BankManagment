const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- POST /api/transacciones/consignar ----------------------
router.post('/consignar', async (req, res) => {
  const { cuenta, monto } = req.body;

  // Validaciones
  const cueId = parseInt(cuenta, 10);
  const montoNum = parseFloat(monto);
  if (isNaN(cueId) || isNaN(montoNum) || montoNum <= 0) {
    return res.status(400).json({
      success: false,
      mensaje: 'Datos inválidos: cuenta y monto (positivo) son obligatorios.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_transaccion.sp_consignar(
          p_cuenta      => :cuenta,
          p_monto       => :monto,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      cuenta: cueId,
      monto: montoNum,
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
    console.error('Error en consignación:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- POST /api/transacciones/retirar ----------------------
router.post('/retirar', async (req, res) => {
  const { cuenta, monto } = req.body;

  const cueId = parseInt(cuenta, 10);
  const montoNum = parseFloat(monto);
  if (isNaN(cueId) || isNaN(montoNum) || montoNum <= 0) {
    return res.status(400).json({
      success: false,
      mensaje: 'Datos inválidos: cuenta y monto (positivo) son obligatorios.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_transaccion.sp_retirar(
          p_cuenta      => :cuenta,
          p_monto       => :monto,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      cuenta: cueId,
      monto: montoNum,
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
    console.error('Error en retiro:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- POST /api/transacciones/transferir ----------------------
router.post('/transferir', async (req, res) => {
  const { origen, destino, monto } = req.body;

  const origId = parseInt(origen, 10);
  const destId = parseInt(destino, 10);
  const montoNum = parseFloat(monto);
  if (isNaN(origId) || isNaN(destId) || isNaN(montoNum) || montoNum <= 0) {
    return res.status(400).json({
      success: false,
      mensaje: 'Datos inválidos: origen, destino y monto (positivo) son obligatorios.'
    });
  }

  if (origId === destId) {
    return res.status(400).json({
      success: false,
      mensaje: 'Las cuentas origen y destino deben ser diferentes.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const sql = `
      BEGIN
        pkg_transaccion.sp_transferir(
          p_origen      => :origen,
          p_destino     => :destino,
          p_monto       => :monto,
          p_out_success => :out_success,
          p_out_message => :out_message
        );
      END;
    `;

    const bindVars = {
      origen: origId,
      destino: destId,
      monto: montoNum,
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
    console.error('Error en transferencia:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// GET /api/transacciones
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`
      SELECT t.tra_id, t.ttr_id, tt.ttr_nombre, t.tra_monto, t.tra_fecha, t.tra_estado, t.tra_canal,
             t.cue_id_origen, t.cue_id_destino
      FROM Transaccion t
      JOIN TipoTransaccion tt ON t.ttr_id = tt.ttr_id
      ORDER BY t.tra_fecha DESC
    `);
    const transacciones = result.rows.map(r => ({
      tra_id: r[0],
      trr_id: r[1],
      tipo_transaccion: r[2],
      tra_monto: r[3],
      tra_fecha: r[4],
      tra_estado: r[5],
      tra_canal: r[6],
      cue_id_origen: r[7],
      cue_id_destino: r[8]
    }));
    res.json({ success: true, data: transacciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
});

module.exports = router;