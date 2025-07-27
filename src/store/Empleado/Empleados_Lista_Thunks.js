import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { ApiProvider } from "../providerApi/providerApi";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";


export const Empleados_Lista_Thunks = () => {
   return async (dispatch, getState) => {
      try {
         // Obtener datos del usuario autenticado desde el estado de la aplicación
         const { user } = getState().auth;

         // Validación de datos: verificar que el usuario esté autenticado
         if (!user?.id_usuario) return crearRespuestaError("Usuario no autenticado.");

         // Construcción de la transacción para la creación del nuevo catalogo de cuentas
         const transaccion = {
            user: {
               id: parseInt(user.id_usuario), // id usuario auth
            },
            data: {},
            acceso: {
               type: 0,
               permiso: 0, //permiso para ver el select
               details: "",
            },
         };

         const endpoint = "empleados"; // Endpoint para obtener la lista de eventos del select

         // Realizar la petición a la API usando ApiProvider
         const resultado = await ApiProvider({ transaccion, endpoint });

         // Verificar si la respuesta contiene errores
         const error = verificarErroresRespuesta(resultado);
         if (error) return error; // Si hay un error, devolver la respuesta de error

         // Si la solicitud es exitosa, retornar los datos del select creado
         return crearRespuestaExitosa(resultado?.data);
      } catch (error) {
         // Si ocurre un error durante la ejecución, devolver el error con un mensaje adecuado
         return crearRespuestaError(error.message);
      }
   };
};
