const oracledb = require('oracledb');
require('dotenv').config();

// Si usas Instant Client, descomenta y ajusta la ruta:
// oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient' });

async function initPool() {
  await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 2
  });
  console.log('✅ Pool de conexiones Oracle creado');
}

module.exports = { initPool, oracledb };