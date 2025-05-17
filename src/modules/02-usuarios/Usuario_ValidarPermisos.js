import {
   realizarConsulta,
   crearRespuesta,
   manejarError,
} from "../../mysql2-promise/mysql2-promise.js";

/** ====================================================================================================================================
 * Definición de consultas SQL para operaciones con permisos de usuario en la base de datos.
 */
const QUERIES = {
   OBTENER_PERMISOS_DE_USUARIOS: `
     SELECT * FROM sys_usuarios_permisos
     WHERE id_usuario = ?`,
};

/**
 * Obtiene los permisos asignados a un usuario específico desde la base de datos.
 * 
 * @param {number} idUsuario - ID del usuario cuyos permisos se quieren obtener.
 * @param {Object} database - Objeto de conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la consulta de permisos.
 */
const obtenerPermisoPorUsuarioBd = async (idUsuario, database) => {
   return await realizarConsulta(QUERIES.OBTENER_PERMISOS_DE_USUARIOS, [idUsuario], database);
};

/**
 * Genera una respuesta estructurada cuando no se encuentran permisos para el usuario.
 * 
 * @returns {Object} Respuesta indicando que no se encontraron permisos.
 */
const crearRespuestaPermisoNoEncontrado = () => ({
   success: false,
   respuesta: crearRespuesta(
      false,
      404,
      "resultado de la consulta: obtenerPermisoPorUsuario()",
      [],
      {
         details: "Actualmente, no tiene permisos asignados. Por favor, consulte con el administrador del sistema para obtener los accesos necesarios.",
      },
   ),
});

/**
 * Genera una respuesta exitosa con los permisos encontrados del usuario.
 * 
 * @param {Array} permisos - Lista de permisos del usuario obtenidos de la base de datos.
 * @returns {Object} Respuesta exitosa con los permisos encontrados.
 */
const crearRespuestaExitosa = (permisos) => ({ success: true, permisos });

/**
 * Verifica si el resultado de la consulta contiene permisos válidos
 * 
 * @param {Object} resultado - Resultado de la consulta a la base de datos
 * @returns {boolean} True si hay permisos válidos, false en caso contrario
 */
const tienePermisosValidos = (resultado) => Array.isArray(resultado.datos) && resultado.datos.length > 0;

/**
 * Obtiene y devuelve todos los permisos asignados a un usuario específico.
 * 
 * @param {number} idUsuario - ID del usuario cuyos permisos se quieren obtener.
 * @param {Object} database - Objeto de conexión a la base de datos.
 * @returns {Promise<Object>} Respuesta con los permisos del usuario o mensaje de error.
 * 
 * @example
 *  const resultado = await Usuario_ValidarPermisos.obtenerPermisoPorUsuario(1, database);
 */
const obtenerPermisoPorUsuario = async (idUsuario, database) => {
   try {
      if (!idUsuario || !database) {
         return manejarError(
            new Error("Parámetros inválidos"),
            400,
            "Error en obtenerPermisoPorUsuario()",
            "Se requiere un ID de usuario válido y una conexión a la base de datos"
         );
      }

      const resultado = await obtenerPermisoPorUsuarioBd(idUsuario, database);

      return tienePermisosValidos(resultado)
         ? crearRespuestaExitosa(resultado.datos)
         : crearRespuestaPermisoNoEncontrado();
   } catch (error) {
      return manejarError(
         error,
         500,
         "Ocurrió un error al obtener los permisos del usuario: obtenerPermisoPorUsuario()",
         `Error al obtener la lista de permisos: ${error.message}`,
      );
   }
};

/** ====================================================================================================================================
 * Exporta el módulo de validación de permisos de usuario
 */
const Usuario_ValidarPermisos = { obtenerPermisoPorUsuario };

export default Usuario_ValidarPermisos;
