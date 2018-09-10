import * as mongoose from 'mongoose';

/**
 * Función recursiva que permite recorrer un objeto y todas sus propiedades
 * y al llegar a un nodo hoja ejecutar una funcion
 * @param {any} obj Objeto a recorrer
 * @param {any} func Nombre de la función callback a ejecutar cuando llega a un nodo hoja
 */
export function iterate(obj, func) {
    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (Array.isArray(obj[property])) {
                iterate(obj[property], func);
            } else if (typeof obj[property] === 'object') {
                iterate(obj[property], func);
            } else {
                func(obj, property);
            }
        }
    }
}


/**
 * Convierte las propiedades '_id' y 'id' de un objeto al tipo ObjectId
 *
 * @param {any} obj Objeto
 * @param {string} property Propiedad
 */
export function convertToObjectId(obj, property: string) {
    if (property === 'id' || property === '_id') {
        // verificamos si es un ObjectId valido y, ademas,
        // si al castear a ObjectId los strings son iguales
        // StackOverflow: https://stackoverflow.com/a/29231016
        if (mongoose.Types.ObjectId.isValid(obj[property]) && new mongoose.Types.ObjectId(obj[property]) === obj[property]) {
            obj[property] = mongoose.Types.ObjectId(obj[property]);
        }
    }
}

/**
 * Devuelve prestaciones en las que contengan alguno de los conceptos
 * enviados por parametro dentro de su array de registros
 *
 * @param {any} prestaciones Array de prestaciones a recorrer y buscar
 * @param {any[]} conceptos Array con conceptos mas específicos a filtrar dentro de los registros
 * @returns {any[]} Prestaciones que matcheen con los conceptos ingresados por parametro
 */
export function buscarRegistros(prestaciones, filtroPrestaciones, conceptos) {
    let data = [];
    // recorremos prestaciones
    prestaciones.forEach((prestacion: any) => {

        let registros = [];
        let registrosAux = [];
        let motivoConsulta;
        // recorremos los registros de cada prestacion
        prestacion.ejecucion.registros.forEach(reg => {
            if (filtroPrestaciones.find(fp => fp.conceptId === reg.concepto.conceptId)) {
                motivoConsulta = { term: reg.concepto.term, conceptId: reg.concepto.conceptId };
                registrosAux = registrosProfundidad(reg, conceptos);
                registrosAux.forEach(elto => {
                    registros.push(elto);
                });
            }
        });
        if (registros.length) {
            // se agrega la prestacion y los conceptos matcheados al arreglo a retornar
            data.push({
                motivo: motivoConsulta,
                fecha: prestacion.createdAt,
                profesional: prestacion.createdBy,
                conceptos: registros
            });
        }
    });
    return data;
}

/**
 * Método recursivo que busca los conceptos enviados por parametro
 * dentro del array de registros de una prestación
 *
 * @param {any} registro Registro actual a consultar por conceptId o ver si tiene un subarray de registros para seguir loopeando
 * @param {any} conceptos Array con conceptId de SNOMED a buscar dentro de la variable registro
 * @returns {any} Array con todos los conceptos que matchearon
 */
export function registrosProfundidad(registro, conceptos) {
    // almacenamos la variable de matcheo para devolver el resultado
    let data = [];

    if (registro.registros && registro.registros.length) {
        registro.registros.forEach((reg: any) => {
            let dataAux = registrosProfundidad(reg, conceptos);
            dataAux.forEach(elto => {
                data.push(elto);
            });
        });
    }
    if (registro.concepto && registro.concepto.conceptId && conceptos.find(c => c.conceptId === registro.concepto.conceptId)) {
        data.push({
            nombre: registro.nombre,
            concepto: registro.concepto,
            valor: registro.valor,
            id: registro.id
        });
    }
    return data;
}


export function buscarEnHuds(prestaciones, conceptos) {
    let data = [];

    // recorremos prestaciones
    prestaciones.forEach((prestacion: any) => {
        // recorremos los registros de cada prestacion
        prestacion.ejecucion.registros.forEach(unRegistro => {
            // verificamos que el concepto coincida con alguno de los elementos enviados en los conceptos
            if (unRegistro.concepto && unRegistro.concepto.conceptId && conceptos.find(c => c.conceptId === unRegistro.concepto.conceptId)) {
                data.push({
                    tipoPrestacion: prestacion.solicitud.tipoPrestacion,
                    fecha: unRegistro.createdAt,
                    profesional: unRegistro.createdBy,
                    registro: unRegistro
                });
            }
            // verificamos si el registro de la prestacion tiene alguno de
            // los conceptos en su array de registros
            let resultado = matchConcepts(unRegistro, conceptos);

            if (resultado) {
                // agregamos el resultado a a devolver
                data.push({
                    tipoPrestacion: prestacion.solicitud.tipoPrestacion,
                    fecha: unRegistro.createdAt,
                    profesional: unRegistro.createdBy,
                    registro: resultado
                });
            }
        });
    });

    return data;
}


export function matchConcepts(registro, conceptos) {
    // almacenamos la variable de matcheo para devolver el resultado
    let match = false;

    if (!Array.isArray(registro['registros']) || registro['registros'].length <= 0) {
        // verificamos que el concepto coincida con alguno de los elementos enviados en los conceptos
        if (registro.concepto && registro.concepto.conceptId && conceptos.find(c => c.conceptId === registro.concepto.conceptId)) {
            match = registro;
        }
    } else {
        registro['registros'].forEach((reg: any) => {
            let encontrado = null;
            if (encontrado = matchConcepts(reg, conceptos)) {
                match = encontrado;
            }
        });
    }
    return match;
}
