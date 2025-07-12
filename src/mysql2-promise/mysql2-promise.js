/**
 * ====================================================================================================================================
 * @fileoverview Módulo para gestionar conexiones y consultas a MySQL de forma asíncrona
 * @module mysql2-promise
 * @requires mysql2/promise
 * @requires ../config/config
 * @requires buffer
 *
 * Este módulo proporciona una interfaz simplificada para ejecutar consultas SQL
 * con manejo automático de conexiones, formateo de resultados y gestión de errores.
 * Utiliza un patrón de pool de conexiones para mejorar el rendimiento y la escalabilidad.
 * ====================================================================================================================================
 */

import mysql from "mysql2/promise";
import config from "../config/config.js";
import { Buffer } from "buffer";

// Constantes de configuración
const DEFAULT_DATABASE = "pruebas";
const CONNECTION_LIMIT = 15;
const QUEUE_LIMIT = 0;

/**
 * ====================================================================================================================================
 * @typedef {Object} ResultadoConsulta
 * @property {boolean} exito - Indica si la operación fue exitosa
 * @property {Array|Object} datos - Datos resultantes de la operación
 * @property {Object} [info] - Información adicional sobre la operación
 * @property {number} [total] - Total de registros (solo para SELECT)
 * @property {string} [mensaje] - Mensaje descriptivo del resultado
 * @property {string} [error] - Mensaje de error (solo cuando exito=false)
 * @property {string} [codigo] - Código de error (solo cuando exito=false)
 * ====================================================================================================================================
 */

/**
 * ====================================================================================================================================
 * @typedef {Object} ConfiguracionPool
 * @property {boolean} waitForConnections - Indica si se debe esperar por conexiones disponibles
 * @property {number} connectionLimit - Número máximo de conexiones permitidas
 * @property {number} queueLimit - Límite de la cola de espera (0 = sin límite)
 * ====================================================================================================================================
 */

/**
 * ====================================================================================================================================
 * Crea y configura un pool de conexiones para la base de datos especificada.
 *
 * Esta función utiliza la configuración de base de datos proporcionada en el archivo de configuración
 * para crear un pool de conexiones, que es una manera eficiente de manejar múltiples conexiones a
 * una base de datos sin necesidad de abrir y cerrar conexiones repetidamente.
 *
 * @param {string} baseDatos - Nombre de la base de datos a la que se desea conectar.
 * @returns {mysql.Pool} - Pool de conexiones configurado.
 * @throws {Error} Si la configuración de la base de datos no es válida o no se encuentra.
 *
 * @example
 * const pool = createConnectionPool('miBaseDeDatos');
 * // Usar pool para hacer consultas a la base de datos.
 * ====================================================================================================================================
 */
function createConnectionPool(baseDatos) {
   // Obtiene la configuración de la base de datos desde la configuración general
   const configuracionBD = config.database[baseDatos];

   // Si no se encuentra la configuración, lanza un error
   if (!configuracionBD) {
      throw new Error(`Configuración no encontrada para la base de datos: ${baseDatos}`);
   }

   // Crea y retorna el pool de conexiones con los parámetros configurados
   return mysql.createPool({
      ...configuracionBD, // Propiedades específicas de la base de datos
      waitForConnections: true,
      connectionLimit: CONNECTION_LIMIT,
      queueLimit: QUEUE_LIMIT,
      charset: "utf8mb4", // Soporte completo para caracteres especiales
      collation: "utf8mb4_unicode_ci", // Collation para ordenamiento correcto
   });
}

/**
 * ====================================================================================================================================
 * Ejecuta una consulta SQL utilizando una conexión del pool.
 *
 * Esta función se conecta al pool, ejecuta una consulta SQL con los parámetros proporcionados,
 * y retorna el resultado de la consulta. Gestiona automáticamente la adquisición y liberación
 * de la conexión para garantizar el uso eficiente de recursos.
 *
 * @async
 * @param {mysql.Pool} pool - Pool de conexiones MySQL previamente creado.
 * @param {string} consulta - Consulta SQL a ejecutar, puede ser una consulta preparada.
 * @param {Array} parametros - Array de parámetros que serán usados en la consulta preparada.
 * @returns {Promise<Array>} Resultado de la consulta ejecutada.
 * @throws {Error} Si ocurre un error durante la ejecución de la consulta, como un problema de conexión o de sintaxis SQL.
 *
 * @example
 * try {
 *   const resultado = await executeQuery(pool, 'SELECT * FROM usuarios WHERE id = ?', [1]);
 *   console.log('Resultado de la consulta:', resultado);
 * } catch (error) {
 *   console.error('Error al ejecutar la consulta:', error);
 * }
 * ====================================================================================================================================
 */
