const express = require('express');
const cors = require('cors');
const { initPool } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Tus rutas (cuando las crees)
// app.use('/api/auth', require('./routes/auth'));
// ...

const PORT = process.env.PORT || 3001;

app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cuentas', require('./routes/cuentas'));
app.use('/api/transacciones', require('./routes/transacciones'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/sucursales', require('./routes/sucursales'));
app.use('/api/bitacora', require('./routes/bitacora'));
app.use('/api/empleados', require('./routes/empleados'));

(async () => {
  try {
    await initPool();   // Si falla, lanza excepción y no arranca el servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://192.168.20.37:${PORT}`);
    });
  } catch (err) {
    console.error('💥 No se pudo iniciar el servidor por error de base de datos');
    process.exit(1);   // Termina el proceso con error
  }
})();
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});
