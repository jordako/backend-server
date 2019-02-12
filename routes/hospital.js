var express = require('express');

var mdAuth = require('../middlewares/auth');

var app = express();

var Hospital = require('../models/hospital');

// ==========================================
// Obtener todos los hospitales
// ==========================================
app.get('/', (req, res) => {
    Hospital.find({}, (err, hospitals) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error cargando hospitales',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            hospitals: hospitals
        });
    });
});


// ==========================================
// Actualizar hospital
// ==========================================
app.put('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.name = body.name;
        hospital.user = req.user._id;

        hospital.save((err, savedHospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: savedHospital
            });
        });

    });

});


// ==========================================
// Crear un nuevo hospital
// ==========================================
app.post('/', mdAuth.verifyToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        name: body.name,
        user: req.user._id
    });

    hospital.save((err, savedHospital) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: savedHospital
        });
    });
});


// ==========================================
// Borrar un hospital
// ==========================================
app.delete('/:id', mdAuth.verifyToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndDelete(id, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!deletedHospital) {
            return res.status(400).json({
                ok: false,
                message: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: deletedHospital
        });
    });
});


module.exports = app;