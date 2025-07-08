/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de compensaciones extra en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevas compensaciones extra
 * en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";  
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
   INSERT INTO gestor_compensacion_extra_tbl ( 
         empresa_id_compensacion_extra_gestor,
         planilla_id_compensacion_extra_gestor,
         empleado_id_compensacion_extra_gestor,
         remuneracion_actual_gestor,
         tipo_jornada_gestor,
         tipo_compensacion_extra_gestor,
         cantidad_horas_gestor,
         fecha_compensacion_gestor,
         monto_compensacion_calculado_gestor,
         motivo_compensacion_gestor,
         aplica_en_compensacion_anual_gestor,
         estado_compensacion_extra_gestor,
         usuario_id_compensacion_extra_gestor
   ) VALUES (
          ?,                                 -- ID de la empresa (debe existir en empresas_tbl)
         ?,                                  -- ID de la planilla (debe existir en planilla_tbl)
         ?,                                 -- ID del empleado (debe existir en gestor_empleado_tbl)
         ?,                                 -- Remuneración actual del empleado
         ?,                                 -- Tipo de jornada (Mensual, Quincenal, Semanal)
         ?,                                 -- Tipo de compensación extra
         ?,                                 -- Cantidad de horas trabajadas
         ?,                                 -- Fecha de la compensación
         ?,                                 -- Monto calculado de la compensación
         ?,                                 -- Motivo de la compensación (opcional)
         ?,                                 -- Aplica en compensación anual (1 = Sí, 0 = No)
         ?,                                 -- Estado de la compensación (Pendiente por defecto)
         ?                                  -- ID del usuario que creó el registro
);
`,
}; 

/**
 * ====================================================================================================================================
 * Inserta un nuevo registro de compensación extra en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de compensación extra
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {Object} datos - Datos de la compensación extra a crear
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
         datos.planilla,
         datos.empleado,
         datos.Remuneracion_Actual,
         datos.tipo_planilla_emepleado,
         datos.tipo_compensacion_extra,
         datos.cantidad_horas,
         datos.fecha_compensacion,
         datos.compensacion_extra,
         datos.motivo_compensacion || null,
         datos.aplica_aguinaldo ? 1 : 0,
         'Pendiente', // Estado inicial por defecto
         usuario_id,
      ],
      database,
   );
   return result;
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
 * Crea un nuevo registro de compensación extra en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de creación de una compensación extra:
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
 * @param {Object} res.transaccion.data - Datos de la compensación extra a crear.
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
      const resultado = await crearNuevoRegistroBd(
         res?.transaccion?.data, 
         res?.transaccion?.user?.id,
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 4. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear la compensación extra: ${resultado.error}`);
      }

      // 5. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al crear la compensación extra: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros.
 * Este módulo expone la funcionalidad de creación de nuevas compensaciones extra.
 * ====================================================================================================================================
 */
const Gestor_Extra_Crear = { 
   crearTransaccion,
};

export default Gestor_Extra_Crear; 
