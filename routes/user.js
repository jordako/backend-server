var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAuth = require('../middlewares/auth');

var app = express();

var User = require('../models/user');

// ==========================================
// Obtener todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {
  User.find({}, 'name email img role')
    .exec((err, users) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: 'Error cargando usuarios',
          errors: err
        });
      }

      res.status(200).json({
        ok: true,
        users: users
      });
    });
});


// ==========================================
// Actualizar usuario
// ==========================================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  User.findById(id, (err, user) => {

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
        message: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    user.name = body.name;
    user.email = body.email;
    user.role = body.role;

    user.save((err, savedUser) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          message: 'Error al actualizar usuario',
          errors: err
        });
      }

      savedUser.password = ':)';

      res.status(200).json({
        ok: true,
        user: savedUser,
        userToken: req.user
      });
    });

  });

});


// ==========================================
// Crear un nuevo usuario
// ==========================================
app.post('/', mdAuth.verifyToken, (req, res) => {
  var body = req.body;

  var user = new User({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  user.save((err, savedUser) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        message: 'Error al crear usuario',
        errors: err
      });
    }

    res.status(201).json({
      ok: true,
      user: savedUser,
      userToken: req.user
    });
  });
});


// ==========================================
// Borrar un usuario
// ==========================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
  var id = req.params.id;

  User.findByIdAndDelete(id, (err, deletedUser) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al borrar usuario',
        errors: err
      });
    }

    if (!deletedUser) {
      return res.status(400).json({
        ok: false,
        message: 'El usuario con el id ' + id + ' no existe',
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    res.status(200).json({
      ok: true,
      user: deletedUser,
      userToken: req.user
    });
  });
});


module.exports = app;