// import cron from 'node-cron';
// import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";

// const QUERIES = {
//   // Consulta SQL optimizada para obtener todos los empleados con sus datos relacionados en una sola consulta
//   TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA: `
//      SELECT 
//         e.id_empleado_gestor,
//         e.numero_socio_empleado_gestor,
//         e.nombre_completo_empleado_gestor,
//         e.correo_empleado_gestor,
//         e.cedula_empleado_gestor,
//         e.salario_base_empleado_gestor,
//         e.tipo_contrato_empleado_gestor,
//         e.supervisor_empleado_gestor,
//         e.fecha_ingreso_empleado_gestor,
//         e.fecha_salida_empleado_gestor,
//         e.numero_asegurado_empleado_gestor,
//         e.numero_ins_empleado_gestor,
//         e.numero_hacienda_empleado_gestor,
//         e.cuenta_bancaria_1_empleado_gestor,
//         e.ministerio_hacienda_empleado_gestor,
//         e.rt_ins_empleado_gestor,
//         e.ccss_empleado_gestor,
//         e.moneda_pago_empleado_gestor,
//         e.estado_empleado_gestor,
//         e.montoAsegurado_gestor_empelado,
//         e.tipo_planilla_empleado_gestor,
//         emp.nombre_comercial_empresa
//      FROM gestor_empleado_tbl e
//      JOIN empresas_tbl emp ON emp.id_empresa = e.id_empresa
//      WHERE e.estado_empleado_gestor = 1
//        AND (e.fecha_salida_empleado_gestor IS NULL OR e.fecha_salida_empleado_gestor = '')
//        AND e.salario_base_empleado_gestor IS NOT NULL
//        AND e.salario_base_empleado_gestor != ''
//        AND e.id_empresa = ?
//        AND e.moneda_pago_empleado_gestor = ?
//        AND e.tipo_planilla_empleado_gestor = ?
//      ORDER BY e.nombre_completo_empleado_gestor;
//   `,
  
//   // Consulta optimizada para obtener todos los aumentos de todos los empleados en una sola consulta
//   AUMENTOS_TODOS: `
//      SELECT *
//      FROM gestor_aumento_tbl
//      WHERE planilla_id_aumento_gestor = ?
//        AND empresa_id_aumento_gestor = ?
//        AND estado_planilla_aumento_gestor = "Aprobado"
//      ORDER BY empleado_id_aumento_gestor;
//   `,
  
//   // Consulta optimizada para obtener todos los rebajos de todos los empleados en una sola consulta
//   REBAJOS_COMPENSACION_TODOS: `
//      SELECT *
//      FROM gestor_rebajo_compensacion_tbl
//      WHERE planilla_id_rebajo = ?
//        AND empresa_id_rebajo = ?
//        AND estado_rebajo = "Aprobado"
//      ORDER BY empleado_id_rebajo;
//   `,
  
//   // Consulta optimizada para obtener todas las horas extras de todos los empleados en una sola consulta
//   HORAS_EXTRAS_TODOS: `
//      SELECT *
//      FROM gestor_compensacion_extra_tbl
//      WHERE planilla_id_compensacion_extra_gestor = ?
//        AND empresa_id_compensacion_extra_gestor = ?
//        AND estado_compensacion_extra_gestor = "Aprobado"
//      ORDER BY empleado_id_compensacion_extra_gestor;
//   `,
  
//   // Consulta optimizada para obtener todas las compensaciones por métrica de todos los empleados en una sola consulta
//   COMPENSACION_METRICA_TODOS: `
//      SELECT *
//      FROM gestor_compensacion_metrica_tbl
//      WHERE planilla_id_compensacion_metrica_gestor = ?
//        AND empresa_id_compensacion_metrica_gestor = ?
//        AND estado_compensacion_metrica_gestor = "Aprobada"
//      ORDER BY empleado_id_compensacion_metrica_gestor;
//   `,

//   // Consulta para obtener todas las planillas procesadas
//   PLANILLAS_PROCESADAS: `
//      SELECT * FROM planilla_tbl WHERE planilla_estado = "Procesada" AND empresa_id != 13  and planilla_codigo='PL₡-GT3-Mens-20250718-XJSNUE'
//   `,
// };

