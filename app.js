const express = require('express');
const db = require('./configBD/config');
const logger = require('./utils/logger');

const corsMiddleware = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');
const orderRoutes = require('./routes/ordersRoutes');
const login = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Configurar CORS
app.use(corsMiddleware);

// Usar rutas
app.use('/metro', orderRoutes);
app.use('/auth', login);

// Manejo de errores
app.use(errorHandler);

app.listen(port, () => {
   console.log(`Server listening on port ${port}`);
});



module.exports = app;