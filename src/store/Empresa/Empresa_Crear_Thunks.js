import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Empresa_Crear_Thunks = (formData) => {

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
            empresa: { 
               nombre_empresa: formData.nombre_empresa,
               rnc_empresa: formData.rnc_empresa,
               direccion_empresa: formData.direccion_empresa,
               telefono_empresa: formData.telefono_empresa,
               correo_empresa: formData.correo_empresa,
               estado_empresa: formData.estado_empresa
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tiene permisos para crear empresas, ",
            },
         };

         const endpoint = "empresa/crear"; // Endpoint para crear una nueva empresa

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
