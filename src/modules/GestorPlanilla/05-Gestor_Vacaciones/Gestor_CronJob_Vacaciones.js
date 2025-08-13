import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import cron from 'node-cron';

const ejecutarCronJob = () => {
   const QUERIES = {
      QUERIES_SELECT: `
     SELECT * FROM gestor_empleado_tbl WHERE fecha_salida_empleado_gestor IS NULL;
         `,
      QUERIES_VACACIONES: `
     SELECT * FROM Vacaciones_metrica WHERE id_empleado_gestor = ?
         `,
      QUERIES_INSERT_VACACIONES: `
     INSERT INTO Vacaciones_metrica (
         id_empleado_gestor,
         dias_asignados,
         dias_disfrutados
     ) VALUES (?, ?, ?)
         `,
      QUERIES_UPDATE_VACACIONES: `
     UPDATE Vacaciones_metrica 
     SET dias_asignados = dias_asignados + 1 
     WHERE id_empleado_gestor = ?
         `,
   };

   const obtenerDatoPorId = async (database) => {
      try {
         return await realizarConsulta(QUERIES.QUERIES_SELECT, [], database);      
      } catch (error) {
         return manejarError(
            error,
            500,
            "Error No se puede obtener el registro de empleados: ",
            `Error al obtener los datos de la base de datos: ${error.message}`,
         );
      }
   };

   const obtenerVacacionesPorEmpleado = async (id_empleado, database) => {
      try {
         return await realizarConsulta(QUERIES.QUERIES_VACACIONES, [id_empleado], database);      
      } catch (error) {
         return manejarError(
            error,
            500,
            "Error No se puede obtener las vacaciones del empleado: ",
            `Error al obtener las vacaciones: ${error.message}`,
         );
      }
   };

   const insertarVacacionesEmpleado = async (id_empleado, dias_asignados, dias_disfrutados, database) => {
      try {
         return await realizarConsulta(QUERIES.QUERIES_INSERT_VACACIONES, [id_empleado, dias_asignados, dias_disfrutados], database);      
      } catch (error) {
         return manejarError(
            error,
            500,
            "Error No se puede insertar las vacaciones del empleado: ",
            `Error al insertar las vacaciones: ${error.message}`,
         );
      }
   };

   const actualizarVacacionesEmpleado = async (id_empleado, database) => {
      try {
         return await realizarConsulta(QUERIES.QUERIES_UPDATE_VACACIONES, [id_empleado], database);      
      } catch (error) {
         return manejarError(
            error,
            500,
            "Error No se puede actualizar las vacaciones del empleado: ",
            `Error al actualizar las vacaciones: ${error.message}`,
         );
      }
   };

   const calcularMesesTrabajados = (fecha_ingreso) => {
      const fechaActual = new Date();
      const fechaIngreso = new Date(fecha_ingreso + 'T00:00:00');
      const diferenciaMeses = (fechaActual.getFullYear() - fechaIngreso.getFullYear()) * 12 + 
                             (fechaActual.getMonth() - fechaIngreso.getMonth());
      return diferenciaMeses;
   };

   const esDiaDeIngreso = (fecha_ingreso) => {
      const fechaActual = new Date();
      const fechaIngreso = new Date(fecha_ingreso + 'T00:00:00');
      return fechaActual.getDate() === fechaIngreso.getDate();
   };

   const obtenerRegistroPorId = async () => {
      try {
         const resultado = await obtenerDatoPorId("pruebas");
         return resultado;
      } catch (error) {
         return manejarError(
            error,
            500,
            "Error No se puede obtener el registro de vacaciones: ",
            error.message,
         );
      }
   };

   cron.schedule('0 13 18 * * *', async () => {
      try {
         const resultado = await obtenerRegistroPorId();
         
         if (resultado && resultado.datos && resultado.datos) {
            
            for (let index = 0; index < resultado.datos.length; index++) {
               const empleado = resultado.datos[index];

               if (esDiaDeIngreso(empleado.fecha_ingreso_empleado_gestor)) {
                  const vacacionesEmpleado = await obtenerVacacionesPorEmpleado(empleado.id_empleado_gestor, "pruebas");

                  if (vacacionesEmpleado && vacacionesEmpleado.datos && vacacionesEmpleado.datos.length === 0) {
                     const mesesTrabajados = calcularMesesTrabajados(empleado.fecha_ingreso_empleado_gestor);

                     if (mesesTrabajados >= 1) {
                        await insertarVacacionesEmpleado(empleado.id_empleado_gestor, 1, 0, "pruebas");
                     }
                  } else if (vacacionesEmpleado && vacacionesEmpleado.datos && vacacionesEmpleado.datos.length > 0) {
                     await actualizarVacacionesEmpleado(empleado.id_empleado_gestor, "pruebas");
                  }
               }
            }
         }
         
      } catch (error) {
         console.error('Error en CronJob:', new Date().toISOString(), error);
      }
   });
};

const Gestor_CronJob_Vacaciones = { 
   ejecutarCronJob
};

export default Gestor_CronJob_Vacaciones; 