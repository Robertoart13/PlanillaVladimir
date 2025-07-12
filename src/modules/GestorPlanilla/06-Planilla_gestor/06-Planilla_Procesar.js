/**
 * ====================================================================================================================================
 * @fileoverview Módulo para el procesamiento de planillas en el sistema de gestión
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para procesar planillas
 * en la base de datos, actualizando el estado de la planilla, aprobando todos
 * los elementos asociados (aumentos, extras, métricas, rebajos) y calculando
 * los nuevos salarios de los empleados basados en los aumentos aprobados.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Las consultas están organizadas por funcionalidad y con nombres descriptivos.
 * ====================================================================================================================================
 */
const QUERIES = {
   // ====================================================================================================================================
   // CONSULTAS PARA ACTUALIZAR ESTADOS DE PLANILLA
   // ====================================================================================================================================
   
   /**
    * Actualiza el estado de la planilla a "Procesada"
    */
   ACTUALIZAR_ESTADO_PLANILLA: `
      UPDATE planilla_tbl
      SET planilla_estado = ?
      WHERE planilla_id = ?;    
   `,

   // ====================================================================================================================================
   // CONSULTAS PARA ACTUALIZAR ESTADOS DE ELEMENTOS ASOCIADOS
   // ====================================================================================================================================
   
   /**
    * Marca todos los aumentos de la planilla como "Procesada"
    */
   ACTUALIZAR_ESTADO_AUMENTOS: `
      UPDATE gestor_aumento_tbl
      SET estado_planilla_aumento_gestor = "Procesada"
      WHERE planilla_id_aumento_gestor = ?;    
   `,

   /**
    * Marca todas las compensaciones extra de la planilla como "Procesada"
    */
   ACTUALIZAR_ESTADO_COMPENSACIONES_EXTRA: `
      UPDATE gestor_compensacion_extra_tbl
      SET estado_compensacion_extra_gestor = "Procesada"
      WHERE planilla_id_compensacion_extra_gestor = ?;    
   `,

   /**
    * Marca todas las compensaciones por métricas de la planilla como "Procesada"
    */
   ACTUALIZAR_ESTADO_COMPENSACIONES_METRICAS: `
      UPDATE gestor_compensacion_metrica_tbl
      SET estado_compensacion_metrica_gestor = "Procesada"
      WHERE planilla_id_compensacion_metrica_gestor = ?;    
   `,

   /**
    * Marca todos los rebajos de compensación de la planilla como "Procesada"
    */
   ACTUALIZAR_ESTADO_REBAJOS: `
      UPDATE gestor_rebajo_compensacion_tbl
      SET estado_rebajo = "Procesada"
      WHERE planilla_id_rebajo = ?;    
   `,

   // ====================================================================================================================================
   // CONSULTAS PARA PROCESAMIENTO DE AUMENTOS DE SALARIO
   // ====================================================================================================================================
   
   /**
    * Obtiene todos los aumentos aprobados para una planilla específica
    */
   OBTENER_AUMENTOS_APROBADOS: `
      SELECT *
      FROM gestor_aumento_tbl
      WHERE planilla_id_aumento_gestor = ?
      AND estado_planilla_aumento_gestor = "Aprobado"
      ORDER BY empleado_id_aumento_gestor;
   `,

   /**
    * Obtiene la información del empleado por su ID
    */
   OBTENER_EMPLEADO_POR_ID: `
      SELECT *
      FROM gestor_empleado_tbl
      WHERE id_empleado_gestor = ?
   `,

   /**
    * Actualiza el salario base del empleado con el nuevo salario calculado
    */
   ACTUALIZAR_SALARIO_EMPLEADO: `
      UPDATE gestor_empleado_tbl
      SET salario_base_empleado_gestor = ?
      WHERE id_empleado_gestor = ?;    
   `
};

/**
 * ====================================================================================================================================
 * Procesa los aumentos de salario para todos los empleados de una planilla.
 * 
 * Esta función:
 * 1. Obtiene todos los aumentos aprobados para la planilla
 * 2. Para cada empleado con aumentos, calcula el total de aumentos
 * 3. Obtiene la información actual del empleado
 * 4. Calcula el nuevo salario (salario actual + total de aumentos)
 * 5. Actualiza el salario del empleado en la base de datos
 * 6. Registra la información en consola para auditoría
 *
 * @param {number} planillaId - ID de la planilla a procesar
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado del procesamiento de aumentos
 * ====================================================================================================================================
 */
