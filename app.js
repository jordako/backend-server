// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

// Importar rutas
var appRoutes = require('./routes/app');
var userRoutes = require('./routes/user');

// Conexión a la bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) {
        throw err;
    }

    console.log("Base de datos: \x1b[32m%s\x1b[0m", "online");
});


// Rutas
app.use('/user', userRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log("Express server puerto 3000: \x1b[32m%s\x1b[0m", "online");
});