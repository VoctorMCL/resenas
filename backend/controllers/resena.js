'use strict';

let mongoose = require('mongoose');
let Resena = require('../models/resena');

function sinUsuario(resp) {
    return resp.status(401).send({ 'message': 'No se pudo identificar al usuario' });
}

function hoyISO() {
    let fecha = new Date();
    let mes = String(fecha.getMonth() + 1).padStart(2, '0');
    let dia = String(fecha.getDate()).padStart(2, '0');
    return fecha.getFullYear() + '-' + mes + '-' + dia;
}

function esFechaFutura(valor) {
    return String(valor).substring(0, 10) > hoyISO();
}

function idInvalido(id, resp) {
    if (!mongoose.isValidObjectId(id)) {
        resp.status(404).send({ 'message': 'Reseña no encontrada' });
        return true;
    }
    return false;
}

function errorInterno(err, resp, contexto) {
    console.error(contexto, err);
    return resp.status(500).send({ 'message': 'Error interno del servidor' });
}

function formatResena(r) {
    if (!r) return r;
    let obj = r.toObject ? r.toObject() : { ...r };
    delete obj.__v;
    return obj;
}

function crearResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let body = req.body || {};
    let nombreRestaurante = body.nombreRestaurante;
    let calificacion = Number(body.calificacion);
    let fechaVisita = body.fechaVisita;
    let observaciones = body.observaciones;

    if (!nombreRestaurante || isNaN(calificacion) || !fechaVisita ||
        observaciones === undefined || observaciones === null || !String(observaciones).trim()) {
        return resp.status(400).send({
            'message': 'Todos los campos son obligatorios: nombreRestaurante, calificacion, fechaVisita, observaciones'
        });
    }

    if (calificacion < 0 || calificacion > 5) {
        return resp.status(400).send({ 'message': 'La calificación debe ser un número entre 0 y 5' });
    }

    let fecha = new Date(fechaVisita);
    if (isNaN(fecha.getTime())) {
        return resp.status(400).send({ 'message': 'Fecha de visita inválida' });
    }

    if (esFechaFutura(fechaVisita)) {
        return resp.status(400).send({ 'message': 'La fecha de visita no puede ser futura' });
    }

    let nuevaResena = new Resena({
        usuario: req.userID,
        nombreRestaurante: String(nombreRestaurante).trim(),
        calificacion: calificacion,
        fechaVisita: fecha,
        observaciones: String(observaciones).trim()
    });

    nuevaResena.save().then(
        (creada) => {
            resp.status(201).send({
                'message': 'reseña creada',
                'resena': formatResena(creada)
            });
        },
        err => errorInterno(err, resp, 'Error al crear reseña')
    );
}

function consultarResenas(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    Resena.find({ usuario: req.userID }).sort({ fechaVisita: -1 }).then(
        (resenasEncontradas) => {
            resp.status(200).send({ 'resenas': resenasEncontradas.map(formatResena) });
        },
        err => errorInterno(err, resp, 'Error al consultar reseñas')
    );
}

function consultarPorId(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;
    if (idInvalido(id, resp)) return;

    Resena.findOne({ _id: id, usuario: req.userID }).then(
        (resenaEncontrada) => {
            if (!resenaEncontrada) {
                return resp.status(404).send({ 'message': 'Reseña no encontrada' });
            }
            resp.status(200).send({ 'resena': formatResena(resenaEncontrada) });
        },
        err => errorInterno(err, resp, 'Error al consultar reseña')
    );
}

function actualizarResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;
    if (idInvalido(id, resp)) return;

    let body = req.body || {};
    let updateData = {};

    if (body.nombreRestaurante !== undefined) {
        let nombre = String(body.nombreRestaurante).trim();
        if (!nombre) {
            return resp.status(400).send({ 'message': 'El nombre del restaurante no puede estar vacío' });
        }
        updateData.nombreRestaurante = nombre;
    }

    if (body.calificacion !== undefined) {
        let cal = Number(body.calificacion);
        if (isNaN(cal) || cal < 0 || cal > 5) {
            return resp.status(400).send({ 'message': 'La calificación debe ser un número entre 0 y 5' });
        }
        updateData.calificacion = cal;
    }

    if (body.fechaVisita !== undefined) {
        let fecha = new Date(body.fechaVisita);
        if (isNaN(fecha.getTime())) {
            return resp.status(400).send({ 'message': 'Fecha de visita inválida' });
        }
        if (esFechaFutura(body.fechaVisita)) {
            return resp.status(400).send({ 'message': 'La fecha de visita no puede ser futura' });
        }
        updateData.fechaVisita = fecha;
    }

    if (body.observaciones !== undefined) {
        let obs = String(body.observaciones).trim();
        if (!obs) {
            return resp.status(400).send({ 'message': 'Las observaciones no pueden estar vacías' });
        }
        updateData.observaciones = obs;
    }

    if (Object.keys(updateData).length === 0) {
        return resp.status(400).send({ 'message': 'No se enviaron datos para actualizar' });
    }

    Resena.findOneAndUpdate(
        { _id: id, usuario: req.userID },
        { $set: updateData },
        { returnDocument: 'after' }
    ).then(
        (resenaActualizada) => {
            if (!resenaActualizada) {
                return resp.status(404).send({ 'message': 'Reseña no encontrada' });
            }
            resp.status(200).send({
                'message': 'reseña actualizada',
                'resena': formatResena(resenaActualizada)
            });
        },
        err => errorInterno(err, resp, 'Error al actualizar reseña')
    );
}

function eliminarResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;
    if (idInvalido(id, resp)) return;

    Resena.findOneAndDelete({ _id: id, usuario: req.userID }).then(
        (resenaEliminada) => {
            if (!resenaEliminada) {
                return resp.status(404).send({ 'message': 'Reseña no encontrada' });
            }
            resp.status(200).send({
                'message': 'reseña eliminada',
                'resena': formatResena(resenaEliminada)
            });
        },
        err => errorInterno(err, resp, 'Error al eliminar reseña')
    );
}

module.exports = { crearResena, consultarResenas, consultarPorId, actualizarResena, eliminarResena };
