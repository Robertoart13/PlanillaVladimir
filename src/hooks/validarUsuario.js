import { crearRespuesta } from "../mysql2-promise/mysql2-promise.js";

/** ====================================================================================================================================
 * Valida si el usuario está disponible y devuelve una respuesta estandarizada.
 * @param {Object} usuario - Objeto de usuario
 * @returns {Object} Respuesta estandarizada con la siguiente estructura:
 *  - `success: false` indicando que la operación ha fallado.
 *  - `status` el código de estado HTTP proporcionado.
 *  - `message` el mensaje amigable para el usuario.
 *  - `details` detalles técnicos adicionales (si fueron proporcionados, o el mensaje del error).
 */
export const validarUsuario = async (usuario) => {
    if(!usuario || usuario <= 0) return {
       success: false,
       respuesta: crearRespuesta(
          false,
          404,
          "resultado de la consulta: validarUsuario()",
          [],
          {
             details: "revisar los datos enviados de usuario ",
          },
       ),
    };
    return { success: true };
 };