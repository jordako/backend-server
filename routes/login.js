var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

app.post('/', (req, res) => {

  var body = req.body;

  User.findOne({ email: body.email }, (err, user) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al buscar usuario',
        errors: err
      });
    }

    if (!user) {
      return res.status(400).json({
        ok: false,
        message: 'Credenciales incorrectas',
        errors: { message: 'Credenciales incorrectas' }
      });
    }

    if (!bcrypt.compareSync(body.password, user.password)) {
      return res.status(400).json({
        ok: false,
        message: 'Credenciales incorrectas',
        errors: { message: 'Credenciales incorrectas' }
      });
    }

    // Crear un token
    user.password = ":)";
    var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }); // 4 horas


    res.status(200).json({
      ok: true,
      user: user,
      token: token,
      id: user._id
    });
  });



});


module.exports = app;