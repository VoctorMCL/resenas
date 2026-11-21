'use strict';

let mongoose = require('mongoose');
let Resena = require('../models/resena');

function sinUsuario(resp) {
    return resp.status(401).send({ 'message': 'No se pudo identificar al usuario' });
}

function formatResena(r) {
    if (!r) return r;
    let obj = r.toObject ? r.toObject() : { ...r };
    delete obj.__v;

    let nombre = obj.nombreRestaurante || obj.restaurante || '';
    let obs = obj.observaciones || obj.comentario || '';
    let fec = obj.fechaVisita || obj.fecha || null;

    obj.nombreRestaurante = nombre;
    obj.restaurante = nombre;
    obj.observaciones = obs;
    obj.comentario = obs;
    obj.fechaVisita = fec;
    obj.fecha = fec;

    return obj;
}

function crearResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let body = req.body || {};
    let nombreRestaurante = body.nombreRestaurante || body.restaurante;
    let calificacion = Number(body.calificacion);
    let fechaVisita = body.fechaVisita || body.fecha;
    let observaciones = body.observaciones !== undefined ? body.observaciones : body.comentario;

    if (!nombreRestaurante || isNaN(calificacion) || !fechaVisita || !observaciones) {
        return resp.status(400).send({
            'message': 'Todos los campos son obligatorios: nombreRestaurante, calificacion, fechaVisita, observaciones'
        });
    }

    if (calificacion < 1 || calificacion > 5) {
        return resp.status(400).send({ 'message': 'La calificación debe ser un número entre 1 y 5' });
    }

    let fecha = new Date(fechaVisita);
    if (isNaN(fecha.getTime())) {
        return resp.status(400).send({ 'message': 'Fecha de visita inválida' });
    }

    let nuevaResena = new Resena({
        usuario: req.userID,
        nombreRestaurante: String(nombreRestaurante).trim(),
        calificacion: calificacion,
        fechaVisita: fecha,
        observaciones: String(observaciones).trim(),
        // Aliases para compatibilidad
        restaurante: String(nombreRestaurante).trim(),
        comentario: String(observaciones).trim(),
        fecha: fecha
    });

    nuevaResena.save().then(
        (creada) => {
            resp.status(201).send({
                'message': 'reseña creada',
                'resena': formatResena(creada),
                'review': formatResena(creada)
            });
        },
        err => {
            resp.status(500).send({ 'message': 'internal error in database', 'error': err });
        }
    );
}

function consultarResenas(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    // Los usuarios solo pueden visualizar SUS propias reseñas
    Resena.find({ usuario: req.userID }).sort({ fechaVisita: -1 }).then(
        (resenasEncontradas) => {
            let lista = resenasEncontradas.map(formatResena);
            resp.status(200).send({
                'resenas': lista,
                'reviews': lista,
                'resena': lista
            });
        },
        err => {
            resp.status(500).send({ 'message': 'internal error in database', 'error': err });
        }
    );
}

function consultarPorId(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;

    // Solo puede consultar si pertenece a su usuario
    Resena.findOne({ _id: id, usuario: req.userID }).then(
        (resenaEncontrada) => {
            if (!resenaEncontrada) {
                return resp.status(404).send({ 'message': 'Reseña no encontrada' });
            }
            resp.status(200).send({
                'resena': formatResena(resenaEncontrada),
                'review': formatResena(resenaEncontrada)
            });
        },
        err => {
            resp.status(500).send({ 'message': 'internal error in database', 'error': err });
        }
    );
}

function actualizarResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;
    let body = req.body || {};
    let updateData = {};

    if (body.nombreRestaurante !== undefined || body.restaurante !== undefined) {
        let nombre = String(body.nombreRestaurante || body.restaurante).trim();
        if (!nombre) {
            return resp.status(400).send({ 'message': 'El nombre del restaurante no puede estar vacío' });
        }
        updateData.nombreRestaurante = nombre;
        updateData.restaurante = nombre;
    }

    if (body.calificacion !== undefined) {
        let cal = Number(body.calificacion);
        if (isNaN(cal) || cal < 1 || cal > 5) {
            return resp.status(400).send({ 'message': 'La calificación debe ser un número entre 1 y 5' });
        }
        updateData.calificacion = cal;
    }

    if (body.fechaVisita !== undefined || body.fecha !== undefined) {
        let fecha = new Date(body.fechaVisita || body.fecha);
        if (isNaN(fecha.getTime())) {
            return resp.status(400).send({ 'message': 'Fecha de visita inválida' });
        }
        updateData.fechaVisita = fecha;
        updateData.fecha = fecha;
    }

    if (body.observaciones !== undefined || body.comentario !== undefined) {
        let obs = String(body.observaciones !== undefined ? body.observaciones : body.comentario).trim();
        if (!obs) {
            return resp.status(400).send({ 'message': 'Las observaciones no pueden estar vacías' });
        }
        updateData.observaciones = obs;
        updateData.comentario = obs;
    }

    if (Object.keys(updateData).length === 0) {
        return resp.status(400).send({ 'message': 'No se enviaron datos para actualizar' });
    }

    // Solo actualiza si pertenece a su propio usuario
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
                'resena': formatResena(resenaActualizada),
                'review': formatResena(resenaActualizada)
            });
        },
        err => {
            resp.status(500).send({ 'message': 'internal error in database', 'error': err });
        }
    );
}

function eliminarResena(req, resp) {
    if (!req.userID) return sinUsuario(resp);

    let id = req.params._id || req.params.id;

    // Solo elimina si pertenece a su propio usuario
    Resena.findOneAndDelete({ _id: id, usuario: req.userID }).then(
        (resenaEliminada) => {
            if (!resenaEliminada) {
                return resp.status(404).send({ 'message': 'Reseña no encontrada' });
            }
            resp.status(200).send({
                'message': 'reseña eliminada',
                'resena': formatResena(resenaEliminada),
                'review': formatResena(resenaEliminada)
            });
        },
        err => {
            resp.status(500).send({ 'message': 'internal error in database', 'error': err });
        }
    );
}

module.exports = { crearResena, consultarResenas, consultarPorId, actualizarResena, eliminarResena };
