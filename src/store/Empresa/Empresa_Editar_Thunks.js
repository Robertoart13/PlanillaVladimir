import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Empresa_Editar_Thunks = (formData) => {  

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
               id_empresa: formData.id_empresa,
               nombre_comercial_empresa: formData.nombre_comercial,
               nombre_razon_social_empresa: formData.nombre_razon_social,
               cedula_juridica_empresa: formData.cedula_juridica,
               nombre_contacto_empresa: formData.nombre_contacto,
               correo_contacto_empresa: formData.correo_contacto,
               correo_facturacion_empresa: formData.correo_facturacion,
               direccion_empresa: formData.direccion,
               estado_empresa: formData.estado,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tiene permisos para editar empresas, solo puede editar los datos de la empresa",
            },
         };

         const endpoint = "empresa/editar"; // Endpoint para crear una nueva empresa

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
