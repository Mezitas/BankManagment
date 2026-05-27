const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// GET /api/empleados/:id/clientes
router.get('/:id/clientes', async (req, res) => {
  const empId = parseInt(req.params.id, 10);
  if (isNaN(empId)) return res.status(400).json({ success: false, mensaje: 'ID inválido' });

  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`
      SELECT c.cli_id, c.cli_nombre, c.cli_documento, c.cli_telefono, c.cli_email, c.cli_estado
      FROM Cliente c
      JOIN Empleado_Cliente ec ON c.cli_id = ec.cli_id
      WHERE ec.emp_id = :empId
    `, { empId });

    const clientes = result.rows.map(r => ({
      cli_id: r[0], cli_nombre: r[1], cli_documento: r[2],
      cli_telefono: r[3], cli_email: r[4], cli_estado: r[5]
    }));
    res.json({ success: true, data: clientes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  } finally {
    if (connection) try { await connection.close(); } catch (e) {}
  }
});

module.exports = router;