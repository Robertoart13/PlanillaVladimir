import { crearRespuestaError } from "./crearRespuestaError";

/**
 * Verifica si hay errores en la respuesta de la API.
 *
 * Maneja y clasifica diferentes tipos de errores en las respuestas de la API, incluyendo:
 * - Errores de servidor (500)
 * - Recurso no encontrado (404)
 * - Permisos denegados (403)
 * - Errores de validación (422)
 * - Errores de duplicado
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
    if (status === 500) {
        // Manejar errores específicos de duplicado
        if (error?.details && error.details.includes('Duplicate entry')) {
            return crearRespuestaError(error.details);
        }
        return crearRespuestaError(error?.details || "Error interno del servidor");
    }
 
    // Recurso no encontrado
    if (respuesta?.status === 404) return crearRespuestaError(respuesta?.error?.details || "Recurso no encontrado");
 
    // Permiso denegado
    if (respuesta?.status === 403) return crearRespuestaError(respuesta?.error?.details || "Acceso denegado");

    // Error de validación o duplicado
    if (respuesta?.status === 422) {
        const errorMessage = respuesta?.errorMessage || respuesta?.error?.details || "Error de validación";
        return crearRespuestaError(errorMessage);
    }

    // Manejar errores de duplicado específicos
    if (respuesta?.error && respuesta.error.includes('Duplicate entry')) {
        return crearRespuestaError(respuesta.error);
    }

    // Manejar otros errores de respuesta
    if (respuesta?.error) {
        return crearRespuestaError(respuesta.error);
    }
 
    return null; // Si no hay errores, retornar `null`
 };