// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar variables
var app = express();

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var doctorRoutes = require('./routes/doctor');

// Conexión a la bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
  if (err) {
    throw err;
  }

  console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");
});


// Rutas
app.use('/hospital', hospitalRoutes);
app.use('/doctor', doctorRoutes);
app.use('/user', userRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
  console.log("Express server puerto 3000: \x1b[32m%s\x1b[0m", "online");
});