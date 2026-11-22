'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ResenaSchema = Schema(
    {
        usuario: { type: Schema.Types.ObjectId, ref: 'usuarios', required: true },
        nombreRestaurante: { type: String, required: true },
        calificacion: { type: Number, required: true },
        fechaVisita: { type: Date, required: true },
        observaciones: { type: String, required: true }
    }
);

module.exports = mongoose.model('resenas', ResenaSchema);
