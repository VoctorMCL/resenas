'use strict';

let mongoose = require('mongoose');
let application = require('./applications');

let dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/resenas';
let puerto = process.env.PORT || 2307;

mongoose.connect(dbUrl).then(
    () => {
        console.log('Conexion exitosa');
        application.listen(puerto);
    },
    err => {
        console.error(err);
    }
);
