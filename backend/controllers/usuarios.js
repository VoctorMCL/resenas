'use strict';

let Usuarios = require('../models/usuarios');
let auth = require('../helpers/auth');
let bcrypt = require('bcrypt');

function errorInterno(err, resp, contexto) {
    console.error(contexto, err);
    return resp.status(500).send({ 'message': 'Error interno del servidor' });
}

function registrarUsuario(req, resp) {
    let body = req.body || {};
    let username = body.username || body.email;
    let password = body.password;
    let nombre = body.nombre || body.name;

    if (!username || !password || !nombre || !String(nombre).trim()) {
        return resp.status(400).send({ 'message': 'Debe enviar un email/usuario, password y nombre' });
    }

    Usuarios.findOne({ username: username }).then(
        (existente) => {
            if (existente) {
                return resp.status(400).send({ 'message': 'El usuario ya existe' });
            }

            let usuario = new Usuarios({
                'username': username,
                'password': bcrypt.hashSync(password, 10),
                'nombre': String(nombre).trim()
            });

            usuario.save().then(
                (usuarioCreado) => {
                    resp.status(201).send({
                        'message': 'usuario creado',
                        'usuario': {
                            _id: usuarioCreado._id,
                            username: usuarioCreado.username,
                            nombre: usuarioCreado.nombre
                        }
                    });
                },
                err => errorInterno(err, resp, 'Error al crear usuario')
            );
        },
        err => errorInterno(err, resp, 'Error al consultar usuario')
    );
}

function loguearUsuario(req, resp) {
    let body = req.body || {};
    let username = body.username || body.email;
    let password = body.password;

    if (!username || !password) {
        return resp.status(400).send({ 'message': 'Debe enviar un email/usuario y password' });
    }

    Usuarios.findOne({ 'username': username }).then(
        (usuario) => {
            if (!usuario || !bcrypt.compareSync(password, usuario.password)) {
                return resp.status(401).send({ 'message': 'Credenciales inválidas' });
            }
            resp.status(200).send({
                'token': auth.crearToken(usuario),
                'usuario': { _id: usuario._id, username: usuario.username, nombre: usuario.nombre || usuario.username }
            });
        },
        err => errorInterno(err, resp, 'Error al autenticar usuario')
    );
}

module.exports = { registrarUsuario, loguearUsuario };
