/**
 * ====================================================================================================================================
 * @fileoverview Módulo para listar registros en el sistema
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 *
 * Este módulo proporciona funcionalidades para consultar y listar los registros
 * disponibles en el sistema, con validaciones de permisos y manejo de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Estas consultas son usadas para interactuar con la base de datos, recuperando datos necesarios.
 * ====================================================================================================================================
 */
const QUERIES = {
   // Consulta SQL para obtener todos los registros de la tabla
   TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA: `
      SELECT 
         numero_socio_empleado_gestor,
         nombre_completo_empleado_gestor,
         correo_empleado_gestor,
         cedula_empleado_gestor,
         salario_base_empleado_gestor,
         tipo_contrato_empleado_gestor,
         supervisor_empleado_gestor,
         fecha_ingreso_empleado_gestor,
         fecha_salida_empleado_gestor,
         numero_asegurado_empleado_gestor,
         numero_ins_empleado_gestor,
         numero_hacienda_empleado_gestor,
         cuenta_bancaria_1_empleado_gestor,
         ministerio_hacienda_empleado_gestor,
         rt_ins_empleado_gestor,
         ccss_empleado_gestor,
         moneda_pago_empleado_gestor,
         estado_empleado_gestor,
         montoAsegurado_gestor_empelado,
         tipo_planilla_empleado_gestor
      FROM gestor_empleado_tbl
      WHERE estado_empleado_gestor = 1
         AND (fecha_salida_empleado_gestor IS NULL OR fecha_salida_empleado_gestor = '')
         AND salario_base_empleado_gestor IS NOT NULL
         AND salario_base_empleado_gestor != ''
         AND id_empresa = ?;
      `,
      // Consulta para obtener aumentos del empleado
      AUMENTOS: `
      SELECT *
      FROM gestor_aumento_tbl
      WHERE planilla_id_aumento_gestor = ?
        AND empresa_id_aumento_gestor = ?
        AND empleado_id_aumento_gestor = ?
        AND estado_planilla_aumento_gestor = "Pendiente";
      `,
      // Consulta para obtener rebajos a compensación del empleado
      REBAJOS_COMPENSACION: `
      SELECT *
      FROM gestor_rebajo_compensacion_tbl
      WHERE planilla_id_rebajo = ?
        AND empresa_id_rebajo = ?
        AND empleado_id_rebajo = ?
        AND estado_rebajo = "Pendiente";
      `,
      // Consulta para obtener horas extras del empleado
      HORAS_EXTRAS: `
      SELECT *
      FROM gestor_compensacion_extra_tbl
      WHERE planilla_id_compensacion_extra_gestor = ?
        AND empresa_id_compensacion_extra_gestor = ?
        AND empleado_id_compensacion_extra_gestor = ?
        AND estado_compensacion_extra_gestor = "Pendiente";
      `,
      // Consulta para obtener compensación por métrica del empleado
      COMPENSACION_METRICA: `
      SELECT *
      FROM gestor_compensacion_metrica_tbl
      WHERE planilla_id_compensacion_metrica_gestor = ?
        AND empresa_id_compensacion_metrica_gestor = ?
        AND empleado_id_compensacion_metrica_gestor = ?
        AND estado_compensacion_metrica_gestor = "Pendiente";
      `,
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener todos los registros.
 *
 * Esta función ejecuta una consulta SQL definida en el objeto `QUERIES`, la cual extrae todos
 * los registros almacenados en la base de datos sin aplicar filtros.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta con todos los registros
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerTodosDatos = async (datos, database) => {

   console.log(datos);

   try {
      // Obtener la lista de empleados
      const resultado = await realizarConsulta(QUERIES.TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA, [datos.empresa_id], database); 
      
      // Si hay un error en la consulta principal, retornarlo
      if (resultado?.status === 500) {
         return resultado;
      }

      // Recorrer cada empleado y obtener sus datos adicionales
      const empleadosConDatosAdicionales = await Promise.all(
         resultado.datos.map(async (empleado) => {

            try {
               // Ejecutar las 4 consultas adicionales para cada empleado
               const [aumentos, rebajosCompensacion, horasExtras, compensacionMetrica] = await Promise.all([
                  // Consulta de aumentos
                  realizarConsulta(
                     QUERIES.AUMENTOS, 
                     [datos.planilla_id, datos.empresa_id, empleado.id_empleado_gestor], 
                     database
                  ),
                  // Consulta de rebajos a compensación
                  realizarConsulta(
                     QUERIES.REBAJOS_COMPENSACION, 
                     [datos.planilla_id, datos.empresa_id, empleado.id_empleado_gestor], 
                     database
                  ),
                  // Consulta de horas extras
                  realizarConsulta(
                     QUERIES.HORAS_EXTRAS, 
                     [datos.planilla_id, datos.empresa_id, empleado.id_empleado_gestor], 
                     database
                  ),
                  // Consulta de compensación por métrica
                  realizarConsulta(
                     QUERIES.COMPENSACION_METRICA, 
                     [datos.planilla_id, datos.empresa_id, empleado.id_empleado_gestor], 
                     database
                  )
               ]);

               // Agregar los datos adicionales al empleado
               return {
                  ...empleado,
                  aumentos: aumentos?.status === 500 ? [] : (aumentos?.datos || []),
                  rebajos_compensacion: rebajosCompensacion?.status === 500 ? [] : (rebajosCompensacion?.datos || []),
                  horas_extras: horasExtras?.status === 500 ? [] : (horasExtras?.datos || []),
                  compensacion_metrica: compensacionMetrica?.status === 500 ? [] : (compensacionMetrica?.datos || [])
               };
            } catch (error) {
               // Si hay error en las consultas adicionales, retornar el empleado sin datos adicionales
               console.error(`Error obteniendo datos adicionales para empleado ${empleado.id_empleado_gestor}:`, error);
               return {
                  ...empleado,
                  aumentos: [],
                  rebajos_compensacion: [],
                  horas_extras: [],
                  compensacion_metrica: []
               };
            }
         })
      );

      // Retornar el resultado con los empleados y sus datos adicionales
      return {
         ...resultado,
         datos: empleadosConDatosAdicionales
      };

   } catch (error) {
      return manejarError(
         error,
         500,
         "Error No se puede extraer la lista completa: ",
         `Error al obtener los datos de la base de datos: ${error.message}`,
      );
   }
};

/**
 * ====================================================================================================================================
 * Verifica si la edición del registro fue exitosa.
 *
 * Esta función evalúa el resultado de la operación de actualización para determinar
 * si se realizó correctamente, verificando las filas afectadas y el código de estado.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {Object} [resultado.datos] - Datos retornados por la actualización.
 * @param {number} [resultado.datos.affectedRows] - Número de filas afectadas por la actualización.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} - `true` si la operación fue exitosa, `false` en caso contrario.
 * ====================================================================================================================================
 */
const esConsultarExitosa = (resultado) => {
   return !(resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Obtiene la lista completa de registros, validando previamente los permisos del usuario.
 *
 * Este método realiza los siguientes pasos:
 * 1. Valida los datos de la solicitud.
 * 2. Verifica si el usuario tiene el permiso requerido para acceder a la lista.
 * 3. Si las validaciones son correctas y el usuario tiene permiso, consulta la base de datos.
 * 4. Si todo está bien, retorna la lista en una respuesta exitosa.
 *
 * @param {Object} req - Objeto de solicitud HTTP, utilizado para obtener los datos del usuario y la solicitud.
 * @param {Object} res - Objeto de respuesta HTTP, utilizado para enviar la respuesta al cliente.
 * @param {Object} res.transaccion - Información de la transacción actual.
 * @param {Object} res.transaccion.user - Datos del usuario autenticado.
 * @param {number} res.transaccion.user.id - ID del usuario que realiza la solicitud.
 * @param {Object} res.transaccion.acceso - Información sobre los permisos de acceso.
 * @param {string} res.transaccion.acceso.permiso - Código del permiso requerido.
 * @param {string} res.transaccion.acceso.details - Detalles sobre el acceso requerido.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} - Retorna la lista si el usuario tiene permisos, o un error si no los tiene.
 * ====================================================================================================================================
 */
const obtenerListaCompleta = async (req, res) => {

   console.log(res);
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 3. Obtener los datos de la base de datos una vez validados los permisos.
      const resultado = await obtenerTodosDatos(
         res.transaccion.data,
         res?.database);

      // 4. Verificar si la edición fue exitosa.
      if (!esConsultarExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al cargar el registro: ${resultado.error}`);
      }

      // 4. Si la consulta es exitosa, se retornan los datos obtenidos en una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // 5. Manejo de errores centralizado: Si hay cualquier error durante el proceso, se captura y maneja aquí.
      return manejarError(
         error,
         500,
         "Error No se puede extraer la lista completa: ",
         error.message,
      );
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para interactuar con registros.
 * Este módulo expone la funcionalidad de obtener la lista completa, entre otras.
 * ====================================================================================================================================
 */
const Gestor_Planilla_Gestor = {      
   obtenerListaCompleta, // Método que obtiene la lista completa, con validaciones y permisos.
};

export default Gestor_Planilla_Gestor;       
