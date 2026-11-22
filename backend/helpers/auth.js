'use strict';

let jwt = require('jwt-simple');
let moment = require('moment');

let secret = process.env.JWT_SECRET || 'essecreto123*';

function crearToken(usuario) {
    let payload = {
        sub: usuario._id,
        username: usuario.username,
        nombre: usuario.nombre || usuario.username,
        iat: moment().unix(),
        exp: moment().add(1, 'days').unix()
    };
    return jwt.encode(payload, secret);
}

function validarToken(req, resp, next) {
    try {
        if (!req.headers.authorization) {
            return resp.status(401).send({ 'message': 'Token no proporcionado' });
        }
        let token = req.headers.authorization.replace('Bearer', '').trim();
        let payload = jwt.decode(token, secret);
        req.userID = payload.sub;
        next();
    } catch (ex) {
        resp.status(401).send({ 'message': 'Token invalido' });
    }
}

module.exports = { crearToken, validarToken };
