const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- GET /api/bitacora ----------------------
// Consulta los registros de la bitácora, con filtro opcional
router.get('/', async (req, res) => {
  const { filtro } = req.query;

  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `
      SELECT bit_id, usu_id, bit_accion, bit_tabla, bit_anterior, bit_nuevo, bit_fecha
      FROM Bitacora
    `;
    const binds = {};

    if (filtro) {
      query += `
        WHERE UPPER(bit_accion) LIKE UPPER(:filtro)
           OR UPPER(bit_tabla) LIKE UPPER(:filtro)
      `;
      binds.filtro = `%${filtro}%`;
    }

    query += ` ORDER BY bit_fecha DESC, bit_id DESC`;

    const result = await connection.execute(query, binds);
    const registros = result.rows.map(row => ({
      bit_id: row[0],
      usu_id: row[1],
      bit_accion: row[2],
      bit_tabla: row[3],
      bit_anterior: row[4],
      bit_nuevo: row[5],
      bit_fecha: row[6]
    }));

    res.json({ success: true, data: registros });

  } catch (error) {
    console.error('Error al consultar bitácora:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

module.exports = router;