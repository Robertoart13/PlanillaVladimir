/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de rebajos a compensación en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para actualizar rebajos a compensación
 * existentes en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para actualizar un rebajo a compensación existente en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_UPDATE: `
      UPDATE gestor_rebajo_compensacion_tbl
      SET
         empresa_id_rebajo = ?,
         planilla_id_rebajo = ?,
         empleado_id_rebajo = ?,
         tipo_rebajo = ?,
         tipo_jornada_laboral = ?,
         horas_rebajadas = ?,
         dias_rebajados = ?,
         monto_fijo_rebajo = ?,
         salario_actual = ?,
         monto_rebajo_calculado = ?,
         motivo_rebajo = ?,
         fecha_rebajo = ?,
         aplica_compensacion_anual = ?,
         estado_rebajo = ?
      WHERE id_rebajo_compensacion = ?;    
   `,
};

/**
 * ====================================================================================================================================
 * Actualiza un rebajo a compensación existente en la base de datos.
 *
 * Esta función ejecuta la consulta SQL de actualización utilizando los valores proporcionados
 * para modificar un registro existente identificado por su ID.
 *
 * @param {Object} datos - Datos del rebajo a compensación a actualizar
 * @param {number} empresa_id - ID de la empresa
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado de la operación de actualización en la base de datos.
 * ====================================================================================================================================
 */
const editarRegistroBd = async (datos, empresa_id, database) => {
   return await realizarConsulta(
      QUERIES.QUERIES_UPDATE,
      [
         empresa_id,
         datos.planilla_id_rebajo_compensacion,
         datos.empleado_id_rebajo_compensacion,
         datos.tipo_rebajo,
         datos.tipo_jornada_laboral || 'mensual',
         datos.horas_rebajadas || null,
         datos.dias_rebajados || null,
         datos.monto_fijo_rebajo || null,
         datos.salario_actual || 0,
         datos.monto_rebajo_calculado || 0,
         datos.motivo_rebajo || null,
         datos.fecha_rebajo || new Date().toISOString().split('T')[0],
         datos.aplica_compensacion_anual ? 1 : 0,
         datos.estado_rebajo || 'Pendiente',
         datos.id_rebajo_compensacion,
      ],
      database,
   );
};

/**
 * ====================================================================================================================================
 * Verifica si la edición del rebajo a compensación fue exitosa.
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
const esEdicionExitosa = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Edita un rebajo a compensación existente en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de actualización de un rebajo a compensación:
 * 1. Valida los datos de entrada y los permisos del usuario
 * 2. Actualiza el registro existente en la base de datos
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
 * @param {Object} res.transaccion.data - Datos del rebajo a compensación a actualizar, incluyendo su ID.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de actualización, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const editarTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 2. Actualizar el rebajo a compensación en la base de datos
      const resultado = await editarRegistroBd(
         res?.transaccion?.data,
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 3. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el rebajo a compensación: ${resultado.error}`);
      }

      // 4. Si la edición fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al editar el rebajo a compensación: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para editar rebajos a compensación.
 * Este módulo expone la funcionalidad de actualización de rebajos a compensación existentes.
 * ====================================================================================================================================
 */
const Gestor_Deducciones_Editar = { 
   editarTransaccion,
};

export default Gestor_Deducciones_Editar; 