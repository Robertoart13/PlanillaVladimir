/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de registros de compensación por métrica en el sistema
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevos registros
 * de compensación por métrica en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";  
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";
import bcrypt from "bcryptjs";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro de compensación por métrica en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
   INSERT INTO gestor_compensacion_metrica_tbl ( 
         empresa_id_compensacion_metrica_gestor,
         planilla_id_compensacion_metrica_gestor,
         empleado_id_compensacion_metrica_gestor,
         tipo_compensacion_metrica_gestor,
         monto_compensacion_metrica_gestor,
         motivo_compensacion_gestor,
         fecha_compensacion_metrica_gestor,
         aplica_en_compensacion_anual_gestor,
         estado_compensacion_metrica_gestor,
         usuario_id_compensacion_metrica_gestor
   ) VALUES (
          ?,                                 -- ID de la empresa (debe existir en empresas_tbl)
         ?,                                  -- ID de la planilla (debe existir en planilla_tbl)
         ?,                                 -- ID del empleado (debe existir en gestor_empleado_tbl)
         ?,                                 -- Tipo de compensación por métrica
         ?,                                 -- Monto de la compensación
         ?,                                 -- Motivo de la compensación
         ?,                                 -- Fecha de compensación
         ?,                                 -- Aplica para compensación anual (1 = Sí, 0 = No)
         ?,                                 -- Estado inicial (Pendiente)
         ?                                   -- ID del usuario que creó el registro
);
`,
}; 

/**
 * ====================================================================================================================================
 * Inserta un nuevo registro de compensación por métrica en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de compensación por métrica
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de inserción con datos del registro creado.
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
         datos.tipo_compensacion_metrica || 'productividad', // Valor por defecto
         datos.monto_bonificacion,
         datos.motivo_compensacion,
         datos.fecha_compensacion || new Date().toISOString().split('T')[0], // Fecha actual si no se proporciona
         datos.aplica_Compensacion_Anual ? 1 : 0,
         'Pendiente', // Estado inicial
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
 * Crea un nuevo registro de compensación por métrica en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de creación de un registro de compensación por métrica:
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
      const resultado = await crearNuevoRegistroBd(
         res?.transaccion?.data, 
         res?.transaccion?.user?.id,
         res?.transaccion?.user?.id_empresa,
         res?.database);

      // 4. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear el registro: ${resultado.error}`);
      }

      // 5. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al crear el registro: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros de compensación por métrica.
 * Este módulo expone la funcionalidad de creación de nuevos registros.
 * ====================================================================================================================================
 */
const Gestor_Compensacion_Metrica_Crear = { 
   crearTransaccion,
};

export default Gestor_Compensacion_Metrica_Crear; 
