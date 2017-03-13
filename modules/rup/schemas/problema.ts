import * as mongoose from 'mongoose';
import * as codificadorSchema from './codificador';
import * as organizacion from '../../../core/tm/schemas/organizacion';
import { profesionalSchema } from '../../../core/tm/schemas/profesional';
import { segundaOpinionSchema } from './segundaOpinion';

var problemaSchema = new mongoose.Schema({
    tipoProblema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tipoProblema'
    },
    idProblemaOrigen: [{
        type: mongoose.Schema.Types.ObjectId
    }],
    paciente:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'paciente'
    },
    codificador: codificadorSchema,
    fechaInicio: Date,
    // activo: Boolean,  
    evoluciones: [{
        fecha: Date,
        activo: Boolean,
        observacion: String,
        profesional: [profesionalSchema],
        organizacion: organizacion.schema,
        //ambito: // TODO
        duracion: {
            type: String,
            enum: ['cronico', 'agudo']
        },
        vigencia: {
            type: String,
            enum: ['activo', 'inactivo', 'resuelto', 'transformado', 'enmendado']
        },
        // campo destinado a segundas opiniones o auditorias de las prestaciones
        segundaOpinion: [segundaOpinionSchema]
    }]
});

var problema = mongoose.model('problema', problemaSchema, 'problema');

export = problema;
