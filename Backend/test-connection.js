const oracledb = require('oracledb');
require('dotenv').config();

// Si necesitas indicar la ruta del Instant Client, descomenta:
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient' });

async function test() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });
    console.log('✅ Conexión exitosa a Oracle XE');

    // Consulta de prueba mínima
    const result = await conn.execute('SELECT 1 AS valor FROM DUAL');
    console.log('Resultado:', result.rows); // Debe mostrar [ { VALOR: 1 } ]

    // Si ya tienes tablas, puedes probar una consulta real
    // const res = await conn.execute('SELECT COUNT(*) FROM usuarios');
    // console.log('Usuarios:', res.rows[0][0]);

  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    if (conn) {
      await conn.close();
      console.log('Conexión cerrada');
    }
  }
}

test();