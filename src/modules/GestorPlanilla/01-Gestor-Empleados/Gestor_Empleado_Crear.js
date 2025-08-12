/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de empleados en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevos empleados
 * en la base de datos, con validación de permisos y manejo estructurado de errores.
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
   INSERT_EMPLEADO: `
    INSERT INTO gestor_empleado_tbl (
        nombre_completo_empleado_gestor, correo_empleado_gestor, telefono_empleado_gestor,
        cedula_empleado_gestor, salario_base_empleado_gestor, tipo_contrato_empleado_gestor,
        departamento_empleado_gestor, puesto_empleado_gestor, supervisor_empleado_gestor,
        id_empresa, fecha_ingreso_empleado_gestor, fecha_salida_empleado_gestor,
        jornada_laboral_empleado_gestor, numero_asegurado_empleado_gestor,
        numero_ins_empleado_gestor, numero_hacienda_empleado_gestor,
        cuenta_bancaria_1_empleado_gestor, cuenta_bancaria_2_empleado_gestor,
        vacaciones_acumuladas_empleado_gestor, aguinaldo_acumulado_empleado_gestor,
        cesantia_acumulada_empleado_gestor, ministerio_hacienda_empleado_gestor,
        rt_ins_empleado_gestor, ccss_empleado_gestor, moneda_pago_empleado_gestor,
        tipo_planilla_empleado_gestor, estado_empleado_gestor, montoAsegurado_gestor_empelado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
   `,
   
   UPDATE_NUMERO_SOCIO: `
    UPDATE gestor_empleado_tbl SET numero_socio_empleado_gestor = ? WHERE id_empleado_gestor = ?
   `,
   
   INSERT_VACACIONES: `
    INSERT INTO Vacaciones (
        id_empleado_gestor,
        dias_asignados,
        dias_disfrutados
    ) VALUES (?, ?, ?)
   `,
};

/**
 * Mapeo de mensajes de error de triggers a mensajes amigables
 */
const TRIGGER_ERROR_MAPPING = {
   "Ya existe un empleado con este correo y moneda": "Ya existe un empleado con este correo y moneda. Por favor, use un correo diferente o cambie la moneda de pago.",
   "Ya existe un empleado con esta cédula y moneda": "Ya existe un empleado con esta cédula y moneda. Por favor, verifique el número de cédula o cambie la moneda de pago.", 
   "Ya existe un empleado con este número de asegurado y moneda": "Ya existe un empleado con este número de asegurado y moneda. Por favor, verifique el número o cambie la moneda de pago.",
   "Ya existe un empleado con este número del INS y moneda": "Ya existe un empleado con este número del INS y moneda. Por favor, verifique el número o cambie la moneda de pago.",
   "Ya existe un empleado con este número de Hacienda y moneda": "Ya existe un empleado con este número de Hacienda y moneda. Por favor, verifique el número o cambie la moneda de pago.",
   "Ya existe un empleado con este número de socio y moneda": "Ya existe un empleado con este número de socio y moneda. Por favor, verifique el número o cambie la moneda de pago."
};

/**
 * Inserta un nuevo empleado en la base de datos
 * @param {Object} datos - Datos del empleado a crear
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const crearNuevoRegistroBd = async (datos,id_empresa, id_usuario, database) => {
   const params = [
      datos.nombre_completo, datos.correo, datos.telefono, datos.cedula,
      datos.salario_base, datos.tipo_contrato, datos.departamento, datos.puesto,
      id_usuario, id_empresa || null, datos.fecha_ingreso,
      datos.fecha_salida || null, datos.jornada_laboral, datos.numero_asegurado,
      datos.numero_ins, datos.numero_hacienda, datos.cuenta_bancaria_1,
      datos.cuenta_bancaria_2 || null, datos.vacaciones_acumuladas,
      datos.aguinaldo_acumulado, datos.cesantia_acumulada, datos.ministerio_hacienda,
      datos.rt_ins, datos.ccss, datos.moneda_pago, datos.tipo_planilla, 1, datos.monto_asegurado || 0
   ];


   const resultado = await realizarConsulta(QUERIES.INSERT_EMPLEADO, params, database);
   console.log(resultado);
   return resultado;
};

/**
 * Genera y asigna un número de socio único al empleado
 * @param {number} id_empleado - ID del empleado
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const registrarNumeroSocio = async (id_empleado, database) => {
   const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
   const numero_socio = `GT${id_empleado}${randomPart}`;
   
   return await realizarConsulta(QUERIES.UPDATE_NUMERO_SOCIO, [numero_socio, id_empleado], database);
};

/**
 * Inserta un registro de vacaciones para el empleado
 * @param {number} id_empleado - ID del empleado
 * @param {number} dias_asignados - Días de vacaciones asignados
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la operación
 */
