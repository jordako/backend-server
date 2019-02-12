var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Doctor = require('../models/doctor');

// ==========================================
// Obtener todos los médicos
// ==========================================
app.get('/', (req, res) => {
    Doctor.find({}, (err, doctors) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando médicos',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            doctors: doctors
        });
    });
});


// ==========================================
// Actualizar médico
// ==========================================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Doctor.findById(id, (err, doctor) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar médico',
                errors: err
            });
        }

        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        doctor.name = body.name;
        doctor.user = req.user._id;
        doctor.hospital = body.hospital;

        doctor.save((err, savedDoctor) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                doctor: savedDoctor
            });
        });

    });

});


// ==========================================
// Crear un nuevo médico
// ==========================================
app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;

    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });

    doctor.save((err, savedDoctor) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            doctor: savedDoctor
        });
    });
});


// ==========================================
// Borrar un médico
// ==========================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Doctor.findByIdAndDelete(id, (err, deletedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar médico',
                errors: err
            });
        }

        if (!deletedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            doctor: deletedDoctor
        });
    });
});


module.exports = app;