/**
 * Función auxiliar para crear un objeto de respuesta de error
 * @param {string} mensaje - Mensaje de error
 * @returns {Object} Objeto de respuesta con formato estandarizado
 */
export const crearRespuestaError = (mensaje) => {
  return {
    success: false,
    error: true,
    data: [],
    message: mensaje,
  };

  return null;
};
