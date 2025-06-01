/**
 * =============================================================================================================
 * @file Planilla_Insertar_Empleado.js
 * @module Planilla_Insertar_Empleado
 * @description Módulo para la creación y actualización de registros de empleados en la planilla.
 *
 * Este módulo proporciona funciones para insertar o actualizar registros en la tabla empleado_planilla_detalle_tbl,
 * validando permisos y manejando errores de forma estructurada.
 *
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 * =============================================================================================================
 */

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

/**
 * =============================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * =============================================================================================================
 * - QUERIES_INSERT: Inserta un nuevo registro en la tabla.
 * - UPDATE_INSERT: Actualiza un registro existente (sin modificar claves primarias).
 * - SELECT_INSERT: Consulta si ya existe un registro con los IDs dados.
 * =============================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
   INSERT INTO empleado_planilla_detalle_tbl (
    id_empleado_epd,
    id_empresa_epd,
    planilla_id_epd,
    id_usuario_creador_epd,
    semana_epd,
    remuneracion_bruta_epd,
    fcl_1_5_epd,
    rob_3_25_epd,
    rebajos_cliente_epd,
    cuota_ccss_epd,
    rebajos_opu_epd,
    reintegro_cliente_epd,
    reintegro_opu_epd,
    deposito_x_tecurso_epd,
    total_deducciones_epd,
    total_reintegros_epd,
    remuneracion_neta_epd,
    estado_epd,
    marca_epd
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
   UPDATE_INSERT: `
   UPDATE empleado_planilla_detalle_tbl
   SET
   id_usuario_creador_epd = ?,
   semana_epd = ?,
   remuneracion_bruta_epd = ?,
   fcl_1_5_epd = ?,
   rob_3_25_epd = ?,
   rebajos_cliente_epd = ?,
   cuota_ccss_epd = ?,
   rebajos_opu_epd = ?,
   reintegro_cliente_epd = ?,
   reintegro_opu_epd = ?,
   deposito_x_tecurso_epd = ?,
   total_deducciones_epd = ?,
   total_reintegros_epd = ?,
   remuneracion_neta_epd = ?,
   estado_epd = ?,
   marca_epd = ?
   WHERE id_empleado_epd = ? and id_empresa_epd = ? and planilla_id_epd = ?;
`,
   SELECT_INSERT: `
   SELECT * FROM empleado_planilla_detalle_tbl
   WHERE id_empleado_epd = ? and id_empresa_epd = ? and planilla_id_epd = ?;
`,
};

/**
 * Inserta o actualiza un registro de empleado en la planilla.
 *
 * @async
 * @function crearNuevoRegistroBd
 * @param {Object} datos - Datos del registro a insertar o actualizar.
 * @param {number} userID - ID del usuario que realiza la operación.
 * @param {Object|string} database - Conexión o nombre de la base de datos.
 * @returns {Promise<Object>} Resultado de la operación.
 *
 * @example
 * const resultado = await crearNuevoRegistroBd(datos, userID, database);
 * if (resultado.status === 200) { ... }
 */
