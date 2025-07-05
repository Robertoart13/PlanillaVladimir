/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de registros en el sistema de nómina
 * Proporciona funcionalidades para actualizar registros existentes en la base de datos,
 * con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";
import bcrypt from "bcryptjs";
/**
 * Consultas SQL utilizadas en este módulo.
 */
const QUERIES = {
   QUERIES_UPDATE: `
      UPDATE 
         usuarios_tbl 
      SET 
      nombre_usuario=?,
      email_usuario =?,
      password_hash_usuario=?,
      rol_usuario=?,
      estado_usuario=?,
      id_empresa_usuario=?
      WHERE id_usuario  = ?;
   `,
};

/**
 * Actualiza un registro en la base de datos.
 * Si se indica que la clave fue llenada, la encripta antes de guardar.
 * @param {Object} datos - Datos del usuario a editar.
 * @param {Object|string} database - Conexión o nombre de la base de datos.
 * @returns {Promise<Object>} - Resultado de la operación.
 */
const editarRegistroBd = async (
   datos,
   database,
) => {
   // Por defecto, usa la clave vieja
   let password_hash_usuario = datos.password_hash_usuario_vieja;

   // Si se llenó la clave, la encripta y la usa
   if (datos.clave_llena) {
      const salt = await bcrypt.genSalt(10);
      password_hash_usuario = await bcrypt.hash(datos.password_hash_usuario, salt);
   }

   // Ejecuta la consulta de actualización
   return await realizarConsulta(
      QUERIES.QUERIES_UPDATE,
      [
         datos.nombre_usuario,
         datos.email_usuario,
         password_hash_usuario,
         datos.rol_usuario,
         datos.estado_usuario,
         datos.id_empresa_usuario,
         datos.id_usuario,
      ],
      database,
   );
};

/**
 * Verifica si la edición fue exitosa según el resultado de la consulta.
 * @param {Object} resultado - Resultado de la operación.
 * @returns {boolean} - true si fue exitosa, false si no.
 */
const esEdicionExitosa = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * Función principal para editar un registro.
 * 1. Valida los datos y permisos.
 * 2. Actualiza el registro en la base de datos.
 * 3. Verifica el éxito de la operación.
 * 4. Devuelve la respuesta estructurada.
 * @param {Object} req - Solicitud HTTP.
 * @param {Object} res - Respuesta HTTP.
 * @returns {Promise<Object>} - Resultado de la edición.
 */
const editarTransaccion = async (req, res) => {
   try {
      // 1. Validar datos iniciales
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion;

      // 2. Realizar la edición en la base de datos
      const resultado = await editarRegistroBd(
         res?.transaccion.cliente,     
         res?.database,
      );

      // 3. Verificar si la edición fue exitosa
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el registro: ${resultado.error}`);
      }

      // 4. Retornar respuesta exitosa
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // Manejo de errores generales
      return manejarError(error, 500, "Error al editar el registro: ", error.message);
   }
}

/**
 * Exporta el módulo con los métodos disponibles para editar registros.
 */
const Clientes_Editar = {   
   editarTransaccion,
};

export default Clientes_Editar;
