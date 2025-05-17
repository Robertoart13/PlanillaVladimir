import { crearRespuesta } from "../mysql2-promise/mysql2-promise.js";


// Función para limpiar los caracteres especiales en el mensaje
function limpiarCaracteresEspeciales(str) {
   return str.replace(/[^\w\s]/gi, '');  // Elimina cualquier carácter no alfanumérico
 }
/**
 * Genera una respuesta estructurada cuando la creación del tipo de movimiento falla.
 *
 * @returns {Object} Respuesta de error.
 */
export const crearRespuestaErrorCrear = (ErrorMensaje) => {
    return {
       success: false,
       respuesta: crearRespuesta(false, 404, "Error en la transacccion", [], {
          details: limpiarCaracteresEspeciales(ErrorMensaje),
       }),
    };
 };

 export const crearRespuestaErrorCrearSinCaracteresEspeciales = (ErrorMensaje) => {
   return {
      success: false,
      respuesta: crearRespuesta(false, 404, "Error en la transacccion", [], {
         details: ErrorMensaje,
      }),
   };
};