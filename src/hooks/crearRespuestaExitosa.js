
/**
 * Crea una respuesta exitosa con los datos de permisos obtenidos de la API.
 *
 * @param {Array} data - Lista de permisos obtenidos de la API.
 * @returns {Object} - Objeto de respuesta con estado exitoso.
 */
export const crearRespuestaExitosa = (data) => ({
    success: true,
    error: false,
    data: data || [], // Si no hay datos, se retorna un array vacío
    message: "Permisos obtenidos correctamente",
 });