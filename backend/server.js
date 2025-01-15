require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
const sequelize = require('./db');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Otras configuraciones y rutas
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.send('Backend funcionando');
});

// Middleware para rutas de usuario
app.use('/api/users', userRoutes);

// Sincronización de Sequelize
sequelize.sync({ alter: true })
  .then(() => console.log('Modelos sincronizados con la base de datos'))
  .catch((err) => console.error('Error al sincronizar modelos:', err));

app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});