async function executeQuery(pool, consulta, parametros) {
   // Obtener una conexión del pool de conexiones
   const conexion = await pool.getConnection();
   try {
      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [resultado] = await conexion.query(consulta, parametros);
      return resultado; // Retornar el resultado de la consulta
   } finally {
      // Liberar la conexión para que pueda ser reutilizada por otros clientes
      conexion.release();
   }
}

/**
 * ====================================================================================================================================
 * Formatea el resultado de una consulta SELECT.
 *
 * Esta función recibe el resultado de una consulta SELECT y lo formatea en un objeto estructurado
 * que contiene la información del éxito de la consulta, los datos obtenidos y el total de registros.
 *
 * @param {Array} resultado - Resultado de la consulta SQL, que debe ser un array de objetos.
 * @returns {ResultadoConsulta} - Resultado formateado, con las propiedades de éxito, datos y total.
 *
 * @example
 * const resultadoConsulta = await executeQuery(pool, 'SELECT * FROM usuarios');
 * const resultadoFormateado = formatSelectResult(resultadoConsulta);
 * console.log(resultadoFormateado);
 * // {
 * //   exito: true,
 * //   info: [...],
 * //   datos: [{id: 1, nombre: 'Usuario1'}, ...],
 * //   total: 10
 * // }
 * ====================================================================================================================================
 */
function formatSelectResult(resultado) {
   return {
      exito: true, // La consulta fue exitosa
      info: resultado, // Información adicional sobre la operación
      datos: resultado.length > 0 ? resultado : [], // Si hay resultados, los devuelve; si no, devuelve un array vacío
      total: resultado.length, // Número total de resultados
   };
}

/**
 * ====================================================================================================================================
 * Formatea el resultado de una consulta INSERT
 *
 * Estructura un objeto de respuesta estándar para operaciones de inserción en la base de datos.
 * Proporciona acceso al ID del nuevo registro y un mensaje descriptivo sobre la operación.
 *
 * @param {Object} resultado - Resultado de la consulta INSERT, que contiene información sobre la operación realizada.
 * @param {number} resultado.insertId - ID del registro recién insertado.
 * @param {number} resultado.affectedRows - Número de filas afectadas por la inserción.
 * @returns {ResultadoConsulta} - Objeto formateado con detalles sobre la inserción.
 *
 * @example
 * const resultado = await executeQuery(pool, "INSERT INTO users (name) VALUES (?)", ["Juan"]);
 * const respuesta = formatInsertResult(resultado);
 * console.log(respuesta);
 * // {
 * //    exito: true,
 * //    info: { insertId: 123, affectedRows: 1, ... },
 * //    datos: { insertId: 123 },
 * //    mensaje: 'Registro creado exitosamente'
 * // }
 * ====================================================================================================================================
 */
function formatInsertResult(resultado) {
   return {
      exito: true, // Indica que la operación fue exitosa
      info: resultado, // Información adicional sobre la operación
      datos: { insertId: resultado.insertId }, // Devuelve el ID del nuevo registro insertado
      mensaje: "Registro creado exitosamente", // Mensaje informativo sobre la inserción
   };
}

/**
 * ====================================================================================================================================
 * Formatea el resultado de una consulta UPDATE
 *
 * Estructura un objeto de respuesta estándar para operaciones de actualización en la base de datos.
 * Incluye el número de filas afectadas y un mensaje descriptivo del resultado de la operación.
 *
 * @param {Object} resultado - Resultado de la consulta UPDATE.
 * @param {number} resultado.affectedRows - Número de filas afectadas por la actualización.
 * @param {number} [resultado.changedRows] - Número de filas realmente modificadas.
 * @returns {ResultadoConsulta} - Objeto formateado con detalles sobre la actualización.
 *
 * @example
 * const resultado = await executeQuery(pool, "UPDATE users SET name = ? WHERE id = ?", ["Carlos", 1]);
 * const respuesta = formatUpdateResult(resultado);
 * console.log(respuesta);
 * // {
 * //    exito: true,
 * //    info: { affectedRows: 1, changedRows: 1, ... },
 * //    datos: { affectedRows: 1 },
 * //    mensaje: '1 registro(s) actualizado(s)'
 * // }
 * ====================================================================================================================================
 */
