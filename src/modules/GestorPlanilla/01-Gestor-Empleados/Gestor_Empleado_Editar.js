/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la edición de empleados en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para actualizar empleados
 * existentes en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrearSinCaracteresEspeciales } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * Configuración de consultas SQL para operaciones de empleados
 */
const QUERIES = {
   UPDATE_EMPLEADO: `
    UPDATE gestor_empleado_tbl SET
        nombre_completo_empleado_gestor = ?,
        correo_empleado_gestor = ?,
        telefono_empleado_gestor = ?,
        cedula_empleado_gestor = ?,
        salario_base_empleado_gestor = ?,
        tipo_contrato_empleado_gestor = ?,
        departamento_empleado_gestor = ?,
        puesto_empleado_gestor = ?,
        supervisor_empleado_gestor = ?,
        id_empresa = ?,
        fecha_ingreso_empleado_gestor = ?,
        fecha_salida_empleado_gestor = ?,
        jornada_laboral_empleado_gestor = ?,
        numero_asegurado_empleado_gestor = ?,
        numero_ins_empleado_gestor = ?,
        numero_hacienda_empleado_gestor = ?,
        cuenta_bancaria_1_empleado_gestor = ?,
        cuenta_bancaria_2_empleado_gestor = ?,
        vacaciones_acumuladas_empleado_gestor = ?,
        aguinaldo_acumulado_empleado_gestor = ?,
        cesantia_acumulada_empleado_gestor = ?,
        ministerio_hacienda_empleado_gestor = ?,
        rt_ins_empleado_gestor = ?,
        ccss_empleado_gestor = ?,
        moneda_pago_empleado_gestor = ?,
        tipo_planilla_empleado_gestor = ?,
        estado_empleado_gestor = ?
    WHERE id_empleado_gestor = ?
   `,
};

/**
 * Mapeo de errores de duplicado a mensajes amigables
 */
const ERROR_MESSAGES = {
   numero_asegurado_empleado_gestor: "Ya existe un Socio registrado con este número de asegurado. Por favor, verifique el número e intente nuevamente.",
   numero_ins_empleado_gestor: "Ya existe un Socio registrado con este número de INS. Por favor, verifique el número e intente nuevamente.",
   numero_hacienda_empleado_gestor: "Ya existe un Socio registrado con este número de hacienda. Por favor, verifique el número e intente nuevamente.",
   correo_empleado_gestor: "Ya existe un Socio registrado con este correo electrónico. Por favor, use un correo diferente.",
   cedula_empleado_gestor: "Ya existe un Socio registrado con esta cédula. Por favor, verifique el número e intente nuevamente.",
   default: "Ya existe un Socio con los mismos datos de identificación."
};

/**
 * Actualiza un empleado existente en la base de datos
 * @param {Object} datos - Datos del empleado a actualizar
 * @param {number} id_empleado_gestor - ID del empleado a actualizar
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const actualizarRegistroBd = async (datos, id_empleado_gestor, id_empresa, id_usuario, database) => {

   const params = [
      datos.nombre_completo, datos.correo, datos.telefono, datos.cedula,
      datos.salario_base, datos.tipo_contrato, datos.departamento, datos.puesto,
      id_usuario, id_empresa || null, datos.fecha_ingreso,
      datos.fecha_salida || null, datos.jornada_laboral, datos.numero_asegurado,
      datos.numero_ins, datos.numero_hacienda, datos.cuenta_bancaria_1,
      datos.cuenta_bancaria_2 || null, datos.vacaciones_acumuladas,
      datos.aguinaldo_acumulado, datos.cesantia_acumulada, datos.ministerio_hacienda,
      datos.rt_ins, datos.ccss, datos.moneda_pago, datos.tipo_planilla,
      datos.estado_empleado_gestor,
      id_empleado_gestor
   ];

   return await realizarConsulta(QUERIES.UPDATE_EMPLEADO, params, database);
};

/**
 * Verifica si la actualización del empleado fue exitosa
 * @param {Object} resultado - Resultado de la operación
 * @returns {boolean} True si fue exitosa
 */
const esActualizacionExitosa = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * Obtiene un mensaje de error amigable para errores de duplicado
 * @param {string} errorMessage - Mensaje de error original
 * @returns {string} Mensaje de error amigable
 */
const obtenerMensajeErrorDuplicado = (errorMessage) => {
   for (const [campo, mensaje] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(campo)) {
         return mensaje;
      }
   }
   return ERROR_MESSAGES.default;
};

/**
 * Maneja errores específicos de duplicado
 * @param {Object} resultado - Resultado de la operación
 * @returns {Object|null} Respuesta de error o null si no es error de duplicado
 */
const manejarErrorDuplicado = (resultado) => {
   if (resultado.error && resultado.error.includes('Duplicate entry')) {
      const mensajeError = obtenerMensajeErrorDuplicado(resultado.error);
      return crearRespuestaErrorCrearSinCaracteresEspeciales(mensajeError);
   }
   return null;
};

/**
 * Actualiza un empleado existente en el sistema
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} Resultado de la operación
 */
const editarTransaccion = async (req, res) => {
   try {
      // Validar datos iniciales
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion;

      // Obtener el ID del empleado desde los datos
      const id_empleado_gestor = res?.transaccion?.data?.id_empleado_gestor;
      
      if (!id_empleado_gestor) {
         return crearRespuestaErrorCrearSinCaracteresEspeciales("ID del empleado no proporcionado");
      }

      // Actualizar empleado en la base de datos
      const resultado = await actualizarRegistroBd(
         res?.transaccion?.data,
         id_empleado_gestor,
         res?.transaccion?.user?.id_empresa,
         res?.transaccion?.user?.id,
         res?.database
      );

      // Verificar si la actualización fue exitosa
      if (!esActualizacionExitosa(resultado)) {
         // Manejar errores de duplicado
         const errorDuplicado = manejarErrorDuplicado(resultado);
         if (errorDuplicado) return errorDuplicado;
         
         return crearRespuestaErrorCrearSinCaracteresEspeciales(`Error al actualizar el Socio: ${resultado.error}`);
      }

      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // Manejar errores de duplicado en el catch
      if (error.message && error.message.includes('Duplicate entry')) {
         const mensajeError = obtenerMensajeErrorDuplicado(error.message);
         return crearRespuestaErrorCrearSinCaracteresEspeciales(mensajeError);
      }
      
      return manejarError(error, 500, "Error al actualizar el Socio: ", error.message);
   }
};

/**
 * Exportación del módulo
 */
const Gestor_Empleado_Editar = {   
   editarTransaccion,
};

export default Gestor_Empleado_Editar;
