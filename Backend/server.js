const express = require('express');
const cors = require('cors');
const { initPool } = require('./db');

const app = express();
app.use(cors());                // Permite peticiones desde el frontend
app.use(express.json());        // Parsea JSON automáticamente

// Montar las rutas (las iremos creando)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/cuentas', require('./routes/cuentas'));
app.use('/api/transacciones', require('./routes/transacciones'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/sucursales', require('./routes/sucursales'));
app.use('/api/bitacora', require('./routes/bitacora'));

const PORT = process.env.PORT || 3001;

(async () => {
  await initPool();                     // Inicializa el pool de Oracle
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://192.168.20.37:${PORT}`);
  });
})();