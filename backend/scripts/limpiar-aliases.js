'use strict';

// Migración puntual: elimina los campos duplicados que se guardaron en versiones anteriores.
let mongoose = require('mongoose');
let dbUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/resenas';

mongoose.connect(dbUrl).then(async () => {
    let resultado = await mongoose.connection.db.collection('resenas').updateMany(
        {},
        { $unset: { restaurante: '', comentario: '', fecha: '' } }
    );
    console.log('Documentos limpiados: ' + resultado.modifiedCount);
    await mongoose.disconnect();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
