import * as mongoose from 'mongoose';
import * as codificadorSchema from './codificador';

var atomoSchema = new mongoose.Schema({
    nombre: String,
    codigo: codificadorSchema,
    valoresPermitidos: {
        min: Number,
        max: Number,
        unidad: String
    },
    componente: String

});

export = atomoSchema;