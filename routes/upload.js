var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

// default options
app.use(fileUpload());

app.put('/:type/:id', (req, res) => {

    var type = req.params.type;
    var id = req.params.id;

    // Tipos de colección
    var validTypes = ['hospitals', 'doctors', 'users'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No seleccionó nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var file = req.files.image;
    var cutName = file.name.split('.');
    var fileExtension = cutName[cutName.length - 1];

    // Validamos el tipo de archivo
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];
    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no valida',
            errors: { message: 'Las extensiones válidas son ' + validExtensions.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var fileName = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

    // Mover el archivo 
    var path = `./uploads/${type}/${fileName}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                errors: err
            });
        }

        uploadByType(type, id, fileName, res);

        // res.status(200).json({
        //   ok: true,
        //   message: 'Archivo subido'
        // });
    });

});

function uploadByType(type, id, fileName, res) {
    if (type === 'users') {
        User.findById(id, (err, user) => {
            var oldPath = './uploads/users/' + user.img;

            // Si existe, la eliminamos
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            user.img = fileName;
            user.save((err, updatedUser) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    user: updatedUser
                });
            });
        });
    }

    if (type === 'doctors') {

    }

    if (type === 'hospitals') {

    }
}

module.exports = app;