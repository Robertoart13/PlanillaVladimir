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
   // Consulta SQL optimizada para obtener todos los empleados con sus datos relacionados en una sola consulta
   TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA: `
      SELECT 
         e.id_empleado_gestor,
         e.numero_socio_empleado_gestor,
         e.nombre_completo_empleado_gestor,
         e.correo_empleado_gestor,
         e.cedula_empleado_gestor,
         e.salario_base_empleado_gestor,
         e.tipo_contrato_empleado_gestor,
         e.supervisor_empleado_gestor,
         e.fecha_ingreso_empleado_gestor,
         e.fecha_salida_empleado_gestor,
         e.numero_asegurado_empleado_gestor,
         e.numero_ins_empleado_gestor,
         e.numero_hacienda_empleado_gestor,
         e.cuenta_bancaria_1_empleado_gestor,
         e.ministerio_hacienda_empleado_gestor,
         e.rt_ins_empleado_gestor,
         e.ccss_empleado_gestor,
         e.moneda_pago_empleado_gestor,
         e.estado_empleado_gestor,
         e.montoAsegurado_gestor_empelado,
         e.tipo_planilla_empleado_gestor,
         emp.nombre_comercial_empresa
      FROM gestor_empleado_tbl e
      JOIN empresas_tbl emp ON emp.id_empresa = e.id_empresa
      WHERE e.estado_empleado_gestor = 1
        AND (e.fecha_salida_empleado_gestor IS NULL OR e.fecha_salida_empleado_gestor = '')
        AND e.salario_base_empleado_gestor IS NOT NULL
        AND e.salario_base_empleado_gestor != ''
        AND e.id_empresa = ?
        AND e.moneda_pago_empleado_gestor = ?
        AND e.tipo_planilla_empleado_gestor = ?
      ORDER BY e.nombre_completo_empleado_gestor;
   `,
   
   // Consulta optimizada para obtener todos los aumentos de todos los empleados en una sola consulta
   AUMENTOS_TODOS: `
      SELECT 
         empleado_id_aumento_gestor,
         JSON_ARRAYAGG(
            JSON_OBJECT(
               'id', id_aumento_gestor,
               'monto', monto_aumento_gestor,
               'descripcion', descripcion_aumento_gestor,
               'fecha', fecha_aumento_gestor
            )
         ) as aumentos
      FROM gestor_aumento_tbl
      WHERE planilla_id_aumento_gestor = ?
        AND empresa_id_aumento_gestor = ?
        AND estado_planilla_aumento_gestor = "Pendiente"
      GROUP BY empleado_id_aumento_gestor;
   `,
   
   // Consulta optimizada para obtener todos los rebajos de todos los empleados en una sola consulta
   REBAJOS_COMPENSACION_TODOS: `
      SELECT 
         empleado_id_rebajo,
         JSON_ARRAYAGG(
            JSON_OBJECT(
               'id', id_rebajo,
               'monto', monto_rebajo,
               'descripcion', descripcion_rebajo,
               'fecha', fecha_rebajo
            )
         ) as rebajos_compensacion
      FROM gestor_rebajo_compensacion_tbl
      WHERE planilla_id_rebajo = ?
        AND empresa_id_rebajo = ?
        AND estado_rebajo = "Pendiente"
      GROUP BY empleado_id_rebajo;
   `,
   
   // Consulta optimizada para obtener todas las horas extras de todos los empleados en una sola consulta
   HORAS_EXTRAS_TODOS: `
      SELECT 
         empleado_id_compensacion_extra_gestor,
         JSON_ARRAYAGG(
            JSON_OBJECT(
               'id', id_compensacion_extra_gestor,
               'monto', monto_compensacion_extra_gestor,
               'descripcion', descripcion_compensacion_extra_gestor,
               'fecha', fecha_compensacion_extra_gestor
            )
         ) as horas_extras
      FROM gestor_compensacion_extra_tbl
      WHERE planilla_id_compensacion_extra_gestor = ?
        AND empresa_id_compensacion_extra_gestor = ?
        AND estado_compensacion_extra_gestor = "Pendiente"
      GROUP BY empleado_id_compensacion_extra_gestor;
   `,
   
   // Consulta optimizada para obtener todas las compensaciones por métrica de todos los empleados en una sola consulta
   COMPENSACION_METRICA_TODOS: `
      SELECT 
         empleado_id_compensacion_metrica_gestor,
         JSON_ARRAYAGG(
            JSON_OBJECT(
               'id', id_compensacion_metrica_gestor,
               'monto', monto_compensacion_metrica_gestor,
               'descripcion', descripcion_compensacion_metrica_gestor,
               'fecha', fecha_compensacion_metrica_gestor
            )
         ) as compensacion_metrica
      FROM gestor_compensacion_metrica_tbl
      WHERE planilla_id_compensacion_metrica_gestor = ?
        AND empresa_id_compensacion_metrica_gestor = ?
        AND estado_compensacion_metrica_gestor = "Pendiente"
      GROUP BY empleado_id_compensacion_metrica_gestor;
   `,
};

