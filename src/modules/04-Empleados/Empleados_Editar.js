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
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para actualizar un registro existente en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_UPDATE: `
      UPDATE 
         empleados_tbl 
      SET 
      nombre_empleado=?,
      apellidos_empleado=?,
      cedula_empleado=?,
      fecha_vencimiento_cedula_empleado=?,
      fecha_nacimiento_empleado=?,
      estado_civil_empleado=?,
      correo_empleado=?,
      telefono_empleado=?,
      direccion_empleado=?,
      fecha_ingreso_empleado=?,
      fecha_salida_empleado=?,
      jornada_laboral_empleado=?,
      horario_empleado=?,
      salario_empleado=?,
      id_nacionalidad=?,
      id_tipo_contrato=?,
      id_departamento=?,
      id_puesto=?,
      id_supervisor=?,
      id_empresa=?
      WHERE id_empleado   = ?;    
   `,
   QUERIES_DELETE_CUENTAS: `
      DELETE FROM cuentas_iban_tbl WHERE id_empleado = ?;    
   `,
   QUERIES_INSERT_CUENTAS: `
   INSERT INTO cuentas_iban_tbl (
      id_empleado,
      numero_cuenta_iban
   ) VALUES (
      ?,
      ?
   );
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
const editarRegistroBd = async (
   datos,
   database,
) => {
   return await realizarConsulta(
      QUERIES.QUERIES_UPDATE,
      [
         
         datos.nombre_empleado,
         datos.apellidos_empleado,
         datos.cedula_empleado,
         datos.fecha_vencimiento_cedula_empleado,
         datos.fecha_nacimiento_empleado,
         datos.estado_civil_empleado,
         datos.correo_empleado,
         datos.telefono_empleado,
         datos.direccion_empleado,
         datos.fecha_ingreso_empleado,
         datos.fecha_salida_empleado,
         datos.jornada_laboral_empleado,
         datos.horario_empleado,
         datos.salario_empleado,
         datos.id_nacionalidad,
         datos.id_tipo_contrato,
         datos.id_departamento,
         datos.id_puesto,
         datos.id_supervisor,
         datos.id_empresa,
         datos.id_empleado
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
      const resultado = await editarRegistroBd(
         res?.transaccion.empleado,     
         res?.database,
      );

     
      // 4. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el registro: ${resultado.error}`);
      }

      // Check if affectedRows is greater than 0
      if (resultado.datos.affectedRows > 0) {
         // Delete existing entries
         await realizarConsulta(QUERIES.QUERIES_DELETE_CUENTAS, [res?.transaccion.empleado.id_empleado], res?.database);
         // Insert new entries
         for (const cuenta of res?.transaccion?.empleado.cuentas_bancarias) {
            await realizarConsulta(QUERIES.QUERIES_INSERT_CUENTAS, [res?.transaccion.empleado.id_empleado, cuenta], res?.database);
         }
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
const Empleados_Editar = {   
   editarTransaccion,
};

export default Empleados_Editar;