function formatUpdateResult(resultado) {
   return {
      exito: true, // Indica que la operación fue exitosa
      info: resultado, // Información adicional sobre la operación
      datos: { affectedRows: resultado.affectedRows }, // Cantidad de registros afectados por la actualización
      mensaje: `${resultado.affectedRows} registro(s) actualizado(s)`, // Mensaje informativo sobre la actualización
   };
}

/**
 * ====================================================================================================================================
 * Formatea el resultado de una consulta DELETE
 *
 * Estructura un objeto de respuesta estándar para operaciones de eliminación en la base de datos.
 * Proporciona información sobre la cantidad de registros eliminados y un mensaje descriptivo.
 *
 * @param {Object} resultado - Resultado de la consulta DELETE.
 * @param {number} resultado.affectedRows - Número de filas eliminadas por la operación.
 * @returns {ResultadoConsulta} - Objeto formateado con detalles sobre la eliminación.
 *
 * @example
 * const resultado = await executeQuery(pool, "DELETE FROM users WHERE id = ?", [1]);
 * const respuesta = formatDeleteResult(resultado);
 * console.log(respuesta);
 * // {
 * //    exito: true,
 * //    info: { affectedRows: 1, ... },
 * //    datos: { affectedRows: 1 },
 * //    mensaje: '1 registro(s) eliminado(s)'
 * // }
 * ====================================================================================================================================
 */
function formatDeleteResult(resultado) {
   return {
      exito: true, // Indica que la operación fue exitosa
      info: resultado, // Información adicional sobre la operación
      datos: { affectedRows: resultado.affectedRows }, // Cantidad de registros eliminados
      mensaje: `${resultado.affectedRows} registro(s) eliminado(s)`, // Mensaje informativo sobre la eliminación
   };
}

/**
 * ====================================================================================================================================
 * Determina y ejecuta el formateador adecuado según el tipo de consulta SQL
 *
 * Analiza la consulta para identificar si es un SELECT, INSERT, UPDATE o DELETE y aplica el formato correspondiente.
 * Esto permite tener una interfaz unificada para el procesamiento de diferentes tipos de operaciones SQL.
 *
 * @param {string} consulta - Consulta SQL ejecutada.
 * @param {Object} resultado - Resultado de la consulta, obtenido de la ejecución en la base de datos.
 * @returns {ResultadoConsulta} - Objeto formateado con los datos estructurados según el tipo de operación.
 *
 * @example
 * const resultado = await executeQuery(pool, "SELECT * FROM users WHERE id = ?", [1]);
 * const respuesta = formatQueryResult("SELECT * FROM users WHERE id = ?", resultado);
 * console.log(respuesta);
 * // Para un SELECT:
 * // {
 * //    exito: true,
 * //    info: [...],
 * //    datos: [{ id: 1, nombre: "John Doe", email: "john@example.com" }],
 * //    total: 1
 * // }
 * ====================================================================================================================================
 */
function formatQueryResult(consulta, resultado) {
   // Obtiene el primer término de la consulta para determinar el tipo de operación (select, insert, update, delete)
   const tipoOperacion = consulta.trim().toLowerCase().split(" ")[0];

   // Aplica el formateador correspondiente según el tipo de operación
   switch (tipoOperacion) {
      case "select":
         return formatSelectResult(resultado);
      case "insert":
         return formatInsertResult(resultado);
      case "update":
         return formatUpdateResult(resultado);
      case "delete":
         return formatDeleteResult(resultado);
      default:
         return { exito: true, datos: resultado }; // Retorna el resultado sin modificar si no es una operación reconocida
   }
}

