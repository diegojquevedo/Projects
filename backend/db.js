// db.js (backend)

const { Sequelize } = require('sequelize');

// Configuración de la conexión con SQL Server
const sequelize = new Sequelize('mhfd_geodb_backup_jul_24', 'sa', 'Mtnvi3wsRnice!', {
  host: '34.196.171.25',
  dialect: 'mssql',
  dialectOptions: {
    encrypt: true,
    trustServerCertificate: true,
  },
});

// Verificar si la conexión fue exitosa
sequelize.authenticate()
  .then(() => {
    console.log("Conexión exitosa a SQL Server con Sequelize");
  })
  .catch(err => {
    console.error("Error de conexión:", err);
  });

module.exports = sequelize;

