import { crearRespuestaError } from "../../hooks/crearRespuestaError";
import { verificarErroresRespuesta } from "../../hooks/verificarErroresRespuesta";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa";
import { ApiProvider } from "../providerApi/providerApi";


export const Empleado_Editar_Thunks = (formData) => {

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
            empleado: {
               id_empleado: formData.id_empleado,
               nombre_empleado: formData.nombre_empleado,
               apellidos_empleado: formData.apellidos_empleado,
               cedula_empleado: formData.cedula_empleado,
               fecha_vencimiento_cedula_empleado: formData.fecha_vencimiento_cedula_empleado,
               fecha_nacimiento_empleado: formData.fecha_nacimiento_empleado,
               estado_civil_empleado: formData.estado_civil_empleado,
               correo_empleado: formData.correo_empleado,
               telefono_empleado: formData.telefono_empleado,
               direccion_empleado: formData.direccion_empleado,
               fecha_ingreso_empleado: formData.fecha_ingreso_empleado,
               fecha_salida_empleado: formData.fecha_salida_empleado,
               jornada_laboral_empleado: formData.jornada_laboral_empleado,
               horario_empleado: formData.horario_empleado,
               salario_empleado: formData.salario_empleado,
               id_nacionalidad: formData.id_nacionalidad,
               id_tipo_contrato: formData.id_tipo_contrato,
               id_departamento: formData.id_departamento,
               id_puesto: formData.id_puesto,
               id_supervisor: formData.id_supervisor,
               id_empresa: formData.id_empresa,
               cuentas_bancarias: formData.cuentas_bancarias,
               es_inactivo: formData.es_inactivo,
               ministerio_hacienda_empleado: formData.ministerio_hacienda ? 1 : 0,
               rt_ins_empleado: formData.rt_ins ? 1 : 0,
               caja_costarricense_seguro_social_empleado: formData.caja_costarricense_seguro_social
                  ? 1
                  : 0,
               asegurado_empleado : formData.asegurado_empleado,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tiene permisos para editar empleados, ",
            },
         };

         const endpoint = "empleado/editar"; // Endpoint para editar un empleado

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
