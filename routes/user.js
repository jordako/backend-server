var express = require('express');

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
// Crear un nuevo usuario
// ==========================================
app.post('/', (req, res) => {
    var body = req.body;

    var user = new User({
        name: body.name,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });

    user.save((err, savedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            user: savedUser
        });
    });
});

module.exports = app;