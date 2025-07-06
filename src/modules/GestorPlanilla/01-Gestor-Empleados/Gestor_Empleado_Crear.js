/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de registros en el sistema de
 * @requires ../../mysql2-promise/mysql2-promise
 * @requires ../../hooks/realizarValidacionesIniciales
 * @requires ../../hooks/crearRespuestaExitosa
 * @requires ../../hooks/verificarPermisosUsuario
 * @requires ../../hooks/crearRespuestaErrorCrear
 *
 * Este módulo proporciona las funcionalidades necesarias para crear nuevos registros
 * en la base de datos, con validación de permisos y manejo estructurado de errores.
 * ====================================================================================================================================
 */

import { realizarConsulta, manejarError } from "../../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../../hooks/crearRespuestaExitosa.js";
import { crearRespuestaErrorCrear } from "../../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro en la base de datos.
 * ====================================================================================================================================
 */
const QUERIES = {
   QUERIES_INSERT: `
    INSERT INTO gestor_empleado_tbl (
        nombre_completo_empleado_gestor,
        correo_empleado_gestor,
        telefono_empleado_gestor,
        cedula_empleado_gestor,
        salario_base_empleado_gestor,
        tipo_contrato_empleado_gestor,
        departamento_empleado_gestor,
        puesto_empleado_gestor,
        supervisor_empleado_gestor,
        id_empresa,
        fecha_ingreso_empleado_gestor,
        fecha_salida_empleado_gestor,
        jornada_laboral_empleado_gestor,
        numero_asegurado_empleado_gestor,
        numero_ins_empleado_gestor,
        numero_hacienda_empleado_gestor,
        cuenta_bancaria_1_empleado_gestor,
        cuenta_bancaria_2_empleado_gestor,
        vacaciones_acumuladas_empleado_gestor,
        aguinaldo_acumulado_empleado_gestor,
        cesantia_acumulada_empleado_gestor,
        ministerio_hacienda_empleado_gestor,
        rt_ins_empleado_gestor,
        ccss_empleado_gestor,
        moneda_pago_empleado_gestor,
        tipo_planilla_empleado_gestor,
        estado_empleado_gestor
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );

  
`,
   QUERIES_INSERT_NUMERO_SOCIO: `
   UPDATE gestor_empleado_tbl SET numero_socio_empleado_gestor = ? WHERE id_empleado_gestor = ?;
   `,
};

/**
 * ====================================================================================================================================
 * Inserta un nuevo registro en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de registro
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de inserción con datos del registro creado.
 * @throws {Error} Si ocurre un error durante la inserción en la base de datos.
 * ====================================================================================================================================
 */
const crearNuevoRegistroBd = async (datos, database) => {

   return await realizarConsulta(
      QUERIES.QUERIES_INSERT,
      [
         datos.nombre_completo,
         datos.correo,
         datos.telefono,
         datos.cedula,
         datos.salario_base,
         datos.tipo_contrato,
         datos.departamento,
         datos.puesto,
         datos.supervisor,
         datos.id_empresa || null,
         datos.fecha_ingreso,
         datos.fecha_salida || null,
         datos.jornada_laboral,
         datos.numero_asegurado,
         datos.numero_ins,
         datos.numero_hacienda,
         datos.cuenta_bancaria_1,
         datos.cuenta_bancaria_2 || null,
         datos.vacaciones_acumuladas,
         datos.aguinaldo_acumulado,
         datos.cesantia_acumulada,
         datos.ministerio_hacienda,
         datos.rt_ins,
         datos.ccss,
         datos.moneda_pago,
         datos.tipo_planilla,
         1,
      ],
      database,
   );
};

const registrar_numero_socio = async (id_empleado, database) => {
    // Generar parte aleatoria alfanumérica de 6 caracteres (mayúsculas)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  
    // Formatear numero_socio con prefijo 'GT' + id_empleado + randomPart
    const numero_socio = `GT${id_empleado}${randomPart}`;

    // Ejecutar consulta para actualizar el registro
    return await realizarConsulta(
      QUERIES.QUERIES_INSERT_NUMERO_SOCIO,
      [numero_socio, id_empleado],
      database
    );
  };

