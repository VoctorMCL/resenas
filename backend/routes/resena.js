'use strict';

let express = require('express');
let router = express.Router();
let resenaController = require('../controllers/resena');
let auth = require('../helpers/auth');

router.post('/api/resena', auth.validarToken, resenaController.crearResena);
router.get('/api/resenas', auth.validarToken, resenaController.consultarResenas);
router.get('/api/resena/:_id', auth.validarToken, resenaController.consultarPorId);
router.put('/api/resena/:_id', auth.validarToken, resenaController.actualizarResena);
router.delete('/api/resena/:_id', auth.validarToken, resenaController.eliminarResena);

module.exports = router;
