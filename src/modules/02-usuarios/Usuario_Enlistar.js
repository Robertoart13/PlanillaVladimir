/**
 * ====================================================================================================================================
 * @fileoverview Módulo para listar registros en el sistema
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 *
 * Este módulo proporciona funcionalidades para consultar y listar los registros
 * disponibles en el sistema, con validaciones de permisos y manejo de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { verificarPermisosUsuario } from "../../hooks/verificarPermisosUsuario.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

// GUARADAMOS TODOS LOS USUARIOS CON SU EMPRESA RELACIONADAS
// SELECT * FROM HRManagementDB.sys_usuario_empresas;

// GUARDAMOS SOLO A LOS GERENTES CON SUS EMPRESAS A ADMINISTRAR NADA MAS NO OPERADORES NI TI solo GERENTES
// SELECT * FROM HRManagementDB.sys_permisos_gerente_empresa;

// EXISTEN 3 CAMPOS ID OPERADOR ID GERENTE ID EMPRESA
// SELECT * FROM HRManagementDB.sys_gerente_operador

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Estas consultas son usadas para interactuar con la base de datos, recuperando datos necesarios.
 * ====================================================================================================================================
 */
const QUERIES = {
   // Consulta SQL para obtener todos los registros de la tabla
   QUERIES_SELECT_POR_ROL: `
        SELECT 
         u.id_usuario, 
         u.nombre_usuario, 
         u.email_usuario, 
         u.rol_usuario, 
         u.estado_usuario, 
         u.idNetsuite_usuario, 
         u.intentos_usuario, 
         u.recuperacion_clave_usuario, 
         u.verificacion_usuario, 
         r.nombre_rol,
         e.id_empresa,
         e.nombre_empresa
      FROM sys_usuarios u
      LEFT JOIN sys_roles r ON u.rol_usuario = r.id_rol
      LEFT JOIN sys_usuario_empresas ue ON u.id_usuario = ue.id_usuario
      LEFT JOIN sys_empresas e ON ue.id_empresa = e.id_empresa
      JOIN sys_gerente_operador go ON u.id_usuario = go.id_operador
      WHERE go.id_gerente = 2;
 `,
   OBTENER_USUARIOS_ADMIN: `
   SELECT 
    u.id_usuario, 
    u.nombre_usuario, 
    u.email_usuario, 
    u.rol_usuario, 
    u.estado_usuario, 
    u.idNetsuite_usuario, 
    u.intentos_usuario, 
    u.recuperacion_clave_usuario, 
    u.verificacion_usuario, 
    r.nombre_rol,
    GROUP_CONCAT(we.nombre_empresa SEPARATOR ', ') AS nombre_empresa,
    GROUP_CONCAT(we.id_empresa SEPARATOR ', ') AS id_empresa
FROM sys_usuarios u
JOIN sys_usuario_empresas ue ON u.id_usuario = ue.id_usuario
JOIN sys_roles r ON u.rol_usuario = r.id_rol
JOIN sys_empresas we ON ue.id_empresa = we.id_empresa
GROUP BY u.id_usuario;

 `,
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener todos los registros.
 *
 * Esta función ejecuta una consulta SQL definida en el objeto `QUERIES`, la cual extrae todos
 * los registros almacenados en la base de datos sin aplicar filtros.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @param {Object} id_usuario - ID del usuario.
 * @param {Object} rol - Rol del usuario.
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta con todos los registros
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerTodosDatos = async ({ id, rol }, database) => {
   try {
      console.log("ROL: ", rol);
      const esAdmin = String(rol) === "1";

      // Mantener la lógica original
      const query = esAdmin ? QUERIES.OBTENER_USUARIOS_ADMIN : QUERIES.OBTENER_USUARIOS_ADMIN;
      const params = esAdmin ? [] : [id];

      return realizarConsulta(query, params, database);
   } catch (error) {
      return manejarError(
         error,
         500,
         "Error No se puede extraer la lista completa: ",
         `Error al obtener los datos de la base de datos.: ${error.message}`,
      );
   }
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
const esConsultarExitosa = (resultado) => {
   return !(resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Obtiene la lista completa de registros, validando previamente los permisos del usuario.
 *
 * Este método realiza los siguientes pasos:
 * 1. Valida los datos de la solicitud.
 * 2. Verifica si el usuario tiene el permiso requerido para acceder a la lista.
 * 3. Si las validaciones son correctas y el usuario tiene permiso, consulta la base de datos.
 * 4. Si todo está bien, retorna la lista en una respuesta exitosa.
 *
 * @param {Object} req - Objeto de solicitud HTTP, utilizado para obtener los datos del usuario y la solicitud.
 * @param {Object} res - Objeto de respuesta HTTP, utilizado para enviar la respuesta al cliente.
 * @param {Object} res.transaccion - Información de la transacción actual.
 * @param {Object} res.transaccion.user - Datos del usuario autenticado.
 * @param {number} res.transaccion.user.id - ID del usuario que realiza la solicitud.
 * @param {Object} res.transaccion.acceso - Información sobre los permisos de acceso.
 * @param {string} res.transaccion.acceso.permiso - Código del permiso requerido.
 * @param {string} res.transaccion.acceso.details - Detalles sobre el acceso requerido.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} - Retorna la lista si el usuario tiene permisos, o un error si no los tiene.
 * ====================================================================================================================================
 */
const obtenerListaCompleta = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      const details = `${res?.transaccion?.acceso?.details} Por favor, contacta con el administrador del sistema para obtener los accesos necesarios.`;

      // 2. Verificar si el usuario tiene permisos para acceder a la información solicitada.
      const errorPermisos = await verificarPermisosUsuario(
         res?.transaccion?.user?.id, // ID del usuario autenticado, extraído de la transacción
         res?.database, // Conexión a la base de datos
         res?.transaccion?.acceso?.permiso, // Código de permiso necesario para ver la lista
         details,
      );
      if (errorPermisos) return errorPermisos; // Si el usuario no tiene permisos, retorna un error.

      // 3. Obtener los datos de la base de datos una vez validados los permisos.
      const resultado = await obtenerTodosDatos(res?.transaccion.user, res?.database);

      // 4. Verificar si la edición fue exitosa.
      if (!esConsultarExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al cargar el registro: ${resultado.error}`);
      }

      // 4. Si la consulta es exitosa, se retornan los datos obtenidos en una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // 5. Manejo de errores centralizado: Si hay cualquier error durante el proceso, se captura y maneja aquí.
      return manejarError(
         error,
         500,
         "Error No se puede extraer la lista completa: ",
         error.message,
      );
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para interactuar con registros.
 * Este módulo expone la funcionalidad de obtener la lista completa, entre otras.
 * ====================================================================================================================================
 */
const Usuario_Enlistar = {
   obtenerListaCompleta, // Método que obtiene la lista completa, con validaciones y permisos.
};

export default Usuario_Enlistar;