// /**
// * ====================================================================================================================================
// * Ejecuta una consulta con timeout controlado y manejo de errores mejorado.
// *
// * @param {string} query - Consulta SQL a ejecutar
// * @param {Array} params - Parámetros de la consulta
// * @param {string} database - Base de datos
// * @param {number} timeout - Timeout en milisegundos (por defecto 10 segundos)
// * @returns {Promise<Object>} Resultado de la consulta
// * ====================================================================================================================================
// */
// const ejecutarConsultaConTimeout = async (query, params, database, timeout = 10000) => {
//   try {
//      const resultado = await Promise.race([
//         realizarConsulta(query, params, database),
//         new Promise((_, reject) => 
//            setTimeout(() => reject(new Error(`Timeout en consulta después de ${timeout}ms`)), timeout)
//         )
//      ]);
     
//      return resultado;
//   } catch (error) {
//      console.error(`Error en consulta con timeout: ${error.message}`);
//      return {
//         status: 500,
//         error: error.message,
//         datos: []
//      };
//   }
// };

// /**
// * ====================================================================================================================================
// * Realiza una consulta a la base de datos para obtener todos los registros optimizada.
// *
// * Esta función ejecuta consultas optimizadas para evitar el problema N+1,
// * obteniendo todos los datos relacionados en consultas separadas pero eficientes.
// * Cada tabla gestor almacena registros individuales, no JSON arrays.
// *
// * @param {Object} datos - Datos de la solicitud
// * @param {string} database - Base de datos
// * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta
// * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
// * ====================================================================================================================================
// */
// const obtenerTodosDatos = async (datos, database="pruebas") => {
//   try {
//      // Primero ejecutar PLANILLAS_PROCESADAS y hacer console.log del resultado
//      const planillasProcesadasResult = await ejecutarConsultaConTimeout(
//         QUERIES.PLANILLAS_PROCESADAS, 
//         [], 
//         database,
//         15000
//      );
     
     
//      if (planillasProcesadasResult?.status === 500) {
//         console.error('❌ Error al obtener planillas procesadas:', planillasProcesadasResult.error);
//         return planillasProcesadasResult;
//      }

//      const planillasProcesadas = planillasProcesadasResult.datos || [];
     
//      if (planillasProcesadas.length === 0) {
//         console.log('⚠️ No se encontraron planillas procesadas');
//         return {
//            status: 200,
//            datos: []
//         };
//      }

//      // Procesar cada planilla procesada
//      for (const planilla of planillasProcesadas) {
//         console.log('📋 Procesando planilla:', planilla.planilla_codigo);
        
//         // Crear objeto datos con la nueva estructura de campos
//         const datosPlanilla = {
//            planilla_id: planilla.planilla_id,
//            empresa_id: planilla.empresa_id,
//            planilla_moneda: planilla.planilla_moneda,
//            tipo_planilla: planilla.planilla_tipo
//         };

//         // Una vez terminada la extracción de PLANILLAS_PROCESADAS, ejecutar todas las demás funciones
//         console.log('🔄 Ejecutando consultas adicionales para planilla:', planilla.planilla_codigo);
        
//         // 1. Obtener empleados principales (consulta principal)
//         const empleadosResultado = await ejecutarConsultaConTimeout(
//            QUERIES.TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA, 
//            [datosPlanilla.empresa_id, datosPlanilla.planilla_moneda, datosPlanilla.tipo_planilla], 
//            database,
//            15000 // 15 segundos para la consulta principal
//         );
        
//         if (empleadosResultado?.status === 500) {
//            console.error('❌ Error al obtener empleados para planilla:', planilla.planilla_codigo);
//            continue; // Continuar con la siguiente planilla
//         }

//         const empleados = empleadosResultado.datos || [];

//         if (empleados.length === 0) {
//            console.log('⚠️ No se encontraron empleados para planilla:', planilla.planilla_codigo);
//            continue; // Continuar con la siguiente planilla
//         }

//         console.log(`👥 Empleados encontrados para planilla ${planilla.planilla_codigo}:`, empleados.length);
        
//         // 2. Ejecutar todas las consultas adicionales en paralelo
//         const [aumentosResult, rebajosResult, horasExtrasResult, compensacionMetricaResult] = await Promise.allSettled([
//            ejecutarConsultaConTimeout(QUERIES.AUMENTOS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
//            ejecutarConsultaConTimeout(QUERIES.REBAJOS_COMPENSACION_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
//            ejecutarConsultaConTimeout(QUERIES.HORAS_EXTRAS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000),
//            ejecutarConsultaConTimeout(QUERIES.COMPENSACION_METRICA_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], database, 8000)
//         ]);

//         console.log('✅ Consultas adicionales completadas para planilla:', planilla.planilla_codigo);

