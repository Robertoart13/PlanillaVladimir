/**
 * Crea un objeto de respuesta exitosa con los datos proporcionados.
 *
 * @param {Array|Object} datos - Datos a incluir en la respuesta.
 * @returns {{ success: boolean, array: Array|Object }} Objeto de respuesta con el estado de éxito y los datos.
 */
export const crearRespuestaExitosa = (datos) => {
    return {
       success: true,
       array: datos,
    };
};