const insertarVacaciones = async (id_empleado, dias_asignados, database) => {
   const dias_disfrutados = 0; // Siempre 0 para empleados nuevos
   
   return await realizarConsulta(QUERIES.INSERT_VACACIONES, [id_empleado, dias_asignados, dias_disfrutados], database);
};

/**
 * Verifica si la creación del empleado fue exitosa
 * @param {Object} resultado - Resultado de la operación
 * @returns {boolean} True si fue exitosa
 */
const esCreacionExitosa = (resultado) => {
   return !(resultado.datos?.insertId <= 0 || resultado?.status === 500);
};

/**
 * Obtiene un mensaje de error amigable para errores de triggers
 * @param {string} errorMessage - Mensaje de error original
 * @returns {string} Mensaje de error amigable
 */
const obtenerMensajeErrorTrigger = (errorMessage) => {
   for (const [triggerMessage, mensajeAmigable] of Object.entries(TRIGGER_ERROR_MAPPING)) {
      if (errorMessage.includes(triggerMessage)) {
         return mensajeAmigable;
      }
   }
   return "Ya existe un empleado con los mismos datos de identificación.";
};

/**
 * Maneja errores específicos de triggers
 * @param {Object} resultado - Resultado de la operación
 * @returns {Object|null} Respuesta de error o null si no es error de trigger
 */
const manejarErrorTrigger = (resultado) => {
   if (resultado.error && (resultado.error.includes('SQLSTATE[45000]') || resultado.error.includes('Ya existen 2 empleados'))) {
      const mensajeError = obtenerMensajeErrorTrigger(resultado.error);
      return crearRespuestaErrorCrearSinCaracteresEspeciales(mensajeError);
   }
   return null;
};

/**
 * Crea un nuevo empleado en el sistema
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Promise<Object>} Resultado de la operación
 */
const crearTransaccion = async (req, res) => {
   try {
      // Validar datos iniciales
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion;

      // Crear empleado en la base de datos
      const resultado = await crearNuevoRegistroBd(
         res?.transaccion?.data,
         res?.transaccion?.user?.id_empresa,
         res?.transaccion?.user?.id,
         res?.database
      );

      // Verificar si la creación fue exitosa
      if (!esCreacionExitosa(resultado)) {
         // Manejar errores de triggers
         const errorTrigger = manejarErrorTrigger(resultado);
         if (errorTrigger) return errorTrigger;
         
         return crearRespuestaErrorCrearSinCaracteresEspeciales(`Error al crear el Socio: ${resultado.error}`);
      }

      // Asignar número de socio y crear registro de vacaciones si la creación fue exitosa
      if (resultado.datos.insertId > 0) {
         await registrarNumeroSocio(resultado.datos.insertId, res?.database);
         
         // Insertar registro de vacaciones
         const dias_asignados = res?.transaccion?.data?.vacaciones_acumuladas || 0;
         await insertarVacaciones(resultado.datos.insertId, dias_asignados, res?.database);
      }

      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // Manejar errores de triggers en el catch
      if (error.message && (error.message.includes('SQLSTATE[45000]') || error.message.includes('Ya existen 2 empleados'))) {
         const mensajeError = obtenerMensajeErrorTrigger(error.message);
         return crearRespuestaErrorCrearSinCaracteresEspeciales(mensajeError);
      }
      
      return manejarError(error, 500, "Error al crear el Socio: ", error.message);
   }
};

/**
 * Exportación del módulo
 */
const Gestor_Empleado_Crear = {   
   crearTransaccion,
};

export default Gestor_Empleado_Crear;
