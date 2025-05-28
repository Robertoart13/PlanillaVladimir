import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Calendario_Crear_Thunks = (formData) => {

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
            evento: { 
                  titulo_evento: formData.titulo_evento, 
                  descripcion_evento: formData.descripcion_evento,
                  tipo_evento: formData.tipo_evento,
                  color_evento: formData.color_evento,
                  fecha_inicio: formData.fecha_inicio,
                  hora_inicio: formData.hora_inicio,
                  fecha_fin: formData.fecha_fin,
                  hora_fin: formData.hora_fin,
                  all_day_evento: formData.all_day_evento,
                  id_empleado_evento: formData.id_empleado_evento,
                  fecha_inicio_evento: formData.fecha_inicio_evento,
                  fecha_fin_evento: formData.fecha_fin_evento,
                  id_usuario_evento: parseInt(user.id_usuario)
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tiene permisos para crear eventos, contactese con el administrador",
            },
         };

         const endpoint = "calendario/crear"; // Endpoint para crear un nuevo evento

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
