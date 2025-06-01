/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de registros en el sistema de
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevos registros
 * en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
   INSERT INTO empleados_tbl (
      nombre_empleado,
      apellidos_empleado,
      cedula_empleado,
      fecha_vencimiento_cedula_empleado,
      fecha_nacimiento_empleado,
      estado_civil_empleado,
      correo_empleado,
      telefono_empleado,
      direccion_empleado,
      fecha_ingreso_empleado,
      fecha_salida_empleado,
      jornada_laboral_empleado,
      horario_empleado,
      salario_empleado,
      id_nacionalidad,
      id_tipo_contrato,
      id_departamento,
      id_puesto,
      id_supervisor,
      id_empresa,
      ministerio_hacienda_empleado,
      rt_ins_empleado,
      caja_costarricense_seguro_social_empleado,
      asegurado_empleado
) VALUES (
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
      ?,
     ?,
     ?,
     ?,
     ?

);
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
 * Inserta un nuevo registro en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de registro
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de inserción con datos del registro creado.
 * @throws {Error} Si ocurre un error durante la inserción en la base de datos.
 * ====================================================================================================================================
 */
const crearNuevoRegistroBd = async (datos, database) => {
   return await realizarConsulta(
      QUERIES.QUERIES_INSERT,
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
         datos.ministerio_hacienda_empleado,
         datos.rt_ins_empleado,
         datos.caja_costarricense_seguro_social_empleado,
         datos.asegurado_empleado,
      ],
      database,
   );
};

const crearNuevoRegistroBd_cuentas = async (id_empleado, cuentas_bancarias, database) => {
   return await realizarConsulta(
      QUERIES.QUERIES_INSERT_CUENTAS,
      [id_empleado, cuentas_bancarias],
      database,
   );
};

/**
 * ====================================================================================================================================
 * Verifica si la creación del registro fue exitosa.
 *
 * Esta función analiza el resultado devuelto por la operación de creación para determinar
 * si el proceso se completó correctamente o si ocurrió algún error.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {Object} [resultado.datos] - Datos retornados por la inserción.
 * @param {number} [resultado.datos.insertId] - ID del registro insertado.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} True si la operación fue exitosa, false en caso contrario.
 * ====================================================================================================================================
 */
const esCreacionExitosa = (resultado) => {
   return !(resultado.datos?.insertId <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Crea un nuevo registro en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de creación de un registro:
 * 1. Valida los datos de entrada y los permisos del usuario
 * 2. Crea el nuevo registro en la base de datos
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
 * @param {Object} res.transaccion.movimiento - Datos del registro a crear.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de creación, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const crearTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 3. Crear un nuevo registro en la base de datos
      const resultado = await crearNuevoRegistroBd(res?.transaccion?.empleado, res?.database);

      // 4. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear el registro: ${resultado.error}`);
      }

   

      if (resultado.datos.insertId > 0) {
         for (const cuenta of res?.transaccion?.empleado.cuentas_bancarias) {
            await crearNuevoRegistroBd_cuentas(resultado.datos.insertId, cuenta, res?.database);
         }
      }
      // 5. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al crear el registro: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros.
 * Este módulo expone la funcionalidad de creación de nuevos registros.
 * ====================================================================================================================================
 */
const Empleados_Crear = {
   crearTransaccion,
};

export default Empleados_Crear;
