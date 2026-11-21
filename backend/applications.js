'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
let routerResenas = require('./routes/resena');
let routerUsuarios = require('./routes/usuarios');

let application = express();
application.use(bodyParser.json());
application.use(cors());
application.use(routerResenas);
application.use(routerUsuarios);

module.exports = application;
