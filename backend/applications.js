'use strict';

let express = require('express');
let cors = require('cors');
let routerResenas = require('./routes/resena');
let routerUsuarios = require('./routes/usuarios');

let application = express();
application.use(express.json());
application.use(cors());
application.use(routerResenas);
application.use(routerUsuarios);

module.exports = application;
