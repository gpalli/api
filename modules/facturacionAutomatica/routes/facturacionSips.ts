import * as mongoose from 'mongoose';
import * as express from 'express';
import * as facturacionCtrl from '../controllers/facturacionCtrl';
import * as organizacion from '../../../core/tm/schemas/organizacion';
import { configuracionPrestaciones } from '../controllers/operationsCtrl/operationsSumar';

let router = express.Router();

router.get('/facturacion', function (req, res, next) {
    try {
        let result = facturacionCtrl.facturacionCtrl();
        res.json(result);
    } catch (error) {
        res.end(error);
    }
});

router.get('/facturacion/SUMAR/turnos', async function (req, res, next) {
    try {
        let result = await facturacionCtrl.getTurnosPendientesSumar();
        res.json(result);
    } catch (error) {
        res.end(error);
    }
});

router.get('/efector/:id', async function (req, res, next) {
    try {
        organizacion.model.findById( {_id: req.params.id}, function (err, _organizacion: any) {
            if (err) {
                return next(err);
            };

            res.json(_organizacion ? _organizacion.codigo.cuie : null);
        });
    } catch (error) {
        res.end(error);
    }
});

export = router;
