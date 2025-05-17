import { validarBasedeDatos } from "./validarBasedeDatos.js";
import { validarUsuario } from "./validarUsuario.js";

/**
 * Realiza validaciones iniciales antes de consultar la información de un permiso.
 * Verifica la conexión a la base de datos y la existencia del usuario en la transacción.
 *
 * @param {Object} res - Objeto de respuesta con datos de la transacción.
 * @param {Object} res.database - Información de la base de datos a validar.
 * @param {Object} res.transaccion - Información de la transacción.
 * @param {Object} res.transaccion.user - Información del usuario en la transacción.
 * @param {string} res.transaccion.user.id - ID del usuario a validar.
 * @returns {Promise<Object|null>} Objeto de error si falla la validación, o `null` si es exitosa.
 *
 * @example
 * const resultado = await realizarValidacionesIniciales({ database: "miDB", transaccion: { user: { id: "123" } } });
 * if (resultado) {
 *   console.error("Error en validaciones:", resultado);
 * } else {
 *   console.log("Validaciones exitosas");
 * }
 */
export const realizarValidacionesIniciales = async (res) => {
    // Validar la conexión a la base de datos
    const validacion = await validarBasedeDatos(res?.database);
    if (!validacion.success) return validacion;
 
    // Validar la existencia del usuario en la transacción
    const validacionUsuario = await validarUsuario(res?.transaccion?.user?.id);
    if (!validacionUsuario.success) return validacionUsuario;
 
    return null;
};