//         // 3. Procesar resultados y crear mapas para acceso rápido
//         // Cada tabla gestor contiene registros individuales que se agrupan por empleado
//         const aumentosMap = new Map();
//         const rebajosMap = new Map();
//         const horasExtrasMap = new Map();
//         const compensacionMetricaMap = new Map();

//         // Procesar aumentos
//         if (aumentosResult.status === 'fulfilled' && aumentosResult.value?.datos) {
//            console.log(`📈 Aumentos encontrados: ${aumentosResult.value.datos.length}`);
//            aumentosResult.value.datos.forEach(item => {
//               try {
//                  // Cada item es un registro individual de aumento, no un JSON
//                  const empleadoId = item.empleado_id_aumento_gestor;
//                  if (!aumentosMap.has(empleadoId)) {
//                     aumentosMap.set(empleadoId, []);
//                  }
//                  aumentosMap.get(empleadoId).push(item);
//               } catch (e) {
//                  console.warn(`Error procesando aumento para empleado ${item.empleado_id_aumento_gestor}:`, e);
//               }
//            });
//         }

//         // Procesar rebajos
//         if (rebajosResult.status === 'fulfilled' && rebajosResult.value?.datos) {
//            console.log(`📉 Rebajos encontrados: ${rebajosResult.value.datos.length}`);
//            rebajosResult.value.datos.forEach(item => {
//               try {
//                  // Cada item es un registro individual de rebajo, no un JSON
//                  const empleadoId = item.empleado_id_rebajo;
//                  if (!rebajosMap.has(empleadoId)) {
//                     rebajosMap.set(empleadoId, []);
//                  }
//                  rebajosMap.get(empleadoId).push(item);
//               } catch (e) {
//                  console.warn(`Error procesando rebajo para empleado ${item.empleado_id_rebajo}:`, e);
//               }
//            });
//         }

//         // Procesar horas extras
//         if (horasExtrasResult.status === 'fulfilled' && horasExtrasResult.value?.datos) {
//            console.log(`⏰ Horas extras encontradas: ${horasExtrasResult.value.datos.length}`);
//            horasExtrasResult.value.datos.forEach(item => {
//               try {
//                  // Cada item es un registro individual de horas extras, no un JSON
//                  const empleadoId = item.empleado_id_compensacion_extra_gestor;
//                  if (!horasExtrasMap.has(empleadoId)) {
//                     horasExtrasMap.set(empleadoId, []);
//                  }
//                  horasExtrasMap.get(empleadoId).push(item);
//               } catch (e) {
//                  console.warn(`Error procesando horas extras para empleado ${item.empleado_id_compensacion_extra_gestor}:`, e);
//               }
//            });
//         }

//         // Procesar compensación por métrica
//         if (compensacionMetricaResult.status === 'fulfilled' && compensacionMetricaResult.value?.datos) {
//            console.log(`📊 Compensaciones por métrica encontradas: ${compensacionMetricaResult.value.datos.length}`);
//            compensacionMetricaResult.value.datos.forEach(item => {
//               try {
//                  // Cada item es un registro individual de compensación por métrica, no un JSON
//                  const empleadoId = item.empleado_id_compensacion_metrica_gestor;
//                  if (!compensacionMetricaMap.has(empleadoId)) {
//                     compensacionMetricaMap.set(empleadoId, []);
//                  }
//                  compensacionMetricaMap.get(empleadoId).push(item);
//               } catch (e) {
//                  console.warn(`Error procesando compensación por métrica para empleado ${item.empleado_id_compensacion_metrica_gestor}:`, e);
//               }
//            });
//         }

//         // 4. Combinar todos los datos
//         const empleadosConDatosAdicionales = empleados.map(empleado => ({
//            ...empleado,
//            aumentos: aumentosMap.get(empleado.id_empleado_gestor) || [],
//            rebajos_compensacion: rebajosMap.get(empleado.id_empleado_gestor) || [],
//            horas_extras: horasExtrasMap.get(empleado.id_empleado_gestor) || [],
//            compensacion_metrica: compensacionMetricaMap.get(empleado.id_empleado_gestor) || []
//         }));

//         console.log(`✅ Procesamiento completado para planilla: ${planilla.planilla_codigo}`);
//         console.log(`📋 Resumen - Empleados: ${empleadosConDatosAdicionales.length}, Aumentos: ${aumentosMap.size}, Rebajos: ${rebajosMap.size}, Horas Extras: ${horasExtrasMap.size}, Compensaciones: ${compensacionMetricaMap.size}`);

//         return {
//            status: 200,
//            datos: empleadosConDatosAdicionales
//         };
//      }

