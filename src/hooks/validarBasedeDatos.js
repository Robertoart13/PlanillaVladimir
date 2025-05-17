import { crearRespuesta } from "../mysql2-promise/mysql2-promise.js";

/** ====================================================================================================================================
 * Valida si la base de datos está disponible y devuelve una respuesta estandarizada.
 * @param {Object} database - Objeto de conexión a la base de datos
 * @returns {Object} Respuesta estandarizada con la siguiente estructura:
 *  - `success: false` indicando que la operación ha fallado.
 *  - `status` el código de estado HTTP proporcionado.
 *  - `message` el mensaje amigable para el usuario.
 *  - `details` detalles técnicos adicionales (si fueron proporcionados, o el mensaje del error).
 */
export const validarBasedeDatos = async (database) => {
    if(!database) return {
       success: false,
       respuesta: crearRespuesta(
          false,
          404,
          "resultado de la consulta: validarBasedeDatos()", 
          [],
          {
             details: "revisa tu conexión a la base de datos",
          },
       ),
    };
    return { success: true };
 };
 
 
 
 