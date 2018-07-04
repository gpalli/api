import * as express from 'express';
import * as configuracionPrestacion from '../schemas/configuracionPrestacion';
import * as mongoose from 'mongoose';
import { Organization } from '../../../modules/cda/controller/class/Organization';
import { tipoPrestacionSchema } from '../../tm/schemas/tipoPrestacion';

let router = express.Router();

router.get('/configuracionPrestaciones/:id*?', function (req, res, next) {
    // Agregar seguridad!!
    // if (!Auth.check(req, 'string')) {
    //     return next(403);
    // }

    if (req.params.id) {
        configuracionPrestacion.configuracionPrestacionModel.findById(req.params.id
            , function (err, data) {
                if (err) {
                    return next(err);
                }
                res.json(data);
            });
    } else {
        let query;
        if (req.query.snomed) {
            query = configuracionPrestacion.configuracionPrestacionModel.find({ 'snomed.conceptId': req.query.snomed });
        }
        if (req.query.organizacion) {
            query = configuracionPrestacion.configuracionPrestacionModel.find({ 'organizaciones._id': req.query.organizacion });
        }
        query.exec(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });
    }
});

/**
Elimina un 'mapeo' (Elemento del arreglo 'organizaciones') de tipoPrestacion - Especialidad - Organicación.

@param {any} idOrganizacion (string)
@param {any} conceptIdSnomed (string)
@param {any} codigoEspecialidad (int)
*/

router.put('/configuracionPrestaciones', function (req, res, next) {

    if (req.body.idOrganizacion && req.body.conceptIdSnomed) {
        let query;
        if (req.body.idEspecialidad) {

            query = configuracionPrestacion.configuracionPrestacionModel.update(
                { 'organizaciones._id': req.body.idOrganizacion, 'snomed.conceptId': req.body.conceptIdSnomed, 'organizaciones.idEspecialidad': req.body.idEspecialidad }
                , { $pull: { 'organizaciones': { '_id': req.body.idOrganizacion } } });

        }
        if (req.body.codigo) {

            query = configuracionPrestacion.configuracionPrestacionModel.update(
                { 'organizaciones._id': req.body.idOrganizacion, 'snomed.conceptId': req.body.conceptIdSnomed, 'organizaciones.codigo': req.body.codigo }
                , { $pull: { 'organizaciones': { '_id': req.body.idOrganizacion } } });
        }
        query.exec(function (err, data) {
            if (err) {
                return next(err);
            }
            res.json(data);
        });

    } else {
        res.status(404).send('Error, parámetros incorrectos.');
    }
});

/**
Inserta un 'mapeo' de tipoPrestacion - Especialidad - Organicación.

@param {any} organizacion
@param {any} conceptSnomed
@param {any} prestacionLegacy
*/
router.post('/configuracionPrestaciones', async function (req, res, next) {

    if (req.body.organizacion && req.body.conceptSnomed && req.body.prestacionLegacy) {
        let idSnomed = req.body.conceptSnomed.conceptId;
        let existeTipoPrestacion = await configuracionPrestacion.configuracionPrestacionModel.findOne({ 'snomed.conceptId': idSnomed });

        if (existeTipoPrestacion) {
            let existeOrganizacion = await configuracionPrestacion.configuracionPrestacionModel.findOne(
                { 'snomed.conceptId': idSnomed, 'organizaciones._id': req.body.organizacion.id });

            if (existeOrganizacion) {
                return next('Este concepto ya se encuentra mapeado');
            } else {
                let newOrganizacion = [{
                    _id: new mongoose.Types.ObjectId(req.body.organizacion.id),
                    'idEspecialidad': req.body.prestacionLegacy.idEspecialidad,
                    'nombreEspecialidad': req.body.prestacionLegacy.nombreEspecialidad,
                    'codigo': req.body.prestacionLegacy.codigo
                }];
                configuracionPrestacion.configuracionPrestacionModel.update({ 'snomed.conceptId': idSnomed }, { $push: { organizaciones: newOrganizacion } }, function (err, resultado) {
                    if (err) {
                        return next(err);
                    } else {
                        res.json(resultado);
                    }
                });
            }
        } else {
            // Se crea el objeto ConfiguracionPrestacion completo
            let newConfigPres = {
                'snomed': req.body.conceptSnomed,
                'organizaciones': [{
                    _id: new mongoose.Types.ObjectId(req.body.organizacion.id),
                    'idEspecialidad': req.body.prestacionLegacy.idEspecialidad,
                    'nombreEspecialidad': req.body.prestacionLegacy.nombreEspecialidad,
                    'codigo': req.body.prestacionLegacy.codigo
                }]
            };
            configuracionPrestacion.configuracionPrestacionModel.create(newConfigPres), function (err, data) {
                if (err) {
                    return next(err);
                }
                res.json(data);
            };
        }
    } else {
        res.status(404).send('Error, parámetros incorrectos.');
    }
});

export = router;
