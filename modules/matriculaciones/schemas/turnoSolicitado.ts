import * as mongoose from 'mongoose';
import * as ubicacionSchema from '../../../core/tm/schemas/ubicacion';
import * as constantes from '../../../core/tm/schemas/constantes';
import * as direccionSchema from '../../../core/tm/schemas/direccion';
import * as contactoSchema from '../../../core/tm/schemas/contacto';
import * as especialidadSchema from '../../../core/tm/schemas/especialidad';
import * as paisSchema from '../../../core/tm/schemas/pais';
import * as profesionSchema from '../../../core/tm/schemas/profesion';
import { ObjSIISASchema } from '../../../core/tm/schemas/siisa';

let matriculacionSchema = new mongoose.Schema({
    matriculaNumero: { type: Number, required: false },
    libro: { type: String, required: false },
    folio: { type: String, required: false },
    inicio: Date,
    fin: Date,
    revalidacionNumero: Number
});


export let turnoSolicitadoSchema = new mongoose.Schema({
// Persona
    habilitado: { type: Boolean, default: true },
    nombre: { type: String, required: false },
    apellido: { type: String, required: false },
    documento: { type: String, required: false },
    documentoVencimiento: { type: Date, required: false },
    cuit: { type: String, required: false },
    fechaNacimiento: { type: Date, required: false },
    lugarNacimiento: { type: String, required: false },
    fechaFallecimiento: { type: Date, required: false },
    nacionalidad: { type: ObjSIISASchema, required: false },
    sexo: { type: String, required: false },
    estadoCivil: constantes.ESTADOCIVIL,
    contactos: [contactoSchema],
    domicilios: [direccionSchema],
    fotoArchivo: { type: String, required: false },
    firmas: [{
        imgArchivo: { type: String, required: false },
        fecha: { type: String, required: false },
    }],
// ??
    incluidoSuperintendencia: { type: Boolean, default: false },
// Formacion
    formacionGrado: [{
        profesion: { type: ObjSIISASchema, required: false },
        entidadFormadora: { type: ObjSIISASchema, required: false },
        titulo: { type: String, required: false },
        fechaTitulo: { type: Date, required: false },
        fechaEgreso: { type: Date, required: false },
        revalida: { type: Boolean, default: false },
        matriculacion: [matriculacionSchema]
    }],
    formacionPosgrado: [{
         profesion: { type: ObjSIISASchema, required: false },
         institucionFormadora: { type: ObjSIISASchema, required: false },
         especialidad: { type: ObjSIISASchema, required: false },
         fechaIngreso: { type: Date, required: false },
         fechaEgreso: { type: Date, required: false },
         observacion: String,
         certificacion: {
           fecha: { type: Date, required: false },
             modalidad: { type: ObjSIISASchema, required: false },
             establecimiento: { type: ObjSIISASchema, required: false },
         },
         matriculacion: [matriculacionSchema]
     }],
    // origen: {
    //     type: String,
    //     enum: ['matriculación', 'rrhh', 'colegio de psicólogos']
    // },
    sanciones: [{
         numero: {type: Number, required: false},
         sancion: {
            id: Number,
            nombre: String,
        },
        motivo: {type: String, required: false},
        normaLegal: {type: String, required: false},
         fecha: {type: Date, required: false},
         vencimiento: {type: Date, required: false}
     }],
     notas: { type: String, required: false },
});


// Virtuals
turnoSolicitadoSchema.virtual('nombreCompleto').get(function() {
    return this.apellido + ', ' + this.nombre;

});

turnoSolicitadoSchema.virtual('edad').get(function() {
    let ageDifMs = Date.now() - this.fechaNacimiento.getTime();
    let ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
});

turnoSolicitadoSchema.virtual('fallecido').get(function() {
    return this.fechaFallecimiento;
});

// profesionalSchema.virtual('ultimaFirma').get(function() {
//     return this.firmas.sort((a, b) => {
//         return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
//     })[0];
// });

export let turnoSolicitado = mongoose.model('turnoSolicitado', turnoSolicitadoSchema, 'turnoSolicitado');
