/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de registros de vacaciones en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevos registros
 * de vacaciones en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";  
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro de vacaciones en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
   INSERT INTO gestor_vacaciones_tbl (
      empresa_id_vacaciones_gestor,
      empleado_id_vacaciones_gestor,
      planilla_id_vacaciones_gestor,
      fecha_inicio_vacaciones_gestor,
      dias_vacaciones_vacaciones_gestor,
      motivo_vacaciones_gestor,
      estado_vacaciones_gestor,
      activo_vacaciones_gestor,
      usuario_id_vacaciones_gestor
   ) VALUES (
      ?,                -- ID de empresa (debe existir en empresas_tbl)
      ?,                -- ID de empleado (debe existir en gestor_empleado_tbl)
      ?,                -- ID de planilla (debe existir en planilla_tbl)
      ?,                -- Fecha de inicio de vacaciones
      ?,                -- Cantidad de días de vacaciones
      ?,                -- Motivo u observaciones
      ?,                -- Estado del registro (Pendiente por defecto)
      ?,                -- Estado lógico (1=Activo, 0=Inactivo)
      ?                 -- ID de usuario
   );
`,
   QUERIES_CHECK_METRICA: `
   SELECT * FROM Vacaciones_metrica WHERE id_empleado_gestor = ?
   `,
   QUERIES_INSERT_METRICA: `
   INSERT INTO Vacaciones_metrica (
      id_empleado_gestor,
      dias_asignados,
      dias_disfrutados
   ) VALUES (?, 0, ?)
   `,
   QUERIES_UPDATE_METRICA: `
   UPDATE Vacaciones_metrica 
   SET dias_asignados = dias_asignados - ?, 
       dias_disfrutados = dias_disfrutados + ?
   WHERE id_empleado_gestor = ?
   `,
}; 

/**
 * ====================================================================================================================================
 * Inserta un nuevo registro de vacaciones en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de vacaciones
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {Object} datos - Datos de las vacaciones a crear
 * @param {number} usuario_id - ID del usuario que crea el registro
 * @param {number} empresa_id - ID de la empresa
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación de inserción
 * @throws {Error} Si ocurre un error durante la inserción en la base de datos.
 * ====================================================================================================================================
 */
const crearNuevoRegistroBd = async (datos, usuario_id, empresa_id, database) => {
   const result = await realizarConsulta(
      QUERIES.QUERIES_INSERT,
      [
         empresa_id,
         datos.empleado,
         datos.planilla,
         datos.fecha_inicio_vacaciones,
         datos.dias_vacaciones,
         datos.motivo_vacaciones || null,
         'Aprobado', // Estado siempre Aprobado
         datos.estado === "Activo" ? 1 : 0, // Estado lógico
         usuario_id,
      ],
      database,
   );
   return result;
};

/**
 * ====================================================================================================================================
 * Actualiza la métrica de vacaciones del empleado.
 *
 * Esta función verifica si existe un registro en Vacaciones_metrica para el empleado
 * y lo crea o actualiza según corresponda.
 *
 * @param {number} empleado_id - ID del empleado
 * @param {number} dias_vacaciones - Días de vacaciones a procesar
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 * ====================================================================================================================================
 */
const actualizarMetricaVacaciones = async (empleado_id, dias_vacaciones, database) => {
   try {
      // 1. Verificar si existe registro en Vacaciones_metrica
      const checkResult = await realizarConsulta(
         QUERIES.QUERIES_CHECK_METRICA,
         [empleado_id],
         database,
      );

      if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
         // 2. Si existe, actualizar el registro
         const updateResult = await realizarConsulta(
            QUERIES.QUERIES_UPDATE_METRICA,
            [dias_vacaciones, dias_vacaciones, empleado_id],
            database,
         );
         return updateResult;
      } else {
         // 3. Si no existe, crear nuevo registro
         const insertResult = await realizarConsulta(
            QUERIES.QUERIES_INSERT_METRICA,
            [empleado_id, dias_vacaciones],
            database,
         );
         return insertResult;
      }
   } catch (error) {
      console.error('Error al actualizar métrica de vacaciones:', error);
      return { success: false, error: error.message };
   }
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
 * Crea un nuevo registro de vacaciones en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de creación de un registro de vacaciones:
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
 * @param {Object} res.transaccion.data - Datos de las vacaciones a crear.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de creación, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const crearTransaccion = async (req, res) => {

   console.log(res?.transaccion?.data);
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 2. Crear un nuevo registro de vacaciones en la base de datos
      const resultado = await crearNuevoRegistroBd(
         res?.transaccion?.data, 
         res?.transaccion?.user?.id,
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 3. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear el registro de vacaciones: ${resultado.error}`);
      }

      // 4. Actualizar la métrica de vacaciones del empleado
      const resultadoMetrica = await actualizarMetricaVacaciones(
         res?.transaccion?.data?.empleado,
         res?.transaccion?.data?.dias_vacaciones,
         res?.database
      );

      // 5. Verificar si la actualización de métrica fue exitosa
      if (!resultadoMetrica.success) {
         console.error('Error al actualizar métrica de vacaciones:', resultadoMetrica.error);
         // No retornamos error aquí porque el registro de vacaciones ya se creó exitosamente
      }

      // 6. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al crear el registro de vacaciones: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros de vacaciones.
 * Este módulo expone la funcionalidad de creación de nuevos registros de vacaciones.
 * ====================================================================================================================================
 */
const Gestor_Vacaciones_Crear = { 
   crearTransaccion,
};

export default Gestor_Vacaciones_Crear; 