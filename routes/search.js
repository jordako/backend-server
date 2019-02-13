var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

app.get('/all/:searchText', (req, res, next) => {

  var searchText = req.params.searchText;
  var regex = new RegExp(searchText, 'i');

  Promise.all([
    searchHospitals(searchText, regex),
    searchDoctors(searchText, regex),
    searchUsers(searchText, regex)
  ]).then(responses => {

    res.status(200).json({
      ok: true,
      hospitals: responses[0],
      doctors: responses[1],
      users: responses[2]
    });

  });

});

function searchHospitals(searchText, regex) {

  return new Promise((resolve, reject) => {
    Hospital
      .find({ name: regex })
      .populate('user', 'name email role')
      .exec((err, hospitals) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitals);
        }
      });
  });
}

function searchDoctors(searchText, regex) {

  return new Promise((resolve, reject) => {
    Doctor
      .find({ name: regex })
      .populate('user', 'name email role')
      .populate('hospital')
      .exec((err, doctors) => {
        if (err) {
          reject('Error al cargar médicos', err);
        } else {
          resolve(doctors);
        }
      });
  });
}

function searchUsers(searchText, regex) {

  return new Promise((resolve, reject) => {
    User.find({}, 'name email role')
      .or([{ name: regex }, { email: regex }])
      .exec((err, users) => {
        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(users);
        }
      });
  });
}

module.exports = app;