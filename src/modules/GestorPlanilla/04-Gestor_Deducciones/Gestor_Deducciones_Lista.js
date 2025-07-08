/**
 * ====================================================================================================================================
 * @fileoverview Módulo para listar rebajos a compensación en el sistema
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 *
 * Este módulo proporciona funcionalidades para consultar y listar los rebajos a compensación
 * disponibles en el sistema, con validaciones de permisos y manejo de errores.
 * Incluye funcionalidad para obtener registros específicos por ID.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Estas consultas son usadas para interactuar con la base de datos, recuperando datos necesarios.
 * ====================================================================================================================================
 */
const QUERIES = {
   // Consulta SQL para obtener todos los rebajos a compensación
   QUERIES_SELECT: `
  SELECT 
      grc.*,  -- Todos los campos del registro de rebajo a compensación
      e.nombre_comercial_empresa AS nombre_empresa,
      p.planilla_codigo AS codigo_planilla,
      u.nombre_usuario AS nombre_usuario_creador,
      em.nombre_completo_empleado_gestor AS nombre_empleado
   FROM 
      gestor_rebajo_compensacion_tbl grc
   INNER JOIN 
      empresas_tbl e ON grc.empresa_id_rebajo = e.id_empresa
   INNER JOIN 
      planilla_tbl p ON grc.planilla_id_rebajo = p.planilla_id
   INNER JOIN 
      usuarios_tbl u ON grc.usuario_id_rebajo = u.id_usuario
   INNER JOIN 
      gestor_empleado_tbl em ON grc.empleado_id_rebajo = em.id_empleado_gestor
   WHERE 
      grc.empresa_id_rebajo = ?   -- ← parámetro: ID empresa
      AND (? IS NULL OR grc.estado_rebajo = ?)  -- ← parámetro: estado rebajo (opcional)
      ORDER BY grc.fecha_creacion DESC
      `,
   
   // Consulta SQL para obtener un rebajo a compensación específico
   QUERIES_SELECT_BY_ID: `
  SELECT 
      grc.*,  -- Todos los campos del registro de rebajo a compensación
      e.nombre_comercial_empresa AS nombre_empresa,
      p.planilla_codigo AS codigo_planilla,
      u.nombre_usuario AS nombre_usuario_creador,
      em.nombre_completo_empleado_gestor AS nombre_empleado
   FROM 
      gestor_rebajo_compensacion_tbl grc
   INNER JOIN 
      empresas_tbl e ON grc.empresa_id_rebajo = e.id_empresa
   INNER JOIN 
      planilla_tbl p ON grc.planilla_id_rebajo = p.planilla_id
   INNER JOIN 
      usuarios_tbl u ON grc.usuario_id_rebajo = u.id_usuario
   INNER JOIN 
      gestor_empleado_tbl em ON grc.empleado_id_rebajo = em.id_empleado_gestor
   WHERE 
      grc.id_rebajo_compensacion = ?   -- ← parámetro: ID del rebajo
      AND grc.empresa_id_rebajo = ?    -- ← parámetro: ID empresa
      `,
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener todos los rebajos a compensación.
 *
 * Esta función ejecuta una consulta SQL definida en el objeto `QUERIES`, la cual extrae todos
 * los registros almacenados en la base de datos según los filtros aplicados.
 *
 * @param {string} estados - Estado de los rebajos a filtrar (opcional)
 * @param {number} id_empresa - ID de la empresa
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta con todos los registros
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerTodosDatos = async (estados, id_empresa, database) => {
   try {
      return await realizarConsulta(QUERIES.QUERIES_SELECT, [id_empresa, estados, estados], database);
   } catch (error) {
      return manejarError(
         error,
         500,
         "Error No se puede extraer la lista completa: ",
         `Error al obtener los datos de la base de datos: ${error.message}`,
      );
   }
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener un rebajo a compensación específico.
 *
 * Esta función ejecuta una consulta SQL para obtener un registro específico por su ID.
 *
 * @param {number} id_rebajo - ID del rebajo a compensación
 * @param {number} id_empresa - ID de la empresa
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerDatoPorId = async (id_rebajo, id_empresa, database) => {
   try {
      return await realizarConsulta(QUERIES.QUERIES_SELECT_BY_ID, [id_rebajo, id_empresa], database);
   } catch (error) {
      return manejarError(
         error,
         500,
         "Error No se puede obtener el rebajo a compensación: ",
         `Error al obtener los datos de la base de datos: ${error.message}`,
      );
   }
};

/**
 * ====================================================================================================================================
 * Verifica si la consulta fue exitosa.
 *
 * Esta función evalúa el resultado de la operación de consulta para determinar
 * si se realizó correctamente, verificando el código de estado.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} - `true` si la operación fue exitosa, `false` en caso contrario.
 * ====================================================================================================================================
 */
const esConsultarExitosa = (resultado) => {
   return !(resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Obtiene la lista completa de rebajos a compensación, validando previamente los permisos del usuario.
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

      // 3. Obtener los datos de la base de datos una vez validados los permisos.
      const resultado = await obtenerTodosDatos(
         res.transaccion.data?.estados || null,
         res.transaccion.user.id_empresa,
         res?.database);

      // 4. Verificar si la consulta fue exitosa.
      if (!esConsultarExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al cargar los rebajos a compensación: ${resultado.error}`);
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
 * Obtiene un rebajo a compensación específico por su ID, validando previamente los permisos del usuario.
 *
 * Este método realiza los siguientes pasos:
 * 1. Valida los datos de la solicitud.
 * 2. Verifica si el usuario tiene el permiso requerido para acceder al registro.
 * 3. Si las validaciones son correctas y el usuario tiene permiso, consulta la base de datos.
 * 4. Si todo está bien, retorna el registro específico en una respuesta exitosa.
 *
 * @param {Object} req - Objeto de solicitud HTTP, utilizado para obtener los datos del usuario y la solicitud.
 * @param {Object} res - Objeto de respuesta HTTP, utilizado para enviar la respuesta al cliente.
 * @param {Object} res.transaccion - Información de la transacción actual.
 * @param {Object} res.transaccion.user - Datos del usuario autenticado.
 * @param {number} res.transaccion.user.id - ID del usuario que realiza la solicitud.
 * @param {Object} res.transaccion.acceso - Información sobre los permisos de acceso.
 * @param {string} res.transaccion.acceso.permiso - Código del permiso requerido.
 * @param {string} res.transaccion.acceso.details - Detalles sobre el acceso requerido.
 * @param {Object} res.transaccion.data - Datos de la solicitud, incluyendo el ID del rebajo.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} - Retorna el registro específico si el usuario tiene permisos, o un error si no los tiene.
 * ====================================================================================================================================
 */
const obtenerRegistroPorId = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 2. Validar que se proporcione el ID del rebajo
      const datos = res?.transaccion?.data;
      if (!datos.id_rebajo_compensacion) {
         return crearRespuestaErrorCrear("ID del rebajo a compensación es obligatorio");
      }

      // 3. Obtener el registro específico de la base de datos
      const resultado = await obtenerDatoPorId(
         datos.id_rebajo_compensacion,
         res.transaccion.user.id_empresa,
         res?.database);

      // 4. Verificar si la consulta fue exitosa.
      if (!esConsultarExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al cargar el rebajo a compensación: ${resultado.error}`);
      }

      // 5. Verificar si se encontró el registro
      if (!resultado.datos.array || resultado.datos.array.length === 0) {
         return crearRespuestaErrorCrear("No se encontró el rebajo a compensación especificado");
      }

      // 6. Si la consulta es exitosa, se retornan los datos obtenidos en una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // 7. Manejo de errores centralizado: Si hay cualquier error durante el proceso, se captura y maneja aquí.
      return manejarError(
         error,
         500,
         "Error No se puede obtener el rebajo a compensación: ",
         error.message,
      );
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para listar rebajos a compensación.
 * Este módulo expone la funcionalidad de consulta y listado de rebajos a compensación.
 * ====================================================================================================================================
 */
const Gestor_Deducciones_Listar = { 
   obtenerListaCompleta,
   obtenerRegistroPorId,
};

export default Gestor_Deducciones_Listar; 