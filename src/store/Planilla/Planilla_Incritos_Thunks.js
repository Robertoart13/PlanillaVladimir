import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Planilla_Incritos_Thunks = (formData) => {
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
               formData,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details:
                  "No tiene permisos para editar planillas, contacte al administrador del sistema",
            },
         };

         const endpoint = "planilla/Planilla_Incritos"; // Endpoint para editar una planilla

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
