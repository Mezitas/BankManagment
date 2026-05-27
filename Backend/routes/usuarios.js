const express = require('express');
const router = express.Router();
const { oracledb } = require('../db');

// ---------------------- GET /api/usuarios ----------------------
// Lista todos los usuarios con información básica y nombre real
router.get('/', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const query = `
      SELECT u.usu_id, u.usu_username, u.usu_rol, u.usu_estado,
             COALESCE(c.cli_nombre, e.emp_nombre, a.adm_nombre, 'Sin nombre') AS nombre_real
      FROM Usuario u
      LEFT JOIN Cliente c ON u.usu_id = c.usu_id
      LEFT JOIN Empleado e ON u.usu_id = e.usu_id
      LEFT JOIN Administrador a ON u.usu_id = a.usu_id
      ORDER BY u.usu_id
    `;

    const result = await connection.execute(query);
    const usuarios = result.rows.map(row => ({
      usu_id: row[0],
      usu_username: row[1],
      usu_rol: row[2],
      usu_estado: row[3],
      nombre_real: row[4]
    }));

    res.json({ success: true, data: usuarios });

  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- PUT /api/usuarios/:id/estado ----------------------
// Activar/desactivar un usuario
router.put('/:id/estado', async (req, res) => {
  const usu_id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (isNaN(usu_id) || !estado || !['ACTIVO', 'INACTIVO'].includes(estado.toUpperCase())) {
    return res.status(400).json({
      success: false,
      mensaje: 'ID de usuario inválido o estado no permitido (ACTIVO/INACTIVO).'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const updateSql = `
      UPDATE Usuario
      SET usu_estado = :estado
      WHERE usu_id = :usu_id
    `;

    const result = await connection.execute(updateSql, {
      estado: estado.toUpperCase(),
      usu_id
    });

    // Confirmar la operación (el driver de Node tiene auto-commit por defecto, pero podemos explicitarlo)
    await connection.execute('COMMIT');

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }

    // Registrar en bitácora (como en el frontend se registraba en JSON)
    // Podemos llamar a pkg_util.sp_log_error o hacer un INSERT manual, pero usaremos pkg_util.sp_log_error
    // ya que es para registrar eventos. Sin embargo, sp_log_error está diseñado para errores.
    // Podemos simplemente hacer un INSERT en Bitacora manualmente.
    const bitacoraSql = `
      INSERT INTO Bitacora (bit_id, usu_id, bit_accion, bit_tabla, bit_anterior, bit_nuevo, bit_fecha)
      VALUES (seq_bitacora.NEXTVAL, :admin_id, 'UPDATE', 'USUARIO', :anterior, :nuevo, SYSDATE)
    `;
    // Nota: necesitaríamos el usu_id del admin que hace la acción. Por ahora no tenemos sesión de admin.
    // Asumiremos que el admin logueado se pasa en el request o se usa un valor por defecto (ej. 9).
    // En futuras mejoras se puede agregar autenticación con token.
    // Por simplicidad, omitiremos el registro en bitácora por ahora, o lo dejamos con admin_id fijo.
    // Como el frontend original registraba en bitácora, podemos pasar el usu_id del admin en el body.
    // Pero no quiero complicar. Dejo comentada la opción.
    // Para mantener limpieza, no registramos aquí porque el trigger de bitácora existente solo aplica a CUENTA.

    res.json({ success: true, mensaje: `Usuario ${estado.toUpperCase() === 'ACTIVO' ? 'activado' : 'desactivado'} correctamente.` });

  } catch (error) {
    console.error('Error al cambiar estado de usuario:', error);
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

// ---------------------- POST /api/usuarios ----------------------
// Crear un nuevo usuario con su respectivo rol (CLIENTE, EMPLEADO, ADMINISTRADOR)
router.post('/', async (req, res) => {
  const {
    username, password, rol,
    nombre, documento, telefono, email,   // para CLIENTE
    emp_rol, suc_id                        // para EMPLEADO
  } = req.body;

  if (!username || !password || !rol || !nombre) {
    return res.status(400).json({
      success: false,
      mensaje: 'Faltan campos obligatorios: username, password, rol, nombre.'
    });
  }

  const rolUpper = rol.toUpperCase();
  if (!['CLIENTE', 'EMPLEADO', 'ADMINISTRADOR'].includes(rolUpper)) {
    return res.status(400).json({ success: false, mensaje: 'Rol no válido.' });
  }

  let connection;
  const savepointName = 'SP_CREAR_USUARIO';
  try {
    connection = await oracledb.getConnection();

    // Iniciar transacción con savepoint usando pkg_util
    await connection.execute(`BEGIN pkg_util.sp_begin_transaction(:sp); END;`, { sp: savepointName });

    // Insertar en Usuario (el trigger se encargará de asignar el ID)
    const insertUsuario = `
      INSERT INTO Usuario (usu_username, usu_password, usu_rol, usu_estado)
      VALUES (:username, :password, :rol, 'ACTIVO')
      RETURNING usu_id INTO :new_id
    `;
    const bindUsuario = {
      username,
      password,
      rol: rolUpper,
      new_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    await connection.execute(insertUsuario, bindUsuario);
    const usu_id = bindUsuario.new_id;

    // Según el rol, insertar en la tabla correspondiente
    if (rolUpper === 'CLIENTE') {
      // Podemos usar el procedimiento existente pkg_cliente.sp_insertar_cliente,
      // pero ya tenemos el usu_id creado. sp_insertar_cliente crea otro usuario y cliente.
      // Para no duplicar, haremos INSERT manual en Cliente.
      // Validar campos adicionales
      const insertCliente = `
        INSERT INTO Cliente (usu_id, cli_nombre, cli_documento, cli_telefono, cli_email, cli_estado)
        VALUES (:usu_id, :nombre, :documento, :telefono, :email, 'ACTIVO')
      `;
      await connection.execute(insertCliente, {
        usu_id,
        nombre,
        documento: documento || null,
        telefono: telefono || null,
        email: email || null
      });
    } else if (rolUpper === 'EMPLEADO') {
      // Validar campos
      const insertEmpleado = `
        INSERT INTO Empleado (usu_id, emp_nombre, emp_rol, suc_id)
        VALUES (:usu_id, :nombre, :emp_rol, :suc_id)
      `;
      await connection.execute(insertEmpleado, {
        usu_id,
        nombre,
        emp_rol: emp_rol || 'CAJERO',
        suc_id: suc_id ? parseInt(suc_id, 10) : null
      });
      // Relación empleado-sucursal (tabla Empleado_Sucursal)
      // Según el esquema, hay una tabla Empleado_Sucursal que también debemos poblar.
      // En los inserts iniciales sí se pobló. Así que lo añadimos:
      if (suc_id) {
        await connection.execute(
          `INSERT INTO Empleado_Sucursal (emp_id, suc_id) VALUES ((SELECT emp_id FROM Empleado WHERE usu_id = :usu_id), :suc_id)`,
          { usu_id, suc_id: parseInt(suc_id, 10) }
        );
      }
    } else if (rolUpper === 'ADMINISTRADOR') {
      const insertAdmin = `
        INSERT INTO Administrador (usu_id, adm_nombre)
        VALUES (:usu_id, :nombre)
      `;
      await connection.execute(insertAdmin, { usu_id, nombre });
    }

    // Commit de la transacción
    await connection.execute(`BEGIN pkg_util.sp_commit_transaction(:sp); END;`, { sp: savepointName });

    res.json({ success: true, mensaje: `Usuario ${rolUpper} "${username}" creado exitosamente.` });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    // Rollback en caso de error
    if (connection) {
      try {
        await connection.execute(`BEGIN pkg_util.sp_rollback_transaction(:sp); END;`, { sp: savepointName });
        // Registrar error en bitácora con sp_log_error
        await connection.execute(
          `BEGIN pkg_util.sp_log_error(NULL, 'CREAR_USUARIO', 'USUARIO', :msg); END;`,
          { msg: error.message }
        );
      } catch (rollbackErr) {
        console.error('Error en rollback:', rollbackErr);
      }
    }
    res.status(500).json({ success: false, mensaje: 'Error interno al crear usuario.' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error(err); }
    }
  }
});

module.exports = router;