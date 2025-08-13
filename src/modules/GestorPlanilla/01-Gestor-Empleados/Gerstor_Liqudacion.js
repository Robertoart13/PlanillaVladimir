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
   QUERIES_SELECT: `
          SELECT * FROM gestor_empleado_tbl WHERE id_empleado_gestor = ?
    `,
    QUERIES_SELECT_ULTIMOS_6_MESES: `
          SELECT 
            ga.*,
            p.planilla_codigo,
            p.planilla_tipo,
            p.planilla_estado,
            p.planilla_fecha_inicio,
            p.planilla_fecha_fin,
            p.planilla_moneda
         FROM gestor_aumento_tbl AS ga
         INNER JOIN planilla_tbl AS p
            ON ga.planilla_id_aumento_gestor = p.planilla_id
         WHERE ga.empleado_id_aumento_gestor = ?
         AND ga.estado_planilla_aumento_gestor = 'Procesada'
         AND p.planilla_moneda = ?;

    `,
    QUERIES_SELECT_VACACIONES: `
          SELECT * FROM Vacaciones_metrica WHERE id_empleado_gestor = ? 
    `,
    QUERIES_SELECT_COMPENSACION_EXTRA: ` 
          SELECT * FROM gestor_compensacion_extra_tbl WHERE empleado_id_compensacion_extra_gestor = ? AND estado_compensacion_extra_gestor IN ('Aplicada','Aprobado','Procesada') AND aplica_en_compensacion_anual_gestor= 1
    `,
    QUERIES_SELECT_COMPENSACION_METRICA: `
          SELECT * FROM gestor_compensacion_metrica_tbl WHERE empleado_id_compensacion_metrica_gestor = ? AND estado_compensacion_metrica_gestor IN ('Aprobada','Aplicada','Procesada') and aplica_en_compensacion_anual_gestor=1
    `,
    QUERIES_SELECT_REBAJO_COMPENSACION: `
    SELECT * FROM gestor_rebajo_compensacion_tbl WHERE empleado_id_rebajo = ? AND estado_rebajo IN ('Aprobado','Aplicado','Procesada') and aplica_compensacion_anual=1
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
const obtenerTodosDatos = async (id_empleado_gestor, database) => {

   try {
      // Primera consulta: obtener datos del empleado
      const datosEmpleado = await realizarConsulta(QUERIES.QUERIES_SELECT, [id_empleado_gestor], database);
      


      const empleado = datosEmpleado.datos[0];
      const moneda = empleado.moneda_pago_empleado_gestor;

      // Segunda consulta: obtener aumentos de los últimos 6 meses
      const aumentos = await realizarConsulta(
         QUERIES.QUERIES_SELECT_ULTIMOS_6_MESES, 
         [id_empleado_gestor, moneda], 
         database
      );
        // Tercera consulta: obtener datos de vacaciones
      const vacaciones = await realizarConsulta(
         QUERIES.QUERIES_SELECT_VACACIONES, 
         [id_empleado_gestor], 
         database
      );

      // Cuarta consulta: obtener datos de compensación extra
      const compensacionExtra = await realizarConsulta(
         QUERIES.QUERIES_SELECT_COMPENSACION_EXTRA, 
         [id_empleado_gestor], 
         database
      );

      // Quinta consulta: obtener datos de compensación métrica
      const compensacionMetrica = await realizarConsulta(
         QUERIES.QUERIES_SELECT_COMPENSACION_METRICA, 
         [id_empleado_gestor], 
         database
      );

      // Sexta consulta: obtener datos de rebajo compensación
      const rebajoCompensacion = await realizarConsulta(
         QUERIES.QUERIES_SELECT_REBAJO_COMPENSACION, 
         [id_empleado_gestor], 
         database
      );

      // Agregar los aumentos, vacaciones y compensaciones al empleado
      const empleadoConAumentos = {
         ...empleado,
         aumentos_Json: aumentos?.status === 500 ? [] : (aumentos?.datos || []),
         vacaciones_Json: vacaciones?.status === 500 ? [] : (vacaciones?.datos || []),
         compensacion_extra_Json: compensacionExtra?.status === 500 ? [] : (compensacionExtra?.datos || []),
         compensacion_metrica_Json: compensacionMetrica?.status === 500 ? [] : (compensacionMetrica?.datos || []),
         rebajo_compensacion_Json: rebajoCompensacion?.status === 500 ? [] : (rebajoCompensacion?.datos || [])
      };


     
      return {
         ...datosEmpleado,
         datos: [empleadoConAumentos]
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
         res.transaccion.data.id,
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
const Gestor_Liqudacion_Listar = {
   Gestor_Liqudacion_Listar: obtenerListaCompleta, // Método que obtiene la lista completa, con validaciones y permisos.
};

export default Gestor_Liqudacion_Listar;
