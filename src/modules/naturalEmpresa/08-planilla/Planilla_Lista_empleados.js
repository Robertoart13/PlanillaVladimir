/**
 * ====================================================================================================================================
 * @fileoverview Módulo para listar registros en el sistema
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * 
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
   QUERIES_SELECT: `
         SELECT
         -- Datos del empleado desde empleados_tbl
         emp.id_empleado AS id_empleado_emp_tbl,
         emp.nombre_empleado AS nombre_empleado,
         emp.apellidos_empleado AS apellidos_empleado,
         emp.cedula_empleado AS cedula_empleado,
         emp.fecha_salida_empleado AS fecha_salida_empleado_emp_tbl,
         emp.jornada_laboral_empleado AS jornada_laboral_emp_tbl,
         emp.salario_empleado AS salario_empleado_emp_tbl,
         emp.id_empresa AS id_empresa_emp_tbl,
         emp.estado_empleado AS estado_empleado_emp_tbl,
         emp.ministerio_hacienda_empleado AS ministerio_hacienda_emp_tbl,
         emp.rt_ins_empleado AS rt_ins_empleado_emp_tbl,
         emp.caja_costarricense_seguro_social_empleado AS ccss_emp_tbl,
         emp.asegurado_empleado as asegurado_empleado,

         -- Datos del detalle de planilla desde empleado_planilla_detalle_tbl
         epd.id_epd AS id_epd_epd_tbl,
         epd.id_empleado_epd AS id_empleado_epd_tbl,
         epd.id_empresa_epd AS id_empresa_epd_tbl,
         epd.planilla_id_epd AS planilla_id_epd_tbl,
         epd.id_usuario_creador_epd AS id_usuario_creador_epd_tbl,
         epd.semana_epd AS semana_epd_tbl,
         epd.remuneracion_bruta_epd AS remuneracion_bruta_epd_tbl,
         epd.fcl_1_5_epd AS fcl_1_5_epd_tbl,
         epd.rob_3_25_epd AS rob_3_25_epd_tbl,
         epd.rebajos_cliente_epd AS rebajos_cliente_epd_tbl,
         epd.cuota_ccss_epd AS cuota_ccss_epd_tbl,
         epd.rebajos_opu_epd AS rebajos_opu_epd_tbl,
         epd.reintegro_cliente_epd AS reintegro_cliente_epd_tbl,
         epd.reintegro_opu_epd AS reintegro_opu_epd_tbl,
         epd.deposito_x_tecurso_epd AS deposito_x_tecurso_epd_tbl,
         epd.total_deducciones_epd AS total_deducciones_epd_tbl,
         epd.total_reintegros_epd AS total_reintegros_epd_tbl,
         epd.remuneracion_neta_epd AS remuneracion_neta_epd_tbl,
         epd.estado_epd AS estado_epd_tbl,
         epd.fecha_creacion_epd AS fecha_creacion_epd_tbl,
         epd.fecha_modificacion_epd AS fecha_modificacion_epd_tbl,
         epd.marca_epd as marca_epd

      FROM empleados_tbl AS emp
      LEFT JOIN empleado_planilla_detalle_tbl AS epd
         ON emp.id_empleado = epd.id_empleado_epd

      WHERE epd.id_empresa_epd = ? AND epd.planilla_id_epd = ?



      `,
   // Consulta para obtener empleados cuando NO hay empleados en la planilla
   QUERIES_SELECT_EMPLEADOS_SIN_PLANILLA: `
        SELECT
            *
        FROM empleados_tbl
        WHERE estado_empleado=1 and id_empresa = ? AND id_empleado NOT IN (__IDS__)
   `,

   // Consulta para obtener TODOS los empleados de la empresa
   QUERIES_SELECT_TODOS_EMPLEADOS: `
        SELECT
            *
        FROM empleados_tbl
        WHERE id_empresa = ? and estado_empleado=1
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
const obtenerTodosDatos = async (id_empresa, id_planilla, database) => {

   try {
      // Ejecuta la primera consulta SQL 
      const resultadoPlanilla = await realizarConsulta(
         QUERIES.QUERIES_SELECT,
         [id_empresa, id_planilla],
         database,
      );

      // Obtener array de IDs
      const empleadosIdsArr = resultadoPlanilla.datos
         .map((empleado) => empleado.id_empleado_emp_tbl)
         .filter((id) => id !== undefined && id !== null);
      


      let resultadoEmpleados;
      if (!resultadoPlanilla.datos || resultadoPlanilla.datos.length === 0) {
         resultadoEmpleados = await realizarConsulta(
            QUERIES.QUERIES_SELECT_TODOS_EMPLEADOS,
            [id_empresa],
            database,
         );
      } else {
         // Construir placeholders dinámicamente
         const placeholders = empleadosIdsArr.map(() => '?').join(',');
         const querySinPlanilla = QUERIES.QUERIES_SELECT_EMPLEADOS_SIN_PLANILLA.replace('__IDS__', placeholders);
         resultadoEmpleados = await realizarConsulta(
            querySinPlanilla,
            [id_empresa, ...empleadosIdsArr],
            database,
         );
      }

      

      // Combinar los resultados en un solo objeto
      return {
         datos:[
               ...(resultadoPlanilla.datos || []),
               ...(resultadoEmpleados.datos || []),
         ],
         status: 200,
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
   try {

      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.



      
      // 3. Obtener los datos de la base de datos una vez validados los permisos.
      const resultado = await obtenerTodosDatos(
         res?.transaccion?.data.id_empresa,
         res?.transaccion?.data.id_planilla,
         res?.database,
      );


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
const Planilla_Listar_Empleados = {  
   Planilla_Listar_Empleados: obtenerListaCompleta, // Método que obtiene la lista completa, con validaciones y permisos.
};

export default Planilla_Listar_Empleados;
