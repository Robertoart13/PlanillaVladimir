import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";

/**
 * Thunk para aplicar una planilla a una empresa
 * @param {Object} planillaSeleccionada - Planilla seleccionada para aplicar
 * @param {Object} empresaSeleccionada - Empresa seleccionada para aplicar la planilla
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const Planilla_Aplicar_Thunks = (planillaSeleccionada, empresaSeleccionada, estadoNuevo) => {
   return async (dispatch, getState) => {
      try {
         // Obtener datos del usuario autenticado desde el estado de la aplicación
         const { user } = getState().auth;

         // Validación de datos: verificar que el usuario esté autenticado
         if (!user?.id_usuario) return crearRespuestaError("Usuario no autenticado.");

         // Construcción de la transacción para la creación del nuevo usuario
         const transaccion = {
            user: {
               id: parseInt(user.id_usuario), // id usuario auth
            },
            planilla: {
               planillaSeleccionada: planillaSeleccionada, // Planilla seleccionada para aplicar
               empresaSeleccionada: empresaSeleccionada, // Empresa seleccionada para aplicar la planilla
               estadoNuevo: estadoNuevo,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details:
                  "No tiene permisos para aplicar planillas, contacte al administrador del sistema",
            },
         };

         const endpoint = "planilla/aplicar_planilla"; // Endpoint para editar una planilla

         // Realizar la petición a la API usando ApiProvider
         const resultado = await ApiProvider({ transaccion, endpoint });

         // Verificar si la respuesta contiene errores
         const error = verificarErroresRespuesta(resultado);
         if (error) return error; // Si hay un error, devolver la respuesta de error

         // Si la solicitud es exitosa, retornar los datos de la empresa creada
         return crearRespuestaExitosa(resultado?.data);
      } catch (error) {
         // Si ocurre un error durante la ejecución, devolver el error con un mensaje adecuado
         return crearRespuestaError(error.message);
      }
   };
};
