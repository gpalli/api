import * as express from 'express';
import * as carpetaPaciente from '../schemas/carpetaPaciente';

let router = express.Router();

/**
 * @swagger
 * definition:
 *   carpetaPaciente:
 *     properties:
 *      id:
 *          type: string
 *      documento:
 *          type: string
 *      carpetaEfectores:
 *          type: array
 *          items:
 *              type: object
 *              properties:
 *                  organizacion:
 *                      type: object
 *                      properties:
 *                          nombre:
 *                              type: string
 *                  idPaciente:
 *                      type: string
 *                  nroCarpeta:
 *                      type: string
 */

/**
 * @swagger
 * /carpetasPacientes/{id}:
 *   get:
 *     tags:
 *       - CarpetaPaciente
 *     description: Retorna el numero de Carpeta del Paciente, dependiendo del efector
 *     summary: Numero de Carpeta del Efector
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: documento
 *         in: query
 *         description: El documento del paciente
 *         required: false
 *         type: string
 *       - name: organizacion
 *         in: query
 *         description: El id de la organizacion donde se encuentra la carpeta del Paciente
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: un arreglo de objetos carpetaPaciente
 *         schema:
 *           $ref: '#/definitions/carpetaPaciente'
 */

router.get('/carpetasPacientes/:id*?', function(req, res, next) {

    if (req.params.id) {
        carpetaPaciente.findById(req.params.id, function(err, data) {
            if (err) {
                next(err);
            };
            res.json(data);
        });
    } else {
        let query;
        query = carpetaPaciente.find({});
        console.log(req.query);
        if (req.query.documento) {
            query.where('documento').equals(req.query.documento);
        }
        if (req.query.organizacion) {
            query.where('carpetaEfectores.organizacion._id').equals(req.query.organizacion);
        }

        query.exec((err, data) => {
            if (err) {
                return next(err);
            };
           res.json(data);
        });
    }


});


export = router;