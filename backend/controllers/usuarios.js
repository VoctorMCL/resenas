'use strict';

let Usuarios = require('../models/usuarios');
let auth = require('../helpers/auth');
let bcrypt = require('bcrypt');

function registrarUsuario(req, resp) {
    let username = req.body.username || req.body.email;
    let password = req.body.password;

    if (!username || !password) {
        return resp.status(400).send({ 'message': 'Debe enviar un email/usuario y password' });
    }

    Usuarios.findOne({ username: username }).then(
        (existente) => {
            if (existente) {
                return resp.status(400).send({ 'message': 'El usuario ya existe' });
            }

            let usuario = new Usuarios({
                'username': username,
                'password': bcrypt.hashSync(password, 10)
            });

            usuario.save().then(
                (usuarioCreado) => {
                    resp.status(201).send({ 'message': 'usuario creado', 'usuario': usuarioCreado });
                },
                err => {
                    resp.status(500).send({ 'message': 'Error al crear el usuario', 'error': err });
                }
            );
        },
        err => {
            resp.status(500).send({ 'message': 'Error al consultar usuario', 'error': err });
        }
    );
}

function loguearUsuario(req, resp) {
    let username = req.body.username || req.body.email;
    let password = req.body.password;

    if (!username || !password) {
        return resp.status(400).send({ 'message': 'Debe enviar un email/usuario y password' });
    }

    Usuarios.findOne({ 'username': username }).then(
        (usuario) => {
            if (!usuario) {
                return resp.status(404).send({ 'message': 'No existe el usuario' });
            }
            if (!bcrypt.compareSync(password, usuario.password)) {
                return resp.status(401).send({ 'message': 'Contraseña incorrecta' });
            }
            resp.status(200).send({
                'token': auth.crearToken(usuario),
                'usuario': { _id: usuario._id, username: usuario.username }
            });
        },
        err => {
            resp.status(500).send({ 'message': 'Error al autenticar usuario', 'error': err });
        }
    );
}

module.exports = { registrarUsuario, loguearUsuario };
