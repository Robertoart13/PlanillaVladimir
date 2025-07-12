/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la aplicación de planillas en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para aplicar planillas
 * en la base de datos, actualizando el estado de la planilla y aprobando todos
 * los elementos asociados (aumentos, extras, métricas, rebajos).
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para actualizar un registro de vacaciones existente en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_UPDATE: `
      UPDATE planilla_tbl
      SET
         planilla_estado = ?
      WHERE planilla_id = ?;    
   `,
   QUERIES_UPDATE_AUMENTOS: `
   UPDATE gestor_aumento_tbl
   SET
      estado_planilla_aumento_gestor = "Aprobado"
   WHERE planilla_id_aumento_gestor = ?;    
`,
   QUERIES_UPDATE_EXTRAS: `
   UPDATE gestor_compensacion_extra_tbl
   SET
      estado_compensacion_extra_gestor = "Aprobado"
   WHERE planilla_id_compensacion_extra_gestor = ?;    
`,
   QUERIES_UPDATE_METRICAS: `
   UPDATE gestor_compensacion_metrica_tbl
   SET
      estado_compensacion_metrica_gestor = "Aprobada"
   WHERE planilla_id_compensacion_metrica_gestor = ?;    
`,
   QUERIES_UPDATE_REBAJOS: `
   UPDATE gestor_rebajo_compensacion_tbl
   SET
      estado_rebajo = "Aprobado"
   WHERE planilla_id_rebajo = ?;    
`,
};

/**
 * ====================================================================================================================================
 * Aplica una planilla en la base de datos, ejecutando todas las consultas necesarias.
 *
 * Esta función ejecuta las consultas SQL en secuencia:
 * 1. Actualiza el estado de la planilla a "Cerrada"
 * 2. Aprueba todos los aumentos asociados a la planilla
 * 3. Aprueba todas las compensaciones extra asociadas
 * 4. Aprueba todas las compensaciones por métricas asociadas
 * 5. Aprueba todos los rebajos de compensación asociados
 *
 * @param {Object} datos - Datos de la planilla a aplicar
 * @param {number} datos.planilla_id - ID de la planilla a aplicar
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado de la operación de aplicación en la base de datos.
 * ====================================================================================================================================
 */
const editarRegistroBd = async (datos, database) => {
   try {
      // 1. Aprobar todos los aumentos asociados a la planilla
      await realizarConsulta(QUERIES.QUERIES_UPDATE_AUMENTOS, [datos.planilla_id], database);
      
      // 2. Aprobar todas las compensaciones extra asociadas
      await realizarConsulta(QUERIES.QUERIES_UPDATE_EXTRAS, [datos.planilla_id], database);
      
      // 3. Aprobar todas las compensaciones por métricas asociadas
      await realizarConsulta(QUERIES.QUERIES_UPDATE_METRICAS, [datos.planilla_id], database);
      
      // 4. Aprobar todos los rebajos de compensación asociados
      await realizarConsulta(QUERIES.QUERIES_UPDATE_REBAJOS, [datos.planilla_id], database);
      
      // 5. Actualizar el estado de la planilla a "Cerrada" (último paso)
      const resultadoPlanilla = await realizarConsulta(QUERIES.QUERIES_UPDATE, ["Cerrada", datos.planilla_id], database);
      
      return resultadoPlanilla;
   } catch (error) {
      throw error;
   }
};

/**
 * ====================================================================================================================================
 * Verifica si la aplicación de la planilla fue exitosa.
 *
 * Esta función evalúa el resultado de la operación de aplicación para determinar
 * si se realizó correctamente, verificando las filas afectadas y el código de estado.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {Object} [resultado.datos] - Datos retornados por la aplicación.
 * @param {number} [resultado.datos.affectedRows] - Número de filas afectadas por la aplicación.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} - `true` si la operación fue exitosa, `false` en caso contrario.
 * ====================================================================================================================================
 */
const esEdicionExitosa = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Aplica una planilla en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de aplicación de una planilla:
 * 1. Valida los datos de entrada y los permisos del usuario
 * 2. Aplica la planilla en la base de datos (actualiza estado y aprueba elementos asociados)
 * 3. Verifica que la operación haya sido exitosa
 * 4. Devuelve una respuesta estructurada con el resultado
 *
 * @param {Object} req - Objeto de solicitud HTTP con los datos de la transacción.
 * @param {Object} res - Objeto de respuesta HTTP con información de la transacción.
 * @param {Object} res.transaccion - Información de la transacción actual.
 * @param {Object} res.transaccion.user - Datos del usuario autenticado.
 * @param {number} res.transaccion.user.id - ID del usuario que realiza la solicitud.
 * @param {Object} res.transaccion.acceso - Información sobre los permisos de acceso.
 * @param {string} res.transaccion.acceso.permiso - Código del permiso requerido.
 * @param {string} res.transaccion.acceso.details - Detalles sobre el acceso requerido.
 * @param {Object} res.transaccion.data - Datos de la planilla a aplicar, incluyendo su ID.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de aplicación, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const aplicarTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 2. Aplicar la planilla en la base de datos
      const resultado = await editarRegistroBd(res?.transaccion?.data, res?.database);

      // 3. Verificar si la aplicación fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(
            `Error al aplicar la planilla: ${resultado.error}`,
         );
      }

      // 4. Si la aplicación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al aplicar la planilla: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para aplicar planillas.
 * Este módulo expone la funcionalidad de aplicación de planillas en el sistema.
 * ====================================================================================================================================
 */
const Gestor_Planilla_Aplicar = {
   aplicarTransaccion,
};

export default Gestor_Planilla_Aplicar;
