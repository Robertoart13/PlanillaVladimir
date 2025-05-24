import { crearRespuestaError } from "./crearRespuestaError";

/**
 * Verifica si hay errores en la respuesta de la API.
 *
 * Maneja y clasifica diferentes tipos de errores en las respuestas de la API, incluyendo:
 * - Errores de servidor (500)
 * - Recurso no encontrado (404)
 * - Permisos denegados (403)
 *
 * Retorna un objeto con el error si ocurre uno, o `null` si la respuesta es válida.
 *
 * @param {Object} resultado - Respuesta de la API obtenida tras la petición.
 * @returns {Object|null} - Objeto con el error o `null` si la respuesta es válida.
 */
export const verificarErroresRespuesta = (resultado) => {
    
    const { data } = resultado || {};

 
    if (!data) return crearRespuestaError("Respuesta de la API no válida.");
 
    const { status, error, respuesta } = data;
 
    // Errores de servidor
    if (status === 500) return crearRespuestaError(error?.details);
 
    // Recurso no encontrado
    if (respuesta?.status === 404) return crearRespuestaError(respuesta?.error?.details);
 
    // Permiso denegado
    if (respuesta?.status === 403) return crearRespuestaError(respuesta?.error?.details);

    // Error al editar el permiso
    if (respuesta?.status === 422) return crearRespuestaError(respuesta?.errorMessage);
 
    return null; // Si no hay errores, retornar `null`
 };