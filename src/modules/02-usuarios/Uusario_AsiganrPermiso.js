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

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { verificarPermisosUsuario } from "../../hooks/verificarPermisosUsuario.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para actualizar un registro existente en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   ELIMINAR_PERMISO: `
     DELETE FROM sys_usuarios_permisos WHERE id_permiso = ? and id_usuario = ?
   `,
   INSERTAR_PERMISO: `
     INSERT INTO sys_usuarios_permisos (id_usuario,id_permiso) VALUES (?, ?)
   `,
};

/**
 * ====================================================================================================================================
 * Actualiza un registro de registro en la base de datos.
 *
 * Esta función ejecuta la consulta SQL de actualización utilizando los valores proporcionados
 * para modificar un registro existente identificado por su ID.
 *
 * @param {string} id_usuario - id_usuario.
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} - Resultado de la operación de actualización en la base de datos.
 * ====================================================================================================================================
 */
const eliminarPermisoBd = async (id_permiso, id_usuario, database) => {
   return await realizarConsulta(QUERIES.ELIMINAR_PERMISO, [id_permiso, id_usuario], database);
};

const insertarPermisoBd = async (id_usuario, id_permiso, database) => {
   return await realizarConsulta(QUERIES.INSERTAR_PERMISO, [id_usuario, id_permiso], database);
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
const esEdicionExitosa = (resultado, tipo) => {
   if(tipo === "asignar"){
      return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);     
   }else{
      return !(resultado.datos?.insertId <= 0 || resultado?.status === 500); 
   }
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

      const details = `${res?.transaccion?.acceso?.details} Por favor, contacta con el administrador del sistema para obtener los accesos necesarios.`;

      // 2. Verificar si el usuario tiene permisos para acceder a la información solicitada.
      const errorPermisos = await verificarPermisosUsuario(
         res?.transaccion?.user?.id, // ID del usuario autenticado, extraído de la transacción
         res?.database, // Conexión a la base de datos
         res?.transaccion?.acceso?.permiso, // Código de permiso necesario para realizar la edición
         details, 
      );
      if (errorPermisos) return errorPermisos; // Si el usuario no tiene permisos, retorna un error.
     
      let resultado;
      if(res?.transaccion?.usuario?.tipo === "asignar"){
         resultado = await insertarPermisoBd(
            res?.transaccion?.usuario?.id,
            res?.transaccion?.usuario?.id_permiso,
            res?.database,
         );
      }else{
         resultado = await eliminarPermisoBd(
            res?.transaccion?.usuario?.id_permiso,
            res?.transaccion?.usuario?.id,
            res?.database,
         );
      }
      // 4. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado, res?.transaccion?.usuario?.tipo)) {
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
const Usuario_AsignarPermiso = {
   asignarPermiso: editarTransaccion  // Cambiado de asignarPermisosUsuarioInfo a asignarPermiso
};

export default Usuario_AsignarPermiso;