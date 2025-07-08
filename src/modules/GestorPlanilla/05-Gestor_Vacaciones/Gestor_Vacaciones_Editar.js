/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de registros de vacaciones en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para actualizar registros
 * de vacaciones existentes en la base de datos, con validación de permisos y manejo estructurado de errores.
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
      UPDATE gestor_vacaciones_tbl
      SET
         empresa_id_vacaciones_gestor = ?,
         empleado_id_vacaciones_gestor = ?,
         fecha_inicio_vacaciones_gestor = ?,
         dias_vacaciones_vacaciones_gestor = ?,
         motivo_vacaciones_gestor = ?,
         estado_vacaciones_gestor = ?,
         activo_vacaciones_gestor = ?
      WHERE id_vacacion_vacaciones_gestor = ?;    
   `,
};

/**
 * ====================================================================================================================================
 * Actualiza un registro de vacaciones existente en la base de datos.
 *
 * Esta función ejecuta la consulta SQL de actualización utilizando los valores proporcionados
 * para modificar un registro existente identificado por su ID.
 *
 * @param {Object} datos - Datos de las vacaciones a actualizar
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
         datos.empleado_id_vacaciones_gestor,
         datos.fecha_inicio_vacaciones_gestor,
         datos.dias_vacaciones_vacaciones_gestor,
         datos.motivo_vacaciones_gestor || null,
         'Aprobado', // Estado siempre Aprobado
         datos.activo_vacaciones_gestor === 1 ? 1 : 0,
         datos.id_vacacion_vacaciones_gestor,
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
 * Edita un registro de vacaciones existente en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de actualización de un registro de vacaciones:
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
 * @param {Object} res.transaccion.data - Datos de las vacaciones a actualizar, incluyendo su ID.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de actualización, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const editarTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 2. Actualizar el registro de vacaciones en la base de datos
      const resultado = await editarRegistroBd(
         res?.transaccion?.data,
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 3. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el registro de vacaciones: ${resultado.error}`);
      }

      // 4. Si la edición fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al editar el registro de vacaciones: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para editar registros de vacaciones.
 * Este módulo expone la funcionalidad de actualización de registros de vacaciones existentes.
 * ====================================================================================================================================
 */
const Gestor_Vacaciones_Editar = { 
   editarTransaccion,
};

export default Gestor_Vacaciones_Editar; 