const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- GET /api/sucursales ----------------------
// Lista todas las sucursales
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const query = `
      SELECT suc_id, suc_codigo, suc_ubicacion, suc_estado
      FROM Sucursal
      ORDER BY suc_id
    `;

    const result = await connection.execute(query);
    const sucursales = result.rows.map(row => ({
      suc_id: row[0],
      suc_codigo: row[1],
      suc_ubicacion: row[2],
      suc_estado: row[3]
    }));

    res.json({ success: true, data: sucursales });

  } catch (error) {
    console.error('Error al listar sucursales:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- POST /api/sucursales ----------------------
// Crea una nueva sucursal
router.post('/', async (req, res) => {
  const { codigo, ubicacion } = req.body;

  if (!codigo || !ubicacion) {
    return res.status(400).json({
      success: false,
      mensaje: 'El código y la ubicación son obligatorios.'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    // Verificar si ya existe una sucursal con el mismo código (aunque no tenga restricción UNIQUE, para evitar duplicados)
    const checkSql = `SELECT COUNT(*) FROM Sucursal WHERE UPPER(suc_codigo) = UPPER(:codigo)`;
    const checkResult = await connection.execute(checkSql, { codigo });
    if (checkResult.rows[0][0] > 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe una sucursal con ese código.'
      });
    }

    // Insertar la nueva sucursal (el trigger de secuencia no existe para sucursal, así que usamos la secuencia manualmente)
    const insertSql = `
      INSERT INTO Sucursal (suc_id, suc_codigo, suc_ubicacion, suc_estado)
      VALUES (seq_sucursal.NEXTVAL, UPPER(:codigo), :ubicacion, 'ACTIVA')
    `;

    await connection.execute(insertSql, {
      codigo: codigo.trim(),
      ubicacion: ubicacion.trim()
    });

    // Commit explícito (aunque el driver hace auto-commit, lo ponemos para claridad)
    await connection.execute('COMMIT');

    res.json({ success: true, mensaje: 'Sucursal creada exitosamente.' });

  } catch (error) {
    console.error('Error al crear sucursal:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

module.exports = router;