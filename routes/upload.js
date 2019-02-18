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
    });

});

function uploadByType(type, id, fileName, res) {
    if (type === 'users') {
        User.findById(id, (err, user) => {

            if (!user) {
                return res.status(400).json({
                    ok: false,
                    message: 'Usuario no existe',
                    errors: { message: 'Usuario no existe ' }
                });
            }

            var oldPath = './uploads/users/' + user.img;

            // Si existe, la eliminamos
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            user.img = fileName;
            user.save((err, updatedUser) => {

                updatedUser.password = ':)';

                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    user: updatedUser
                });
            });
        });
    }

    if (type === 'doctors') {
        Doctor.findById(id, (err, doctor) => {

            if (!doctor) {
                return res.status(400).json({
                    ok: false,
                    message: 'Médico no existe',
                    errors: { message: 'Médico no existe ' }
                });
            }

            var oldPath = './uploads/doctors/' + doctor.img;

            // Si existe, la eliminamos
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            doctor.img = fileName;
            doctor.save((err, updatedDoctor) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de médico actualizada',
                    doctor: updatedDoctor
                });
            });
        });
    }

    if (type === 'hospitals') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: 'Hospital no existe',
                    errors: { message: 'Hospital no existe ' }
                });
            }

            var oldPath = './uploads/hospitals/' + hospital.img;

            // Si existe, la eliminamos
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            hospital.img = fileName;
            hospital.save((err, updatedHospital) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: updatedHospital
                });
            });
        });
    }
}

module.exports = app;