/**
 * ====================================================================================================================================
 * Maneja errores de la base de datos y los formatea en una estructura uniforme.
 *
 * Extrae el mensaje de error y el código de error de MySQL para proporcionar información útil al cliente.
 * Estandariza el formato de los errores para facilitar su procesamiento en la aplicación.
 *
 * @param {Error} error - Objeto de error generado durante la ejecución de la consulta.
 * @param {string} [error.code] - Código de error de MySQL (si está disponible).
 * @param {string} error.message - Mensaje descriptivo del error ocurrido.
 * @returns {ResultadoConsulta} - Objeto formateado con detalles del error.
 *
 * @example
 * try {
 *    const resultado = await executeQuery(pool, "SELECT * FROM tabla_inexistente");
 * } catch (error) {
 *    console.error(handleDatabaseError(error));
 *    // {
 *    //    exito: false,
 *    //    error: "Table 'database.tabla_inexistente' doesn't exist",
 *    //    codigo: "ER_NO_SUCH_TABLE"
 *    // }
 * }
 * ====================================================================================================================================
 */
function handleDatabaseError(error) {
   return {
      exito: false, // Indica que la operación no fue exitosa
      error: error.message, // Mensaje descriptivo del error
      codigo: error.code || null, // Código del error de MySQL si está disponible
   };
}

/**
 * ====================================================================================================================================
 * Ejecuta una consulta SQL de forma genérica con manejo automático de conexiones.
 *
 * Reutiliza un pool de conexiones existente o crea uno nuevo si es necesario,
 * mejorando el rendimiento al evitar crear conexiones redundantes. Gestiona automáticamente
 * los errores y formatea las respuestas según el tipo de consulta.
 *
 * @async
 * @function ejecutarConsulta
 * @param {string} consulta - Consulta SQL a ejecutar (SELECT, INSERT, UPDATE, DELETE)
 * @param {Array} [parametros=[]] - Parámetros para la consulta preparada
 * @param {string} [baseDatos=DEFAULT_DATABASE] - Nombre de la base de datos a utilizar
 * @returns {Promise<ResultadoConsulta>} Objeto con el resultado formateado de la operación
 *
 * @example
 * // Ejemplo de SELECT
 * const usuarios = await ejecutarConsulta(
 *    "SELECT * FROM usuarios WHERE edad > ?",
 *    [18],
 *    "mi_base_datos"
 * );
 * console.log(usuarios);
 * // {
 * //    exito: true,
 * //    datos: [{ id: 1, nombre: "Juan", edad: 25 }, ...],
 * //    total: 10
 * // }
 *
 * @example
 * // Ejemplo de INSERT
 * const insercion = await ejecutarConsulta(
 *    "INSERT INTO usuarios (nombre, email) VALUES (?, ?)",
 *    ["Juan", "juan@email.com"]
 * );
 * console.log(insercion);
 * // {
 * //    exito: true,
 * //    datos: { insertId: 123 },
 * //    mensaje: "Registro creado exitosamente"
 * // }
 * ====================================================================================================================================
 */
export const ejecutarConsulta = async (consulta, parametros = [], baseDatos = DEFAULT_DATABASE) => {
   // Reutilización del pool en lugar de crearlo en cada consulta
   if (!global.pools) global.pools = {};
   if (!global.pools[baseDatos]) {
      global.pools[baseDatos] = createConnectionPool(baseDatos);
   }

   const pool = global.pools[baseDatos];

   try {
      const resultado = await executeQuery(pool, consulta, parametros);
      return formatQueryResult(consulta, resultado);
   } catch (error) {
      return crearRespuesta(
         false,
         500,
         "❌ Error en la base de datos:",
         [],
         error.message,
      );
   }
};

/**
 * ====================================================================================================================================
 * Ejecuta una consulta SQL y maneja los errores de forma controlada.
 *
 * Proporciona una capa adicional de seguridad para ejecutar consultas SQL,
 * capturando cualquier error y devolviendo una respuesta estructurada.
 * Útil cuando se necesita manejar errores de forma más específica que con ejecutarConsulta.
 *
 * @async
 * @param {string} query - Consulta SQL a ejecutar
 * @param {Array} params - Parámetros para la consulta SQL
 * @param {string} db - Nombre de la base de datos a utilizar
 * @returns {Promise<Object>} Resultado de la consulta o respuesta de error estandarizada
 *
 * @example
 * const resultado = await realizarConsulta(
 *    "SELECT * FROM usuarios WHERE id = ?",
 *    [1],
 *    "mi_base_datos"
 * );
 * if (resultado.success) {
 *    console.log("Datos obtenidos:", resultado.data);
 * } else {
 *    console.error("Error:", resultado.error);
 * }
 * ====================================================================================================================================
 */
