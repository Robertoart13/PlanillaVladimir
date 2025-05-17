/**
 * ====================================================================================================================================
 * @fileoverview Módulo para la creación de registros en el sistema de nómina
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

import { realizarConsulta, manejarError } from "../../mysql2-promise/mysql2-promise.js";
import { realizarValidacionesIniciales } from "../../hooks/realizarValidacionesIniciales.js";
import { crearRespuestaExitosa } from "../../hooks/crearRespuestaExitosa.js";
import { verificarPermisosUsuario } from "../../hooks/verificarPermisosUsuario.js";
import { crearRespuestaErrorCrear } from "../../hooks/crearRespuestaErrorCrear.js";

/**
 * ====================================================================================================================================
 * Definición de las consultas SQL utilizadas en este módulo.
 * Contiene la consulta para insertar un nuevo registro en la base de datos.
 * ====================================================================================================================================
 */

// GUARADAMOS TODOS LOS USUARIOS CON SU EMPRESA RELACIONADAS
// SELECT * FROM HRManagementDB.sys_usuario_empresas;

// GUARDAMOS SOLO A LOS GERENTES CON SUS EMPRESAS A ADMINISTRAR NADA MAS NO OPERADORES NI TI solo GERENTES
// SELECT * FROM HRManagementDB.sys_permisos_gerente_empresa;

// EXISTEN 3 CAMPOS ID OPERADOR ID GERENTE ID EMPRESA
// SELECT * FROM HRManagementDB.sys_asignacion_operadores_gerente

