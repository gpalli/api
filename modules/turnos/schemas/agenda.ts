import * as prestacionSchema from './prestacion';
import * as nombreSchema from '../../../core/tm/schemas/nombre';
import * as nombreApellidoSchema from '../../../core/tm/schemas/nombreApellido';
import * as mongoose from 'mongoose';

var agendaSchema = new mongoose.Schema({
    prestaciones: [prestacionSchema],
    profesionales: [nombreApellidoSchema],
    espacioFisico: nombreSchema,
    horaInicio: Date,
    horaFin: Date,
    intercalar: Boolean,
    bloques: [{
        horaInicio: Date,
        horaFin: Date,
        cantidadTurnos: Number,
        duracionTurno: Number,
        descripcion: String,
        prestaciones: [prestacionSchema],

        accesoDirectoDelDia: Number,
        accesoDirectoProgramado: Number,
        reservadoGestion: Number,
        reservadoProfesional: Number,

        pacienteSimultaneos: Boolean,
        cantidadSimultaneos: Number,
        citarPorBloque: Boolean,
        cantidadBloque: Number,
        turnos: [{
            horaInicio: Date,
            asistencia: {
                type: Boolean,
                default: false
            },
            estado: {
                type: String,
                enum: ["disponible", "asignado", "bloqueado"]
            },
            paciente: {//pensar que otros datos del paciente conviene tener
                id: mongoose.Schema.Types.ObjectId,
                nombre: String,
                apellido: String,
                documento: String,
                telefono: String
            },
            prestacion: prestacionSchema
        }],
    }],

    estado: {
        type: String,
        enum: ["", "Planificada", "Publicada", "Suspendida"]
    }
});
// },{validateBeforeSave:false});

//Defino Virtuals
agendaSchema.virtual('turnosDisponibles').get(function () {
    let turnosDisponibles = 0;
    let cantidad = 0;
    this.bloques.forEach(function (bloque) {
        bloque.turnos.forEach(function (turno) {
            if (turno.estado == "disponible") {
                turnosDisponibles++;
            }
        });
    });
    return turnosDisponibles;
});

var agenda = mongoose.model('agenda', agendaSchema, 'agenda');

export = agenda;