const procesarAumentosSalario = async (planillaId, database) => {
   try {
      console.log(`\n=== PROCESANDO AUMENTOS DE SALARIO PARA PLANILLA ${planillaId} ===`);

      // 1. Obtener todos los aumentos aprobados para la planilla
      const aumentosResultado = await realizarConsulta(
         QUERIES.OBTENER_AUMENTOS_APROBADOS, 
         [planillaId], 
         database
      );

      if (!aumentosResultado.datos || aumentosResultado.datos.length === 0) {
         console.log("No se encontraron aumentos aprobados para procesar.");
         return { procesados: 0, errores: 0 };
      }

      const aumentos = aumentosResultado.datos;
      console.log(`Se encontraron ${aumentos.length} aumentos aprobados para procesar.`);

      // 2. Agrupar aumentos por empleado y calcular totales
      const aumentosPorEmpleado = {};
      
      for (const aumento of aumentos) {
         const empleadoId = aumento.empleado_id_aumento_gestor;
         const montoAumento = parseFloat(aumento.monto_aumento_gestor) || 0;
         
         if (!aumentosPorEmpleado[empleadoId]) {
            aumentosPorEmpleado[empleadoId] = 0;
         }
         
         aumentosPorEmpleado[empleadoId] += montoAumento;
      }

      // 3. Procesar cada empleado con aumentos
      let empleadosProcesados = 0;
      let errores = 0;

      for (const [empleadoId, totalAumento] of Object.entries(aumentosPorEmpleado)) {
         try {
            // Obtener información del empleado
            const empleadoResultado = await realizarConsulta(
               QUERIES.OBTENER_EMPLEADO_POR_ID,
               [empleadoId],
               database
            );

            if (!empleadoResultado.datos || empleadoResultado.datos.length === 0) {
               console.log(`❌ Error: No se encontró el empleado con ID ${empleadoId}`);
               errores++;
               continue;
            }

            const empleado = empleadoResultado.datos[0];
            const salarioActual = parseFloat(empleado.salario_base_empleado_gestor) || 0;
            const nuevoSalario = salarioActual + totalAumento;

            // Mostrar información en consola
            console.log(`\n📋 Empleado: ${empleado.nombre_completo_empleado_gestor}`);
            console.log(`   ID: ${empleadoId}`);
            console.log(`   Salario Actual: $${salarioActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
            console.log(`   Total Aumentos: $${totalAumento.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
            console.log(`   Nuevo Salario: $${nuevoSalario.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);

            // Actualizar el salario del empleado
            await realizarConsulta(
               QUERIES.ACTUALIZAR_SALARIO_EMPLEADO,
               [nuevoSalario, empleadoId],
               database
            );

            console.log(`   ✅ Salario actualizado exitosamente`);
            empleadosProcesados++;

         } catch (error) {
            console.log(`❌ Error procesando empleado ${empleadoId}:`, error.message);
            errores++;
         }
      }

      console.log(`\n=== RESUMEN DE PROCESAMIENTO ===`);
      console.log(`Empleados procesados: ${empleadosProcesados}`);
      console.log(`Errores: ${errores}`);
      console.log(`Total de empleados con aumentos: ${Object.keys(aumentosPorEmpleado).length}`);

      return { procesados: empleadosProcesados, errores };

   } catch (error) {
      console.log("❌ Error en procesamiento de aumentos:", error.message);
      throw error;
   }
};

/**
 * ====================================================================================================================================
 * Procesa una planilla en la base de datos, ejecutando todas las consultas necesarias.
 *
 * Esta función ejecuta las consultas SQL en secuencia:
 * 1. Procesa los aumentos de salario para todos los empleados
 * 2. Actualiza el estado de todos los aumentos a "Procesada"
 * 3. Actualiza el estado de todas las compensaciones extra a "Procesada"
 * 4. Actualiza el estado de todas las compensaciones por métricas a "Procesada"
 * 5. Actualiza el estado de todos los rebajos de compensación a "Procesada"
 * 6. Actualiza el estado de la planilla a "Procesada"
 *
 * @param {Object} datos - Datos de la planilla a procesar
 * @param {number} datos.planilla_id - ID de la planilla a procesar
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} - Resultado de la operación de procesamiento en la base de datos.
 * ====================================================================================================================================
 */
const procesarPlanillaEnBaseDatos = async (datos, database) => {
   try {
      console.log(`\n🚀 INICIANDO PROCESAMIENTO DE PLANILLA ${datos.planilla_id}`);

      // 1. Procesar aumentos de salario (nueva funcionalidad)
      const resultadoAumentos = await procesarAumentosSalario(datos.planilla_id, database);
      
      // 2. Actualizar estado de todos los aumentos a "Procesada"
      await realizarConsulta(QUERIES.ACTUALIZAR_ESTADO_AUMENTOS, [datos.planilla_id], database);
      console.log("✅ Estados de aumentos actualizados");
      
      // 3. Actualizar estado de todas las compensaciones extra a "Procesada"
      await realizarConsulta(QUERIES.ACTUALIZAR_ESTADO_COMPENSACIONES_EXTRA, [datos.planilla_id], database);
      console.log("✅ Estados de compensaciones extra actualizados");
      
      // 4. Actualizar estado de todas las compensaciones por métricas a "Procesada"
      await realizarConsulta(QUERIES.ACTUALIZAR_ESTADO_COMPENSACIONES_METRICAS, [datos.planilla_id], database);
      console.log("✅ Estados de compensaciones por métricas actualizados");
      
      // 5. Actualizar estado de todos los rebajos de compensación a "Procesada"
      await realizarConsulta(QUERIES.ACTUALIZAR_ESTADO_REBAJOS, [datos.planilla_id], database);
      console.log("✅ Estados de rebajos actualizados");
      
      // 6. Actualizar el estado de la planilla a "Procesada" (último paso)
      const resultadoPlanilla = await realizarConsulta(
         QUERIES.ACTUALIZAR_ESTADO_PLANILLA, 
         ["Procesada", datos.planilla_id], 
         database
      );
      console.log("✅ Estado de planilla actualizado");
      
      console.log(`\n🎉 PROCESAMIENTO DE PLANILLA ${datos.planilla_id} COMPLETADO EXITOSAMENTE`);
      
      return {
         ...resultadoPlanilla,
         aumentosProcesados: resultadoAumentos
      };
   } catch (error) {
      console.log("❌ Error en procesamiento de planilla:", error.message);
      throw error;
   }
};

/**
 * ====================================================================================================================================
 * Verifica si el procesamiento de la planilla fue exitoso.
 *
 * Esta función evalúa el resultado de la operación de procesamiento para determinar
 * si se realizó correctamente, verificando las filas afectadas y el código de estado.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {Object} [resultado.datos] - Datos retornados por el procesamiento.
 * @param {number} [resultado.datos.affectedRows] - Número de filas afectadas por el procesamiento.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} - `true` si la operación fue exitosa, `false` en caso contrario.
 * ====================================================================================================================================
 */
const esProcesamientoExitoso = (resultado) => {
   return !(resultado.datos?.affectedRows <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Procesa una planilla en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de procesamiento de una planilla:
 * 1. Valida los datos de entrada y los permisos del usuario
 * 2. Procesa la planilla en la base de datos (actualiza estado y procesa elementos asociados)
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
 * @param {Object} res.transaccion.data - Datos de la planilla a procesar, incluyendo su ID.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de procesamiento, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const procesarTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion;

      // 2. Procesar la planilla en la base de datos
      const resultado = await procesarPlanillaEnBaseDatos(res?.transaccion?.data, res?.database);

      // 3. Verificar si el procesamiento fue exitoso
      if (!esProcesamientoExitoso(resultado)) {
         return crearRespuestaErrorCrear(
            `Error al procesar la planilla: ${resultado.error}`,
         );
      }

      // 4. Si el procesamiento fue exitoso, retorna una respuesta exitosa
      return crearRespuestaExitosa({
         ...resultado.datos,
         aumentosProcesados: resultado.aumentosProcesados
      });
   } catch (error) {
      return manejarError(error, 500, "Error al procesar la planilla: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para procesar planillas.
 * Este módulo expone la funcionalidad de procesamiento de planillas en el sistema.
 * ====================================================================================================================================
 */
const Gestor_Planilla_Procesar = {
   procesarTransaccion,
};

export default Gestor_Planilla_Procesar;