//      return {
//         status: 200,
//         datos: []
//      };

//   } catch (error) {
//      console.error('❌ Error en obtenerTodosDatos:', error);
//      return manejarError(
//         error,
//         500,
//         "Error No se puede extraer la lista completa: ",
//         `Error al obtener los datos de la base de datos: ${error.message}`,
//      );
//   }
// };


// const iniciarCronJob = () => {
//     const tarea = cron.schedule('*/5 * * * * *', async () => {
//         console.log('🕐 Cron job gestor ejecutándose...');
        
//         try {
//             // Obtener planillas procesadas primero
//             const planillasProcesadasResult = await ejecutarConsultaConTimeout(
//                 QUERIES.PLANILLAS_PROCESADAS, 
//                 [], 
//                 'pruebas', // Asumiendo que 'default' es la base de datos por defecto 
//                 15000
//             );
            
//             if (planillasProcesadasResult?.status === 500) {
//                 console.error('❌ Error al obtener planillas procesadas:', planillasProcesadasResult.error);
//                 return;
//             }

//             const planillasProcesadas = planillasProcesadasResult.datos || [];
            
//             if (planillasProcesadas.length === 0) {
//                 console.log('⚠️ No se encontraron planillas procesadas');
//                 return;
//             }

//             console.log(`📊 Procesando ${planillasProcesadas.length} planilla(s) procesada(s)`);

//             // Procesar cada planilla procesada con la nueva estructura de campos
//             for (const planilla of planillasProcesadas) {
//                 console.log(`📋 Planilla: ${planilla.planilla_codigo} - Empresa: ${planilla.empresa_id}`);
                
//                 // Crear objeto datos con la nueva estructura de campos
//                 const datosPlanilla = {
//                     planilla_id: planilla.planilla_id,
//                     empresa_id: planilla.empresa_id,
//                     planilla_moneda: planilla.planilla_moneda,
//                     tipo_planilla: planilla.planilla_tipo
//                 };
                
//                 // Una vez terminada la extracción de PLANILLAS_PROCESADAS, ejecutar todas las demás funciones
//                 console.log('🔄 Ejecutando consultas adicionales para planilla:', planilla.planilla_codigo);
                
//                 // 1. Obtener empleados principales (consulta principal)
//                 const empleadosResultado = await ejecutarConsultaConTimeout(
//                    QUERIES.TRAER_TODOS_LOS_EMPLEADOS_DE_LA_EMPRESA, 
//                    [datosPlanilla.empresa_id, datosPlanilla.planilla_moneda, datosPlanilla.tipo_planilla], 
//                    'pruebas',
//                    15000 // 15 segundos para la consulta principal
//                 );
                
//                 if (empleadosResultado?.status === 500) {
//                    console.error('❌ Error al obtener empleados para planilla:', planilla.planilla_codigo);
//                    continue; // Continuar con la siguiente planilla
//                 }

//                 const empleados = empleadosResultado.datos || [];

//                 if (empleados.length === 0) {
//                    console.log('⚠️ No se encontraron empleados para planilla:', planilla.planilla_codigo);
//                    continue; // Continuar con la siguiente planilla
//                 }

//                 console.log(`👥 Empleados encontrados para planilla ${planilla.planilla_codigo}:`, empleados.length);
                
//                 // 2. Ejecutar todas las consultas adicionales en paralelo
//                 const [aumentosResult, rebajosResult, horasExtrasResult, compensacionMetricaResult] = await Promise.allSettled([
//                    ejecutarConsultaConTimeout(QUERIES.AUMENTOS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], 'pruebas', 8000),
//                    ejecutarConsultaConTimeout(QUERIES.REBAJOS_COMPENSACION_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], 'pruebas', 8000),
//                    ejecutarConsultaConTimeout(QUERIES.HORAS_EXTRAS_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], 'pruebas', 8000),
//                    ejecutarConsultaConTimeout(QUERIES.COMPENSACION_METRICA_TODOS, [datosPlanilla.planilla_id, datosPlanilla.empresa_id], 'pruebas', 8000)
//                 ]);

//                 console.log('✅ Consultas adicionales completadas para planilla:', planilla.planilla_codigo);

//                 // 3. Procesar resultados y crear mapas para acceso rápido
//                 const aumentosMap = new Map();
//                 const rebajosMap = new Map();
//                 const horasExtrasMap = new Map();
//                 const compensacionMetricaMap = new Map();

