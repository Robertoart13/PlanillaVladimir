/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la gestión de operaciones de edición en el sistema
 * @description Este módulo proporciona las funcionalidades necesarias para actualizar registros
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
   QUERIES_UPDATE: `
     UPDATE sys_usuarios
     SET nombre_usuario = ?,
         rol_usuario = ?,
         email_usuario = ?,
         idNetsuite_usuario = ?,
         cedula_usuario = ?
     WHERE id_usuario = ?
   `,

   /**
    * Inserta una relación entre un usuario y una empresa en la base de datos.
    *
    * @param {number} id_usuario - El ID del usuario que se asociará a la empresa.
    * @param {number} id_empresa - El ID de la empresa que se asociará al usuario.
    */
   INSERT_EMPRESA_USUARIO: `
    INSERT INTO sys_usuario_empresas (id_usuario, id_empresa)
    VALUES (?, ?)
  `,

   /**
    * Inserta una relación entre un gerente y un operador en la base de datos.
    *
    * @param {number} id_gerente - El ID del gerente que será asociado al operador.
    * @param {number} id_operador - El ID del operador que será asociado al gerente.
    */
   INSERT_OPERADOR_GERENTE: `
    INSERT INTO sys_gerente_operador (id_gerente, id_operador)
    VALUES (?, ?)
  `,

   ELIMINAR_EMPRESA_USUARIO: `
    DELETE FROM sys_usuario_empresas WHERE id_usuario= ?
  `,
   ELIMINAR_OPERADOR_GERENTE: `
    DELETE FROM sys_gerente_operador WHERE id_gerente=?
  `,
};

/**
 * Actualiza un registro en la base de datos según los parámetros proporcionados.
 *
 * @param {Object} data - Objeto con los datos a actualizar
 * @param {string} data.nombre - Nombre del registro
 * @param {string} data.rol - Rol asignado
 * @param {string} data.correo - Correo electrónico
 * @param {string} data.idNetsuite - Identificador de Netsuite
 * @param {string} data.cedula - Número de identificación
 * @param {string} data.id_usuario - Identificador único del registro
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación de actualización
 */
const editarRegistroBd = async (data, database) => {
   const { nombre, rol, correo, idNetsuite, cedula, id_usuario } = data;
   return await realizarConsulta(
      QUERIES.QUERIES_UPDATE,
      [nombre, rol, correo, idNetsuite, cedula, id_usuario],
      database,
   );
};