const crearNuevoRegistroBd = async (datos, userID, database) => {
   // Buscar si ya existe el registro
   let result = await realizarConsulta(
      QUERIES.SELECT_INSERT,
      [
         datos.datos.id_empleado_emp_tbl,
         datos.id_empresa,
         datos.id_planilla,
      ],
      database,
   );

   // Si no existe, insertar
   if (result.datos.length === 0) {
      result = await realizarConsulta(
         QUERIES.QUERIES_INSERT,
         [
            datos.datos.id_empleado_emp_tbl, // id_empleado_epd
            datos.id_empresa,                // id_empresa_epd
            datos.id_planilla,               // planilla_id_epd
            userID,                          // id_usuario_creador_epd
            datos.datos.semana,              // semana_epd
            datos.datos.bruta,               // remuneracion_bruta_epd
            datos.datos.fcl,                 // fcl_1_5_epd
            "0",                            // rob_3_25_epd (ajustar si corresponde)
            datos.datos.rebajosCliente,      // rebajos_cliente_epd
            datos.datos.cuota,               // cuota_ccss_epd
            datos.datos.rebajosOPU,          // rebajos_opu_epd
            datos.datos.reintegroCliente,    // reintegro_cliente_epd
            datos.datos.reintegrosOPU,       // reintegro_opu_epd
            datos.datos.deposito,            // deposito_x_tecurso_epd
            datos.datos.totalDeducciones,    // total_deducciones_epd
            datos.datos.totalReintegros,     // total_reintegros_epd
            datos.datos.neta,                // remuneracion_neta_epd
            "pendiente",                    // estado_epd
            "1",                            // marca_epd
         ],
         database,
      );
   }
   // Si existe, actualizar
   else {
      result = await realizarConsulta(
         QUERIES.UPDATE_INSERT,
         [
            userID,                          // id_usuario_creador_epd
            datos.datos.semana,              // semana_epd
            datos.datos.bruta,               // remuneracion_bruta_epd
            datos.datos.fcl,                 // fcl_1_5_epd
            "0",                            // rob_3_25_epd
            datos.datos.rebajosCliente,      // rebajos_cliente_epd
            datos.datos.cuota,               // cuota_ccss_epd
            datos.datos.rebajosOPU,          // rebajos_opu_epd
            datos.datos.reintegroCliente,    // reintegro_cliente_epd
            datos.datos.reintegrosOPU,       // reintegro_opu_epd
            datos.datos.deposito,            // deposito_x_tecurso_epd
            datos.datos.totalDeducciones,    // total_deducciones_epd
            datos.datos.totalReintegros,     // total_reintegros_epd
            datos.datos.neta,                // remuneracion_neta_epd
            "pendiente",                    // estado_epd
            "1",                            // marca_epd
            datos.datos.id_empleado_emp_tbl, // WHERE id_empleado_epd
            datos.id_empresa,                // WHERE id_empresa_epd
            datos.id_planilla,               // WHERE planilla_id_epd
         ],
         database,
      );
   }
   return result;
};

/**
 * Verifica si la creación o actualización del registro fue exitosa.
 *
 * @function esCreacionExitosa
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @returns {boolean} True si la operación fue exitosa, false en caso contrario.
 */
const esCreacionExitosa = (resultado) => {
   return !(resultado.datos?.insertId <= 0 || resultado?.status === 500);
};

/**
 * Crea un nuevo registro en el sistema, validando previamente el acceso del usuario.
 *
 * @async
 * @function crearTransaccion
 * @param {Object} req - Objeto de solicitud HTTP (no usado, reservado para futuro).
 * @param {Object} res - Objeto de respuesta HTTP con información de la transacción.
 * @returns {Promise<Object>} Resultado de la operación de creación, con datos del registro o mensajes de error.
 *
 * @example
 * // Uso típico en un endpoint:
 * const respuesta = await Planilla_Insertar_Empleado.Planilla_Insertar_Empleado(req, res);
 * if (respuesta.status === 200) { ... }
 */
const crearTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (formato y autenticidad)
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion;

      // 2. Crear o actualizar el registro en la base de datos
      const resultado = await crearNuevoRegistroBd(res?.transaccion?.data, res?.transaccion?.user?.id, res?.database);

      // 3. Verificar si la operación fue exitosa
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear el registro: ${resultado.error}`);
      }

      // 4. Retornar respuesta exitosa
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error al crear el registro: ", error.message);
   }
};

/**
 * Exporta el módulo con la función principal para insertar empleados en planilla.
 * @type {Object}
 */
const Planilla_Insertar_Empleado = {
   Planilla_Insertar_Empleado: crearTransaccion,
};

export default Planilla_Insertar_Empleado;
