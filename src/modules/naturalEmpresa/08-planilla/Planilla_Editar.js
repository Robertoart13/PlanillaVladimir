/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de registros en el sistema de nómina
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para actualizar registros
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
      UPDATE
         planilla_tbl
      SET
         planilla_codigo = ?,
         empresa_id = ?,
         planilla_tipo = ?,
         planilla_descripcion = ?,
         planilla_estado = ?,
         planilla_fecha_inicio = ?,
         planilla_fecha_fin = ?,
         planilla_creado_por = ?
      WHERE planilla_id  = ?;
   `,
   QUERIES_UPDATE_AUMENTOS_CANCELADO: `
      UPDATE
         gestor_aumento_tbl
      SET
         estado_planilla_aumento_gestor = "Cancelado",
         estado_aumento_gestor=0
      WHERE planilla_id_aumento_gestor = ?;
   `,
   QUERIES_UPDATE_AUMENTOS_APLICADO: `
      UPDATE
         gestor_aumento_tbl
      SET
         estado_planilla_aumento_gestor = "Aplicado",
         estado_aumento_gestor=1
      WHERE planilla_id_aumento_gestor = ?;
   `,
   QUERIES_UPDATE_AUMENTOS_PROCESADO: `
      UPDATE
         gestor_aumento_tbl
      SET
         estado_planilla_aumento_gestor = "Procesado",
         estado_aumento_gestor=1
      WHERE planilla_id_aumento_gestor = ?;
   `,
   QUERIES_UPDATE_COMPE_CANCELADO: `
      UPDATE
         gestor_compe_tbl
      SET
         estado_planilla_compe_gestor = "En proceso",
         estado_compe_gestor=0
      WHERE planilla_id_compe_gestor = ?;
   `,
   QUERIES_UPDATE_COMPE_APLICADO: `
      UPDATE
         gestor_compe_tbl
      SET
         estado_planilla_compe_gestor = "Aplicado",
         estado_compe_gestor=1
      WHERE planilla_id_compe_gestor = ?;
   `,
   QUERIES_UPDATE_COMPE_PROCESADO: `
      UPDATE
         gestor_compe_tbl
      SET
         estado_planilla_compe_gestor = "Procesado",
         estado_compe_gestor=1
      WHERE planilla_id_compe_gestor = ?;
   `,
};

/**
 * ====================================================================================================================================
 * Actualiza un registro de registro en la base de datos.
 *
 * Esta función ejecuta la consulta SQL de actualización utilizando los valores proporcionados
 * para modificar un registro existente identificado por su ID.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} - Resultado de la operación de actualización en la base de datos.
 * ====================================================================================================================================
 */
const editarRegistroBd = async (datos, database) => {

    // Ejecutar la consulta para actualizar el registro en planilla_tbl
    const resultado = await realizarConsulta(
       QUERIES.QUERIES_UPDATE,
       [
          datos.planilla_codigo,
          datos.empresa_id,
          datos.planilla_tipo,
          datos.planilla_descripcion,
          datos.planilla_estado,
          datos.planilla_fecha_inicio,
          datos.planilla_fecha_fin,
          datos.planilla_creado_por,
          datos.planilla_id,
       ],
       database,
    );

    // Si la actualización de planilla fue exitosa, actualizar el estado del aumento y compensaciones según el estado de la planilla
    if (resultado.datos?.affectedRows > 0) {
       let queryAumentos = null;
       let queryCompe = null;
       
       // Determinar qué consulta usar según el estado de la planilla
       switch (datos.planilla_estado) {
          case 'Cancelada':
             queryAumentos = QUERIES.QUERIES_UPDATE_AUMENTOS_CANCELADO;
             queryCompe = QUERIES.QUERIES_UPDATE_COMPE_CANCELADO;
             break;
          case 'Cerrada':
             queryAumentos = QUERIES.QUERIES_UPDATE_AUMENTOS_APLICADO;
             queryCompe = QUERIES.QUERIES_UPDATE_COMPE_APLICADO;
             break;
          case 'Procesada':
             queryAumentos = QUERIES.QUERIES_UPDATE_AUMENTOS_PROCESADO;
             queryCompe = QUERIES.QUERIES_UPDATE_COMPE_PROCESADO;
             break;
          default:
             // Si no es ninguno de los estados especificados, no ejecutar consulta adicional
             break;
       }
       
       // Ejecutar la consulta para actualizar el estado del aumento si es necesario
       if (queryAumentos) {
          await realizarConsulta(
             queryAumentos,
             [datos.planilla_id],
             database,
          );
       }
       
       // Ejecutar la consulta para actualizar el estado de las compensaciones si es necesario
       if (queryCompe) {
          await realizarConsulta(
             queryCompe,
             [datos.planilla_id],
             database,
          );
       }
    }

    return resultado;
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
 * Edita un registro existente en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de actualización de un registro:
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
 * @param {Object} res.transaccion.movimiento - Datos del registro a actualizar, incluyendo su ID.
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
      const resultado = await editarRegistroBd(res?.transaccion.planilla, res?.database);

      // 4. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el registro: ${resultado.error}`);
      }

      // 5. Si la edición fue exitosa, retornar una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al editar el registro: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para editar registros.
 * Este módulo expone la funcionalidad de edición de registros existentes.
 * ====================================================================================================================================
 */
const Planilla_Editar = {
   editarTransaccion,
};

export default Planilla_Editar;
