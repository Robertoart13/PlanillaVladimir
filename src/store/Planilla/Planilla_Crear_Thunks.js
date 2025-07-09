import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Planilla_Crear_Thunks = (formData) => {

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
               planilla_codigo: formData.planilla_codigo, 
               empresa_id: formData.empresa_id,
               planilla_tipo: formData.planilla_tipo,
               planilla_descripcion: formData.planilla_descripcion,
               planilla_estado: formData.planilla_estado,
               planilla_fecha_inicio: formData.planilla_fecha_inicio,
               planilla_fecha_fin: formData.planilla_fecha_fin,
               planilla_creado_por: parseInt(user.id_usuario),
               planilla_moneda: formData.planilla_moneda,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tiene permisos para crear planillas, contacte al administrador del sistema",
            },
         };

         const endpoint = "planilla/crear"; // Endpoint para crear una nueva planilla  

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
