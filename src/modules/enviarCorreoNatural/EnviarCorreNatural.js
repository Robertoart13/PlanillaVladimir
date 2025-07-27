
import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import cron from 'node-cron';
import { baseDeDatosCronjob } from "../../config/config.js";
import { sendEmployeeEmail } from './EmailService.js';

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Estas consultas son usadas para interactuar con la base de datos, recuperando datos necesarios.
 * ====================================================================================================================================
 */
const QUERIES = {
   // Consulta SQL para obtener todos los registros de la tabla
   QUERIES_SELECT: `
        SELECT * FROM planilla_tbl WHERE planilla_estado = "Procesada" AND empresa_id=13 AND planilla_codigo="PL-NAT-Mens-20250726-TPF6QS"
    `,
    
   // Consulta SQL para obtener detalles de empleados por planilla
   QUERIES_DETALLE_EMPLEADOS: `
        SELECT 
           epd.*,
           empz.*,
           pl.*,
           emp.*
         
         FROM empleado_planilla_detalle_tbl epd 
         
         INNER JOIN empleados_tbl emp 
           ON epd.id_empleado_epd = emp.id_empleado 
         
         INNER JOIN empresas_tbl empz 
           ON epd.id_empresa_epd = empz.id_empresa 
         
         INNER JOIN planilla_tbl pl 
           ON epd.planilla_id_epd = pl.planilla_id 
         
         WHERE
           correo_enviado=0 
           AND epd.marca_epd = 1 
           AND epd.marca_aplicado_epd = 1
           AND epd.planilla_id_epd = ?
           AND epd.id_empresa_epd = ?
    `
};

/**
 * ====================================================================================================================================
 * Realiza una consulta a la base de datos para obtener todos los registros.
 *
 * Esta función ejecuta una consulta SQL definida en el objeto `QUERIES`, la cual extrae todos
 * los registros almacenados en la base de datos sin aplicar filtros.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta con todos los registros
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerTodosDatos = async (database) => {
   try {
      // Ejecuta la consulta SQL para obtener los datos de la tabla
      return await realizarConsulta(QUERIES.QUERIES_SELECT, [], database);
   } catch (error) {
      return "error al obtener los datos de la base de datos: " + error.message;
   }
};

/**
 * ====================================================================================================================================
 * Obtiene los detalles de empleados para una planilla específica.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @param {number} planillaId - ID de la planilla
 * @param {number} empresaId - ID de la empresa
 * @returns {Promise<Object>} - Promesa que retorna el resultado de la consulta con los detalles de empleados
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 * ====================================================================================================================================
 */
const obtenerDetalleEmpleados = async (database, planillaId, empresaId) => {
   try {
      return await realizarConsulta(QUERIES.QUERIES_DETALLE_EMPLEADOS, [planillaId, empresaId], database);
   } catch (error) {
      return "error al obtener los detalles de empleados: " + error.message;
   }
};

/**
 * ====================================================================================================================================
 * Configura y inicia el cron job para ejecutar obtenerTodosDatos cada minuto.
 * 
 * Este cron job se ejecuta cada minuto, obtiene los datos de planillas y luego recorre cada registro
 * para obtener los detalles de empleados correspondientes y enviar correos.
 * ====================================================================================================================================
 */
const iniciarCronJob = () => {
   // Cron job que se ejecuta cada minuto (*/1 * * * *)
   cron.schedule('*/1 * * * *', async () => {
      try {
         
         // Ejecutar la función obtenerTodosDatos con la base de datos de cron jobs
         const resultado = await obtenerTodosDatos(baseDeDatosCronjob);
         
         // Verificar si hay datos para procesar
         if (resultado && resultado.datos && Array.isArray(resultado.datos)) {
            
            // Recorrer cada registro de planilla
            for (let i = 0; i < resultado.datos.length; i++) {
               const planilla = resultado.datos[i];
               
            //    console.log(`\n🔍 Procesando planilla ${i + 1}/${resultado.datos.length}:`);
            //    console.log(`   - Planilla ID: ${planilla.planilla_id}`);
            //    console.log(`   - Empresa ID: ${planilla.empresa_id}`);
            //    console.log(`   - Código: ${planilla.planilla_codigo}`);
               
               // Obtener detalles de empleados para esta planilla
               const detalleEmpleados = await obtenerDetalleEmpleados(
                  baseDeDatosCronjob, 
                  planilla.planilla_id, 
                  planilla.empresa_id
               );
               
               if (detalleEmpleados && detalleEmpleados.datos) {
                //   console.log(`   ✅ Empleados encontrados: ${detalleEmpleados.datos.length}`);
                //   console.log('   📋 Detalles de empleados:', detalleEmpleados.datos);
                  
                //   // 📧 ENVIAR CORREOS A CADA EMPLEADO
                //   console.log('\n📧 Iniciando envío de correos...');
                  
                  for (let j = 0; j < detalleEmpleados.datos.length; j++) {
                     const empleado = detalleEmpleados.datos[j];
                     
                    //  console.log(`\n   📤 Enviando correo ${j + 1}/${detalleEmpleados.datos.length}:`);
                    //  console.log(`      - Empleado: ${empleado.nombre_empleado} ${empleado.apellidos_empleado}`);
                    //  console.log(`      - Correo: ${empleado.correo_empleado}`);
                    //  console.log(`      - ID Empleado: ${empleado.id_empleado}`);
                    //  console.log(`      - ID Planilla: ${planilla.planilla_id}`);
                     
                     try {
                        // Pasar la conexión de base de datos a la función de envío
                        const resultadoCorreo = await sendEmployeeEmail(empleado, planilla, baseDeDatosCronjob);
                        
                        if (resultadoCorreo.success) {
                        //    console.log(`      ✅ Correo enviado exitosamente`);
                        //    console.log(`      📧 Message ID: ${resultadoCorreo.messageId}`);
                           
                           // Verificar si la actualización de la base de datos fue exitosa
                           if (resultadoCorreo.dbUpdate && resultadoCorreo.dbUpdate.success) {
                            //   console.log(`      ✅ Base de datos actualizada: correo_enviado = 1`);
                           } else {
                             // console.log(`      ⚠️ Correo enviado pero error al actualizar BD: ${resultadoCorreo.dbUpdate?.error || 'Error desconocido'}`);
                           }
                        } else {
                          // console.log(`      ❌ Error al enviar correo: ${resultadoCorreo.error}`);
                        }
                     } catch (emailError) {
                        //console.log(`      ❌ Error inesperado al enviar correo: ${emailError.message}`);
                     }
                     
                     // Pequeña pausa entre envíos para evitar spam
                     await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                  
                //  console.log('\n✅ Proceso de envío de correos completado para esta planilla');
               } else {
                 // console.log('   ⚠️ No se encontraron empleados para esta planilla');
               }
            }
         } else {
           // console.log('⚠️ No se encontraron datos de planillas para procesar');
         }
         
      } catch (error) {
        // console.error('❌ Error en cron job obtenerTodosDatos:', error.message);
      }
   });
   
   //
   // 
   console.log('✅ Cron job iniciado - se ejecutará cada minuto');
};

// Exportar las funciones
export { obtenerTodosDatos, obtenerDetalleEmpleados, iniciarCronJob };