//                 // Procesar aumentos
//                 if (aumentosResult.status === 'fulfilled' && aumentosResult.value?.datos) {
//                    console.log(`📈 Aumentos encontrados: ${aumentosResult.value.datos.length}`);
//                    aumentosResult.value.datos.forEach(item => {
//                       try {
//                          const empleadoId = item.empleado_id_aumento_gestor;
//                          if (!aumentosMap.has(empleadoId)) {
//                             aumentosMap.set(empleadoId, []);
//                          }
//                          aumentosMap.get(empleadoId).push(item);
//                       } catch (e) {
//                          console.warn(`Error procesando aumento para empleado ${item.empleado_id_aumento_gestor}:`, e);
//                       }
//                    });
//                 }

//                 // Procesar rebajos
//                 if (rebajosResult.status === 'fulfilled' && rebajosResult.value?.datos) {
//                    console.log(`📉 Rebajos encontrados: ${rebajosResult.value.datos.length}`);
//                    rebajosResult.value.datos.forEach(item => {
//                       try {
//                          const empleadoId = item.empleado_id_rebajo;
//                          if (!rebajosMap.has(empleadoId)) {
//                             rebajosMap.set(empleadoId, []);
//                          }
//                          rebajosMap.get(empleadoId).push(item);
//                       } catch (e) {
//                          console.warn(`Error procesando rebajo para empleado ${item.empleado_id_rebajo}:`, e);
//                       }
//                    });
//                 }

//                 // Procesar horas extras
//                 if (horasExtrasResult.status === 'fulfilled' && horasExtrasResult.value?.datos) {
//                    console.log(`⏰ Horas extras encontradas: ${horasExtrasResult.value.datos.length}`);
//                    horasExtrasResult.value.datos.forEach(item => {
//                       try {
//                          const empleadoId = item.empleado_id_compensacion_extra_gestor;
//                          if (!horasExtrasMap.has(empleadoId)) {
//                             horasExtrasMap.set(empleadoId, []);
//                          }
//                          horasExtrasMap.get(empleadoId).push(item);
//                       } catch (e) {
//                          console.warn(`Error procesando horas extras para empleado ${item.empleado_id_compensacion_extra_gestor}:`, e);
//                       }
//                    });
//                 }

//                 // Procesar compensación por métrica
//                 if (compensacionMetricaResult.status === 'fulfilled' && compensacionMetricaResult.value?.datos) {
//                    console.log(`📊 Compensaciones por métrica encontradas: ${compensacionMetricaResult.value.datos.length}`);
//                    compensacionMetricaResult.value.datos.forEach(item => {
//                       try {
//                          const empleadoId = item.empleado_id_compensacion_metrica_gestor;
//                          if (!compensacionMetricaMap.has(empleadoId)) {
//                             compensacionMetricaMap.set(empleadoId, []);
//                          }
//                          compensacionMetricaMap.get(empleadoId).push(item);
//                       } catch (e) {
//                          console.warn(`Error procesando compensación por métrica para empleado ${item.empleado_id_compensacion_metrica_gestor}:`, e);
//                       }
//                    });
//                 }

//                 // 4. Combinar todos los datos
//                 const empleadosConDatosAdicionales = empleados.map(empleado => ({
//                    ...empleado,
//                    aumentos: aumentosMap.get(empleado.id_empleado_gestor) || [],
//                    rebajos_compensacion: rebajosMap.get(empleado.id_empleado_gestor) || [],
//                    horas_extras: horasExtrasMap.get(empleado.id_empleado_gestor) || [],
//                    compensacion_metrica: compensacionMetricaMap.get(empleado.id_empleado_gestor) || []
//                 }));

//                 console.log(`✅ Procesamiento completado para planilla: ${planilla.planilla_codigo}`);
//                 console.log(`📋 Resumen - Empleados: ${empleadosConDatosAdicionales.length}, Aumentos: ${aumentosMap.size}, Rebajos: ${rebajosMap.size}, Horas Extras: ${horasExtrasMap.size}, Compensaciones: ${compensacionMetricaMap.size}`);
                
//                 // Aquí puedes agregar la lógica para procesar cada planilla
//                 // Por ejemplo, llamar a obtenerTodosDatos con los datos de la planilla
//                 // const resultadoEmpleados = await obtenerTodosDatos(datosPlanilla, 'pruebas');
//                 // console.log('👥 Empleados procesados:', resultadoEmpleados);
//             }
            
//         } catch (error) {
//             console.error('❌ Error en cron job gestor:', error);
//         }
//     });

//     tarea.start();
// }

// export { iniciarCronJob };