/**
 * ====================================================================================================================================
 * Ejecuta una consulta con timeout controlado y manejo de errores mejorado.
 *
 * @param {string} query - Consulta SQL a ejecutar
 * @param {Array} params - Parámetros de la consulta
 * @param {string} database - Base de datos
 * @param {number} timeout - Timeout en milisegundos (por defecto 10 segundos)
 * @returns {Promise<Object>} Resultado de la consulta
 * ====================================================================================================================================
 */
const ejecutarConsultaConTimeout = async (query, params, database, timeout = 10000) => {
   try {
      const resultado = await Promise.race([
         realizarConsulta(query, params, database),
         new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout en consulta después de ${timeout}ms`)), timeout)
         )
      ]);
      
      return resultado;
   } catch (error) {
      console.error(`Error en consulta con timeout: ${error.message}`);
      return {
         status: 500,
         error: error.message,
         datos: []
      };
   }
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener todos los registros optimizada.
 *
 * Esta función ejecuta consultas optimizadas para evitar el problema N+1,
 * obteniendo todos los datos relacionados en consultas separadas pero eficientes.
 *
 * @param {Object} datos - Datos de la solicitud
 * @param {string} database - Base de datos
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerTodosDatos = async (datos, database) => {
   try {
      console.log('🔄 Iniciando consulta optimizada de empleados...');
      
      // 1. Obtener empleados principales (consulta principal)
      const empleadosResultado = await ejecutarConsultaConTimeout(
         QUERIES.TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA, 
         [datos.empresa_id, datos.planilla_moneda, datos.tipo_planilla], 
         database,
         15000 // 15 segundos para la consulta principal
      );
      
      if (empleadosResultado?.status === 500) {
         return empleadosResultado;
      }

      const empleados = empleadosResultado.datos || [];
      console.log(`✅ Empleados obtenidos: ${empleados.length}`);

      if (empleados.length === 0) {
         return {
            status: 200,
            datos: []
         };
      }

      // 2. Obtener todos los datos relacionados en consultas paralelas optimizadas
      console.log('🔄 Obteniendo datos relacionados...');
      
      const [aumentosResult, rebajosResult, horasExtrasResult, compensacionMetricaResult] = await Promise.allSettled([
         ejecutarConsultaConTimeout(QUERIES.AUMENTOS_TODOS, [datos.planilla_id, datos.empresa_id], database, 8000),
         ejecutarConsultaConTimeout(QUERIES.REBAJOS_COMPENSACION_TODOS, [datos.planilla_id, datos.empresa_id], database, 8000),
         ejecutarConsultaConTimeout(QUERIES.HORAS_EXTRAS_TODOS, [datos.planilla_id, datos.empresa_id], database, 8000),
         ejecutarConsultaConTimeout(QUERIES.COMPENSACION_METRICA_TODOS, [datos.planilla_id, datos.empresa_id], database, 8000)
      ]);

      // 3. Procesar resultados y crear mapas para acceso rápido
      const aumentosMap = new Map();
      const rebajosMap = new Map();
      const horasExtrasMap = new Map();
      const compensacionMetricaMap = new Map();

      // Procesar aumentos
      if (aumentosResult.status === 'fulfilled' && aumentosResult.value?.datos) {
         aumentosResult.value.datos.forEach(item => {
            try {
               const aumentos = JSON.parse(item.aumentos || '[]');
               aumentosMap.set(item.empleado_id_aumento_gestor, aumentos);
            } catch (e) {
               console.warn(`Error parseando aumentos para empleado ${item.empleado_id_aumento_gestor}:`, e);
               aumentosMap.set(item.empleado_id_aumento_gestor, []);
            }
         });
      }

      // Procesar rebajos
      if (rebajosResult.status === 'fulfilled' && rebajosResult.value?.datos) {
         rebajosResult.value.datos.forEach(item => {
            try {
               const rebajos = JSON.parse(item.rebajos_compensacion || '[]');
               rebajosMap.set(item.empleado_id_rebajo, rebajos);
            } catch (e) {
               console.warn(`Error parseando rebajos para empleado ${item.empleado_id_rebajo}:`, e);
               rebajosMap.set(item.empleado_id_rebajo, []);
            }
         });
      }

      // Procesar horas extras
      if (horasExtrasResult.status === 'fulfilled' && horasExtrasResult.value?.datos) {
         horasExtrasResult.value.datos.forEach(item => {
            try {
               const horasExtras = JSON.parse(item.horas_extras || '[]');
               horasExtrasMap.set(item.empleado_id_compensacion_extra_gestor, horasExtras);
            } catch (e) {
               console.warn(`Error parseando horas extras para empleado ${item.empleado_id_compensacion_extra_gestor}:`, e);
               horasExtrasMap.set(item.empleado_id_compensacion_extra_gestor, []);
            }
         });
      }

      // Procesar compensación por métrica
      if (compensacionMetricaResult.status === 'fulfilled' && compensacionMetricaResult.value?.datos) {
         compensacionMetricaResult.value.datos.forEach(item => {
            try {
               const compensacionMetrica = JSON.parse(item.compensacion_metrica || '[]');
               compensacionMetricaMap.set(item.empleado_id_compensacion_metrica_gestor, compensacionMetrica);
            } catch (e) {
               console.warn(`Error parseando compensación por métrica para empleado ${item.empleado_id_compensacion_metrica_gestor}:`, e);
               compensacionMetricaMap.set(item.empleado_id_compensacion_metrica_gestor, []);
            }
         });
      }

      // 4. Combinar todos los datos
      const empleadosConDatosAdicionales = empleados.map(empleado => ({
         ...empleado,
         aumentos: aumentosMap.get(empleado.id_empleado_gestor) || [],
         rebajos_compensacion: rebajosMap.get(empleado.id_empleado_gestor) || [],
         horas_extras: horasExtrasMap.get(empleado.id_empleado_gestor) || [],
         compensacion_metrica: compensacionMetricaMap.get(empleado.id_empleado_gestor) || []
      }));

      console.log(`✅ Procesamiento completado para ${empleadosConDatosAdicionales.length} empleados`);

      return {
         status: 200,
         datos: empleadosConDatosAdicionales
      };

   } catch (error) {
      console.error('❌ Error en obtenerTodosDatos:', error);
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

   console.log(res);
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 3. Obtener los datos de la base de datos una vez validados los permisos.
      const resultado = await obtenerTodosDatos(
         res.transaccion.data,
         res?.database);

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
const Gestor_Planilla_Gestor = {      
   obtenerListaCompleta, // Método que obtiene la lista completa, con validaciones y permisos.
};

export default Gestor_Planilla_Gestor;       