export const realizarConsulta = async (query, params, db) => {
   try {
      return await ejecutarConsulta(query, params, db);
   } catch (error) {
      
      return crearRespuesta(
         false,
         500,
         "Error en la consulta a la base de datos",
         [],
         error.message,
      );
   }
};

/**
 * ====================================================================================================================================
 * Crea una respuesta estandarizada para las operaciones de la API.
 *
 * Genera un objeto de respuesta con una estructura uniforme para todas las operaciones,
 * facilitando el procesamiento en el cliente y manteniendo la consistencia en la API.
 *
 * @param {boolean} success - Indica si la operación fue exitosa
 * @param {number} status - Código de estado HTTP
 * @param {string} message - Mensaje descriptivo de la operación
 * @param {Array|Object} [data=[]] - Datos devueltos por la operación
 * @param {string|Object} [error=""] - Mensaje de error o objeto con detalles del error
 * @returns {Object} Objeto de respuesta estandarizado
 *
 * @example
 * // Respuesta exitosa
 * const respuestaExitosa = crearRespuesta(
 *    true,
 *    200,
 *    "Operación completada con éxito",
 *    [{ id: 1, nombre: "Juan" }]
 * );
 *
 * // Respuesta de error
 * const respuestaError = crearRespuesta(
 *    false,
 *    404,
 *    "Recurso no encontrado",
 *    [],
 *    "El usuario solicitado no existe"
 * );
 * ====================================================================================================================================
 */
export const crearRespuesta = (success, status, message, data = [], error = "") => {
   return { success, status, message, data, error };
};

/**
 * ====================================================================================================================================
 * Maneja los errores de manera consistente a lo largo de la aplicación.
 *
 * Esta función captura los errores generados en distintas partes de la aplicación, los registra en la consola para facilitar la depuración
 * y devuelve una respuesta estandarizada al cliente con un mensaje amigable para el usuario y detalles técnicos opcionales para el desarrollo.
 *
 * @param {Error} error - Objeto de error capturado, que contiene detalles sobre el error ocurrido.
 * @param {number} status - Código de estado HTTP que se debe devolver, indicando el tipo de error (ej. 500 para error interno del servidor).
 * @param {string} userMessage - Mensaje amigable para el usuario, explicando el error de manera comprensible.
 * @param {string} [technicalDetails] - Detalles técnicos opcionales para depuración, como el mensaje de error completo o stack trace.
 * @returns {Object} Respuesta estandarizada con información del error
 *
 * @example
 * try {
 *    // Código que puede generar un error
 *    throw new Error("Error en la conexión con la base de datos");
 * } catch (error) {
 *    return manejarError(
 *       error,
 *       500,
 *       "Ha ocurrido un error al conectar con el servidor",
 *       "Error específico: Timeout en la conexión"
 *    );
 *    // {
 *    //    success: false,
 *    //    status: 500,
 *    //    message: "Ha ocurrido un error al conectar con el servidor",
 *    //    data: [],
 *    //    error: { details: "Error específico: Timeout en la conexión" }
 *    // }
 * }
 * ====================================================================================================================================
 */
export const manejarError = (error, status, userMessage, technicalDetails) => {
   return crearRespuesta(false, status, userMessage, [], {
      details: technicalDetails || error.message, // Include technical details if provided
   });
};

/**
 * ====================================================================================================================================
 * Encodes a string in Base64 format
 * 
 * Utilidad para codificar cadenas de texto en formato Base64, útil para tokens,
 * autenticación básica y otros casos donde se requiere codificación segura.
 *
 * @param {string} str - The string to encode
 * @returns {string} Base64 encoded string
 * 
 * @example
 * const textoOriginal = "usuario:contraseña";
 * const textoCodificado = codificarBase64(textoOriginal);
 * console.log(textoCodificado); // "dXN1YXJpbzpjb250cmFzZcOxYQ=="
 * ====================================================================================================================================
 */
export const codificarBase64 = (str) => Buffer.from(str, "utf8").toString("base64");