const QUERIES = {
   /**
    * Inserta un nuevo usuario en la base de datos.
    *
    * @param {string} nombre_usuario - El nombre del usuario a insertar.
    * @param {string} rol_usuario - El rol asignado al usuario.
    * @param {string} email_usuario - El correo electrónico del usuario.
    * @param {boolean} verificacion_usuario - Estado de verificación del usuario.
    * @param {string} estado_usuario - El estado del usuario (activo, inactivo, etc.).
    * @param {number} intentos_usuario - Número de intentos fallidos para iniciar sesión.
    * @param {boolean} recuperacion_clave_usuario - Indicador de si el usuario ha solicitado recuperación de clave.
    * @param {string} idNetsuite_usuario - ID del usuario en Netsuite.
    * @param {string} cedula_usuario - Cédula de identidad del usuario.
    */
   QUERIES_INSERT: `
    INSERT INTO sys_usuarios (
     nombre_usuario, 
     rol_usuario, 
     email_usuario, 
     verificacion_usuario, 
     estado_usuario, 
     intentos_usuario, 
     recuperacion_clave_usuario, 
     idNetsuite_usuario,
     cedula_usuario
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

   /**
    * Inserta una relación entre un usuario y una empresa en la base de datos.
    *
    * @param {number} id_usuario - El ID del usuario que se asociará a la empresa.
    * @param {number} id_empresa - El ID de la empresa que se asociará al usuario.
    */
   INSERT_EMPRESA_USUARIO: `
    INSERT INTO sys_usuario_empresas (id_usuario, id_empresa)
    VALUES (?, ?)
  `,

   /**
    * Inserta una relación entre un gerente y un operador en la base de datos.
    *
    * @param {number} id_gerente - El ID del gerente que será asociado al operador.
    * @param {number} id_operador - El ID del operador que será asociado al gerente.
    */
   INSERT_OPERADOR_GERENTE: `
    INSERT INTO sys_gerente_operador (id_gerente, id_operador)
    VALUES (?, ?)
  `,
};

/**
 * ====================================================================================================================================
 * Inserta un nuevo registro en la base de datos.
 *
 * Esta función ejecuta la consulta SQL para crear un nuevo registro de registro
 * con los parámetros proporcionados. Utiliza consultas preparadas para prevenir inyecciones SQL.
 *
 * @param {string} nombre_tipo_movimiento - Nombre del registro.
 * @param {string} rol - Rol del usuario.
 * @param {string} correo - Correo electrónico del usuario.
 * @param {string} verificacion_usuario - Verificación del usuario.
 * @param {string} estado - Estado del usuario.
 * @param {string} intentos_usuario - Intentos del usuario.
 * @param {string} idNetsuite - ID de Netsuite del usuario.
 * @param {string} cedula - Cédula del usuario.
 * @param {Object|string} database - Objeto de conexión a la base de datos o nombre de la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de inserción con datos del registro creado.
 * @throws {Error} Si ocurre un error durante la inserción en la base de datos.
 * ====================================================================================================================================
 */
const crearNuevoRegistroBd = async (data, database) => {
   const {
      nombre,
      rol,
      correo,
      verificacion_usuario,
      estado,
      intentos_usuario,
      idNetsuite,
      cedula,
      recuperacion_clave_usuario,
   } = data;
   return await realizarConsulta(
      QUERIES.QUERIES_INSERT,
      [
         nombre,
         rol,
         correo,
         verificacion_usuario,
         estado,
         intentos_usuario,
         recuperacion_clave_usuario,
         idNetsuite,
         cedula,
      ],
      database,
   );
};

/**
 * Inserta una relación entre un usuario y una empresa en la base de datos.
 *
 * Esta función recibe los IDs de un usuario y una empresa, y utiliza una consulta SQL para insertar la relación entre ellos en la base de datos.
 *
 * @param {number} id_usuario - El ID del usuario que se asociará a la empresa.
 * @param {number} id_empresa - El ID de la empresa que se asociará al usuario.
 * @param {Object} database - La conexión a la base de datos que se utilizará para ejecutar la consulta.
 *
 * @returns {Promise<Object>} El resultado de la operación de inserción, devuelto por la función `realizarConsulta`.
 */
const insertartEmpresaUsuario = async (id_usuario, id_empresa, database) => {
   return await realizarConsulta(
      QUERIES.INSERT_EMPRESA_USUARIO,
      [id_usuario, id_empresa],
      database,
   );
};

/**
 * Inserta una relación entre un usuario y un operador de nómina.
 *
 * Esta función recibe los IDs de un usuario y un operador, y utiliza una consulta SQL para insertar la relación entre ellos en la base de datos.
 *
 * @param {number} id_usuario - El ID del usuario al que se le asociará el operador.
 * @param {number} id_operador - El ID del operador que se asociará al usuario.
 * @param {Object} database - La conexión a la base de datos que se utilizará para ejecutar la consulta.
 *
 * @returns {Promise<Object>} El resultado de la operación de inserción, devuelto por la función `realizarConsulta`.
 */
const InsertarOperdor_gerente = async (id_usuario, operadorId, database) => {
   return await realizarConsulta(
      QUERIES.INSERT_OPERADOR_GERENTE,
      [id_usuario, operadorId],
      database,
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
 * @param {Object} res.transaccion.usuario - Datos del registro a crear.
 * @param {Object} res.database - Conexión a la base de datos.
 * @returns {Promise<Object>} Resultado de la operación de creación, con datos del registro o mensajes de error.
 * ====================================================================================================================================
 */
const crearTransaccion = async (req, res) => {
   try {
      // 1. Validar los datos iniciales de la solicitud (por ejemplo, formato y autenticidad de los datos).
      const errorValidacion = await realizarValidacionesIniciales(res);
      if (errorValidacion) return errorValidacion; // Si hay un error en la validación, lo retorna inmediatamente.

      const details = `${res?.transaccion?.acceso?.details} Por favor, contacta con el administrador del sistema para obtener los accesos necesarios.`;

      // 2. Verificar si el usuario tiene permisos para acceder a la información solicitada.
      const errorPermisos = await verificarPermisosUsuario(
         res?.transaccion?.user?.id, // ID del usuario autenticado, extraído de la transacción
         res?.database, // Conexión a la base de datos
         res?.transaccion?.acceso?.permiso, // Código de permiso necesario para ver la lista
         details,
      );
      if (errorPermisos) return errorPermisos; // Si el usuario no tiene permisos, retorna un error.

      // 3. Crear un nuevo registro en la base de datos
      const resultado = await crearNuevoRegistroBd(res?.transaccion.usuario, res?.database);

      // 4. Verificar si la creación fue exitosa.
      if (!esCreacionExitosa(resultado)) {
         return crearRespuestaErrorCrear(`Error al crear el registro: ${resultado.error}`);
      }

      // 5 Si la creación fue exitosa insertamos la relacion usuario empresa
      await crearUsuarioEmpresa(
         {
            id_usuario: resultado?.info?.insertId,
            id_empresa: res?.transaccion?.usuario?.empresas,
            operadores: res?.transaccion?.usuario?.operadores,
         },
         res?.database,
      );

      // 5. Si la creación fue exitosa, retorna una respuesta exitosa.
      return crearRespuestaExitosa(resultado.datos);
   } catch (error) {
      return manejarError(error, 500, "Error No se puede crear el registro: ", error.message);
   }
};

/**
 * Crea una relación entre un usuario y múltiples empresas, así como con operadores/gerentes.
 * Procesa las inserciones de manera secuencial para mejor control y trazabilidad.
 *
 * @param {Object} datosUsuario - Datos del usuario.
 * @param {number} datosUsuario.id_usuario - ID del usuario que se asociará a las empresas y operadores.
 * @param {Array<number>} datosUsuario.id_empresa - IDs de las empresas a asociar.
 * @param {Array<number>} datosUsuario.operadores - IDs de los operadores/gerentes a asociar.
 * @param {Object} database - Conexión a la base de datos para las operaciones de inserción.
 * @returns {Promise<null|Object>} Retorna null si todo es exitoso, o un objeto de error si falla.
 */
const crearUsuarioEmpresa = async (datosUsuario, database) => {
   try {
      const { id_usuario, id_empresa, operadores } = datosUsuario;

      // Procesar inserción de empresas secuencialmente
      if (Array.isArray(id_empresa) && id_empresa.length > 0) {
         try {
            for (const empresaId of id_empresa) {
               await insertartEmpresaUsuario(id_usuario, empresaId, database);
               console.log(`Empresa ${empresaId} asociada correctamente al usuario ${id_usuario}`);
            }
         } catch (empresaError) {
            console.error("Error al procesar empresa:", empresaError);
            throw empresaError;
         }
      }

      // Procesar inserción de operadores secuencialmente
      if (Array.isArray(operadores) && operadores.length > 0) {
         try {
            for (const operadorId of operadores) {
               await InsertarOperdor_gerente(id_usuario, operadorId, database);
               console.log(
                  `Operador ${operadorId} asociado correctamente al usuario ${id_usuario}`,
               );
            }
         } catch (operadorError) {
            console.error("Error al procesar operador:", operadorError);
            throw operadorError;
         }
      }

      return null;
   } catch (error) {
      console.error("Error general en crearUsuarioEmpresa:", error);
      return manejarError(
         error,
         500,
         "Error en crearUsuarioEmpresa()",
         `No se pudo crear la relación usuario-empresa: ${error.message}`,
      );
   }
};

/**
 * ====================================================================================================================================
 * Exportación del módulo que contiene los métodos disponibles para crear registros.
 * Este módulo expone la funcionalidad de creación de nuevos registros.
 * ====================================================================================================================================
 */
const Usuario_Crear = {
   crearTransaccionUser: crearTransaccion,
};

export default Usuario_Crear;
