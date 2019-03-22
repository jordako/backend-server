var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ==============================================
// Autenticación Google
// ==============================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    name: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  }
}

app.post('/google', async(req, res) => {
  var token = req.body.token;

  var googleUser = await verify(token)
    .catch(e => {
      return res.status(403).json({
        ok: false,
        message: 'Token no valido',
        errors: { message: 'Token no valido' }
      });
    });

  User.findOne({ email: googleUser.email }, (err, user) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: 'Error al buscar usuario',
        errors: err
      });
    }

    if (user) {

      if (user.google === false) {
        return res.status(400).json({
          ok: false,
          message: 'Debe de usar su autenticación normal',
          errors: { message: 'Debe de usar su autenticación normal' }
        });
      } else {
        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
          ok: true,
          user: user,
          token: token,
          id: user._id,
          menu: obtenerMenu(user.role)
        });
      }

    } else {
      // El usuario no existe... hay que crearlo
      var newUser = new User();

      newUser.name = googleUser.name;
      newUser.email = googleUser.email;
      newUser.img = googleUser.img;
      newUser.google = true;
      newUser.password = ':)';

      newUser.save((err, user) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            message: 'Error al crear usuario',
            errors: err
          });
        }

        var token = jwt.sign({ user: user }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
          ok: true,
          user: user,
          token: token,
          id: user._id,
          menu: obtenerMenu(user.role)
        });
      });
    }
  });
});


// ==============================================
// Autenticación normal
// ==============================================
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
      id: user._id,
      menu: obtenerMenu(user.role)
    });
  });



});

function obtenerMenu(role) {
  var menu = [{
    title: 'Principal',
    icon: 'mdi mdi-gauge',
    submenu: [{
      title: 'Dashboard',
      url: '/dashboard'
    }, {
      title: 'ProgressBar',
      url: '/progress'
    }, {
      title: 'Gráficas',
      url: '/graphics1'
    }, {
      title: 'Promesas',
      url: '/promises'
    }, {
      title: 'RxJs',
      url: '/rxjs'
    }]
  }, {
    title: 'Mantenimientos',
    icon: 'mdi mdi-folder-lock-open',
    submenu: [{
      title: 'Hospitales',
      url: '/hospitals'
    }, {
      title: 'Médicos',
      url: '/doctors'
    }]
  }];

  if (role === 'ADMIN_ROLE') {
    menu[1].submenu.unshift({
      title: 'Usuarios',
      url: '/users'
    });
  }


  return menu;
}

module.exports = app;