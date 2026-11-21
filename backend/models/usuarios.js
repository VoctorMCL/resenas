'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UsuarioSchema = Schema(
    {
        username: { type: String, required: true, trim: true, unique: true },
        password: { type: String, required: true }
    }
);

module.exports = mongoose.model('usuarios', UsuarioSchema);
