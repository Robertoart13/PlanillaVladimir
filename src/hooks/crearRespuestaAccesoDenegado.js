import { crearRespuesta } from "../mysql2-promise/mysql2-promise.js";

/**
 * Crea una respuesta estructurada para indicar que el usuario no tiene permisos suficientes.
 * Devuelve un objeto con `success: false` y un código de error HTTP 403.
 *
 * @param {string} mensaje - Mensaje de error para el usuario final.
 * @param {string} detalle - Información adicional sobre la razón del acceso denegado (se almacena en `metadata.details`).
 * @returns {Object} Objeto con la estructura de `crearRespuesta`, incluyendo código 403 y detalles del error.
 *
 * @example
 * const respuesta = crearRespuestaAccesoDenegado("Acceso denegado", "El usuario no tiene permisos para acceder a este recurso.");
 * console.log(respuesta);
 * // {
 * //    success: false,
 * //    respuesta: {
 * //        success: false,
 * //        codigo: 403,
 * //        mensaje: "Acceso denegado",
 * //        data: [],
 * //        metadata: { details: "El usuario no tiene permisos para acceder a este recurso." }
 * //    }
 * // }
 */

export const crearRespuestaAccesoDenegado = (mensaje, detalle) => {
    return {
       success: false,
       respuesta: crearRespuesta(false, 403, mensaje, [], {
          details: detalle
       }),
    };
};