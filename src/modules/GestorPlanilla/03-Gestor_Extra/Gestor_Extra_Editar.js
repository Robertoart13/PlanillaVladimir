/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de compensaciones extra en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para actualizar compensaciones extra
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
 * Contiene la consulta para actualizar un registro existente en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_UPDATE: `
      UPDATE gestor_compensacion_extra_tbl
      SET
         empresa_id_compensacion_extra_gestor = ?,
         planilla_id_compensacion_extra_gestor = ?,
         empleado_id_compensacion_extra_gestor = ?,
         remuneracion_actual_gestor = ?,
         tipo_jornada_gestor = ?,
         tipo_compensacion_extra_gestor = ?,
         cantidad_horas_gestor = ?,
         fecha_compensacion_gestor = ?,
         monto_compensacion_calculado_gestor = ?,
         motivo_compensacion_gestor = ?,
         aplica_en_compensacion_anual_gestor = ?,
         estado_compensacion_extra_gestor = ?
      WHERE id_compensacion_extra_gestor = ?;    
   `,
};

/**
 * ====================================================================================================================================
 * Actualiza un registro de compensación extra en la base de datos.
 *
 * Esta función ejecuta la consulta SQL de actualización utilizando los valores proporcionados
 * para modificar un registro existente identificado por su ID.
 *
 * @param {Object} datos - Datos de la compensación extra a actualizar
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
         datos.planilla_id_compensacion_extra_gestor,
         datos.empleado_id_compensacion_extra_gestor,
         datos.remuneracion_actual_gestor,
         datos.tipo_jornada_gestor,
         datos.tipo_compensacion_extra_gestor,
         datos.cantidad_horas_gestor,
         datos.fecha_compensacion_gestor,
         datos.monto_compensacion_calculado_gestor,
         datos.motivo_compensacion_gestor || null,
         datos.aplica_en_compensacion_anual_gestor ? 1 : 0,
         datos.estado_compensacion_extra_gestor || 'Pendiente',
         datos.id_compensacion_extra_gestor,
      ],
      database,
   );
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
const esEdicionExitosa = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Edita un registro de compensación extra existente en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de actualización de una compensación extra:
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
 * @param {string} res.transaccion.acceso.permiso - Código de permiso necesario para realizar la edición.
 * @param {string} res.transaccion.acceso.details - Detalles sobre el acceso requerido.
 * @param {Object} res.transaccion.data - Datos de la compensación extra a actualizar, incluyendo su ID.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} - Resultado de la operación de edición (éxito o error).
 * ====================================================================================================================================
 */
const editarTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 3. Realizar la edición en la base de datos
      const resultado = await editarRegistroBd( 
         res?.transaccion?.data, 
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 4. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar la compensación extra: ${resultado.error}`);
      }

      // 5. Si la edición fue exitosa, retornar una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al editar la compensación extra: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para editar registros.
 * Este módulo expone la funcionalidad de edición de compensaciones extra existentes.
 * ====================================================================================================================================
 */
const Gestor_Extra_Editar = {     
   editarTransaccion,
};

export default Gestor_Extra_Editar; 