const oracledb = require('oracledb');
require('dotenv').config();   // ← mejor al principio

// Si usas Instant Client, descomenta y ajusta ruta:
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient' });

async function initPool() {
  try {
    // Verificar que las variables existen
    if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_CONNECT_STRING) {
      throw new Error('❌ Faltan variables de entorno. Revisa tu archivo .env');
    }

    console.log('📡 Conectando a Oracle con:', {
      user: process.env.DB_USER,
      connectString: process.env.DB_CONNECT_STRING
    });

    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });

    // 🔍 PRUEBA REAL: obtener una conexión y ejecutar una consulta mínima
    const pool = oracledb.getPool();
    const conn = await pool.getConnection();
    const result = await conn.execute(`SELECT 'Conexión OK' AS status FROM DUAL`);
    await conn.close();

    console.log('✅ Pool de conexiones Oracle creado');
    console.log('🧪 Consulta de prueba exitosa:', result.rows[0][0]);
    return true;
  } catch (err) {
    console.error('❌ ERROR al inicializar el pool de Oracle:');
    console.error(err.message);
    if (err.errorNum) console.error('Código Oracle:', err.errorNum);
    throw err;  // Detiene el servidor si no hay base de datos
  }
}

// Función auxiliar para obtener el pool (útil en rutas)
function getPool() {
  const pool = oracledb.getPool();
  if (!pool) throw new Error('Pool no inicializado. Llama a initPool() primero');
  return pool;
}

module.exports = { initPool, getPool, oracledb };