/**
 * ====================================================================================================================================
 * Verifica si la creación del registro fue exitosa.
 *
 * Esta función analiza el resultado devuelto por la operación de creación para determinar
 * si el proceso se completó correctamente o si ocurrió algún error.
 *
 * @param {Object} resultado - Resultado de la operación en la base de datos.
 * @param {Object} [resultado.datos] - Datos retornados por la inserción.
 * @param {number} [resultado.datos.insertId] - ID del registro insertado.
 * @param {number} [resultado.status] - Código de estado de la operación.
 * @returns {boolean} True si la operación fue exitosa, false en caso contrario.
 * ====================================================================================================================================
 */
const esCreacionExitosa = (resultado) => {
   return !(resultado.datos?.insertId <= 0 || resultado?.status === 500);
};

/**
 * ====================================================================================================================================
 * Crea un nuevo registro en el sistema, validando previamente el acceso del usuario.
 *
 * Esta función principal gestiona el proceso completo de creación de un registro:
 * 1. Valida los datos de entrada y los permisos del usuario
 * 2. Crea el nuevo registro en la base de datos
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
 * @param {Object} res.transaccion.movimiento - Datos del registro a crear.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de creación, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const crearTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      // 3. Crear un nuevo registro en la base de datos
      const resultado = await crearNuevoRegistroBd(res?.transaccion?.data, res?.database);

      // 4. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         // Manejar errores específicos de duplicado
         if (resultado.error && resultado.error.includes('Duplicate entry')) {
            // Extraer información del error de duplicado
            let mensajeError = "Ya existe un Socio con los mismos datos de identificación.";
            
            if (resultado.error.includes('numero_asegurado_empleado_gestor')) {
               mensajeError = "Ya existe un Socio registrado con este número de asegurado. Por favor, verifique el número e intente nuevamente.";
            } else if (resultado.error.includes('numero_ins_empleado_gestor')) {
               mensajeError = "Ya existe un Socio registrado con este número de INS. Por favor, verifique el número e intente nuevamente.";
            } else if (resultado.error.includes('numero_hacienda_empleado_gestor')) {
               mensajeError = "Ya existe un Socio registrado con este número de hacienda. Por favor, verifique el número e intente nuevamente.";
            } else if (resultado.error.includes('correo_empleado_gestor')) {
               mensajeError = "Ya existe un Socio registrado con este correo electrónico. Por favor, use un correo diferente.";
            } else if (resultado.error.includes('cedula_empleado_gestor')) {
               mensajeError = "Ya existe un Socio registrado con esta cédula. Por favor, verifique el número e intente nuevamente.";
            }
            
            return crearRespuestaErrorCrear(mensajeError);
         }
         
         return crearRespuestaErrorCrear(`Error al crear el Socio: ${resultado.error}`);
      }

      if (resultado.datos.insertId > 0) {
            await registrar_numero_socio(resultado.datos.insertId, res?.database);
      }
      // 5. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      // Manejar errores específicos de duplicado en el catch
      if (error.message && error.message.includes('Duplicate entry')) {
         let mensajeError = "Ya existe un Socio con los mismos datos de identificación.";
         
         if (error.message.includes('numero_asegurado_empleado_gestor')) {
            mensajeError = "Ya existe un Socio registrado con este número de asegurado. Por favor, verifique el número e intente nuevamente.";
         } else if (error.message.includes('numero_ins_empleado_gestor')) {
            mensajeError = "Ya existe un Socio registrado con este número de INS. Por favor, verifique el número e intente nuevamente.";
         } else if (error.message.includes('numero_hacienda_empleado_gestor')) {
            mensajeError = "Ya existe un Socio registrado con este número de hacienda. Por favor, verifique el número e intente nuevamente.";
         } else if (error.message.includes('correo_empleado_gestor')) {
            mensajeError = "Ya existe un Socio registrado con este correo electrónico. Por favor, use un correo diferente.";
         } else if (error.message.includes('cedula_empleado_gestor')) {
            mensajeError = "Ya existe un Socio registrado con esta cédula. Por favor, verifique el número e intente nuevamente.";
         }
         
         return crearRespuestaErrorCrear(mensajeError);
      }
      
      return manejarError(error, 500, "Error al crear el Socio: ", error.message);
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros.
 * Este módulo expone la funcionalidad de creación de nuevos registros.
 * ====================================================================================================================================
 */
const Gestor_Empleado_Crear = {   
   crearTransaccion,
};

export default Gestor_Empleado_Crear;