/**
 * Gestiona las relaciones entre entidades en la base de datos.
 *
 * @param {Object} datosRelacion - Datos de la relación a establecer
 * @param {number} datosRelacion.id_principal - ID de la entidad principal
 * @param {number} datosRelacion.id_secundario - ID de la entidad secundaria
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const insertartEmpresaUsuario = async (id_usuario, id_empresa, database) => {
   return await realizarConsulta(
      QUERIES.INSERT_EMPRESA_USUARIO,
      [id_usuario, id_empresa],
      database,
   );
};

/**
 * Elimina una relación entre un usuario y una empresa en la base de datos.
 *
 * @param {number} id_usuario - El ID del usuario que se asociará a la empresa.
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const ELIMINAR_EMPRESA_USUARIO = async (id_usuario, database) => {
   return await realizarConsulta(QUERIES.ELIMINAR_EMPRESA_USUARIO, [id_usuario], database);
};

/**
 * Elimina una relación entre un gerente y un operador en la base de datos.
 *
 * @param {number} id_usuario - El ID del usuario que se asociará a la empresa.
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const ELIMINAR_OPERADOR_GERENTE = async (id_usuario, database) => {
   return await realizarConsulta(QUERIES.ELIMINAR_OPERADOR_GERENTE, [id_usuario], database);
};

/**
 * Gestiona las relaciones jerárquicas entre entidades en el sistema.
 *
 * @param {number} id_superior - ID de la entidad superior en la jerarquía
 * @param {number} id_subordinado - ID de la entidad subordinada
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const InsertarOperdor_gerente = async (id_usuario, operadorId, database) => {
   return await realizarConsulta(
      QUERIES.INSERT_OPERADOR_GERENTE,
      [id_usuario, operadorId],
      database,
   );
};

/**
 * Verifica el resultado de una operación de edición.
 *
 * @param {Object} resultado - Resultado de la operación
 * @param {Object} [resultado.datos] - Datos de la operación
 * @param {number} [resultado.datos.affectedRows] - Número de registros afectados
 * @param {number} [resultado.status] - Código de estado de la operación
 * @returns {boolean} true si la operación fue exitosa, false en caso contrario
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

      const details = `${res?.transaccion?.acceso?.details} Por favor, contacta con el administrador del sistema para obtener los accesos necesarios.`;

      // 2. Verificar si el usuario tiene permisos para acceder a la información solicitada.
      const errorPermisos = await verificarPermisosUsuario(
         res?.transaccion?.user?.id, // ID del usuario autenticado, extraído de la transacción
         res?.database, // Conexión a la base de datos
         res?.transaccion?.acceso?.permiso, // Código de permiso necesario para realizar la edición
         details,
      );
      if (errorPermisos) return errorPermisos; // Si el usuario no tiene permisos, retorna un error.

      // 3. Realizar la edición en la base de datos
      const resultado = await editarRegistroBd(res?.transaccion.usuario, res?.database);

      // 4. Verificar si la edición fue exitosa.
      if (!esEdicionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al editar el registro: ${resultado.error}`);
      }

      await editarUsuarioEmpresa(
         {
            id_usuario: res?.transaccion?.usuario?.id_usuario,
            id_empresa: res?.transaccion?.usuario?.empresas,
            operadores: res?.transaccion?.usuario?.operadores,
         },
         res?.database,
      );

      // 5. Si la edición fue exitosa, retornar una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al editar el registro: ", error.message);
   }
};

/**
 * Gestiona las relaciones y asociaciones entre entidades del sistema de forma secuencial.
 *
 * @param {Object} datosEntidad - Datos de las relaciones a establecer
 * @param {number} datosEntidad.id_usuario - ID de la entidad principal
 * @param {Array<number>} datosEntidad.id_empresa - IDs de las entidades relacionadas
 * @param {Array<number>} datosEntidad.operadores - IDs de las entidades subordinadas
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object|null>} Resultado de la operación o null si fue exitosa
 */
const editarUsuarioEmpresa = async (datosUsuario, database) => {
   try {
      const { id_usuario, id_empresa, operadores } = datosUsuario;

      // Procesar inserción de empresas secuencialmente
      if (Array.isArray(id_empresa) && id_empresa.length > 0) {
         try {
            await ELIMINAR_EMPRESA_USUARIO(id_usuario, database);
            for (const empresaId of id_empresa) {
               await insertartEmpresaUsuario(id_usuario, empresaId, database);
               console.log(`Empresa ${empresaId} procesada correctamente`);
            }
         } catch (empresaError) {
            console.error("Error al procesar empresa:", empresaError);
            throw empresaError;
         }
      } else {
         await ELIMINAR_EMPRESA_USUARIO(id_usuario, database);
      }

      // Procesar inserción de operadores secuencialmente
      if (Array.isArray(operadores) && operadores.length > 0) {
         try {
            await ELIMINAR_OPERADOR_GERENTE(id_usuario, database);
            for (const operadorId of operadores) {
               await InsertarOperdor_gerente(id_usuario, operadorId, database);
               console.log(`Operador ${operadorId} procesado correctamente`);
            }
         } catch (operadorError) {
            console.error("Error al procesar operador:", operadorError);
            throw operadorError;
         }
      } else {
         await ELIMINAR_OPERADOR_GERENTE(id_usuario, database);
      }

      return null;
   } catch (error) {
      console.error("Error general en editarUsuarioEmpresa:", error);
      return manejarError(
         error,
         500,
         "Error en editarUsuarioEmpresa()",
         `No se pudo procesar la relación: ${error.message}`,
      );
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para editar registros.
 * Este módulo expone la funcionalidad de edición de registros existentes.
 * ====================================================================================================================================
 */
const Usuarios_Editar = {
   editarTransaccionInfo: editarTransaccion,
};

export default Usuarios_Editar;
