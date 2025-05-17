import {
   realizarConsulta,
   crearRespuesta,
   manejarError,
   codificarBase64,
} from "../../mysql2-promise/mysql2-promise.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

/** ====================================================================================================================================
 * Consultas SQL utilizadas para operaciones en la base de datos relacionadas con usuarios.
 *
 * Esta constante agrupa todas las consultas SQL necesarias para realizar operaciones comunes sobre los usuarios
 * en la base de datos, como obtener un usuario por su correo electrónico y actualizar la información de un usuario.
 *
 * @constant {Object} QUERIES - Objeto que contiene las consultas SQL predefinidas para la manipulación de usuarios.
 *
 * @property {string} USUARIO_POR_EMAIL - Consulta SQL para obtener los datos de un usuario a partir de su correo electrónico.
 *  @example
 *  // Ejemplo de uso:
 *  db.query(QUERIES.USUARIO_POR_EMAIL, [email], callback);
 *
 * @property {string} ACTUALIZAR_USUARIO - Consulta SQL para actualizar los datos del usuario (nombre, correo, tokens, etc.).
 *  @example
 *  // Ejemplo de uso:
 *  db.query(QUERIES.ACTUALIZAR_USUARIO, [nombre, email, token, expiracion, metodo, estado, intentos, recuperacion, microsoft_id, microsoft_obj_id, tenant_id, picture, refresh_token, access_token, token_expire, email], callback);
 *
 * @property {string} ACTUALIZAR_CLAVE_USUARIO - Consulta SQL para actualizar el estado de la recuperación de la clave de un usuario.
 *  @example
 *  // Ejemplo de uso:
 *  db.query(QUERIES.ACTUALIZAR_CLAVE_USUARIO, [recuperacion, email], callback);
 * 
 * @property {string} ACTUALIZAR_INTENTOSFALLIDOS_USUARIO - Consulta SQL para actualizar el número de intentos fallidos de un usuario al iniciar sesión.
 *  @example
 *  // Ejemplo de uso:
 *  db.query(QUERIES.ACTUALIZAR_INTENTOSFALLIDOS_USUARIO, [intentos, idUsuario], callback);
 */

const QUERIES = {
   USUARIO_POR_EMAIL: `
    SELECT clave_usuario, id_usuario, nombre_usuario, rol_usuario, email_usuario, verificacion_usuario, estado_usuario, intentos_usuario, recuperacion_clave_usuario, idNetsuite_usuario, 
    we.id_empresa,
    we.nombre_empresa,
    r.nombre_rol
    FROM sys_usuarios u
    JOIN sys_empresas we ON id_empresa = we.id_empresa
    JOIN sys_roles r ON u.rol_usuario = r.id_rol
    WHERE email_usuario = ?
  `,
   ACTUALIZAR_USUARIO: `
    UPDATE sys_usuarios 
    SET nombre_usuario=?, email_usuario=?, token_usuario=?, expiracion_token_usuario=?, metodo_administracion_usuario=?, estado_usuario=?, intentos_usuario=?, recuperacion_clave_usuario=?, microsoft_sub_id=?, 
        microsoft_object_id=?, microsoft_tenant_id=?, microsoft_picture=?, microsoft_refresh_token=?, microsoft_access_token=?, microsoft_token_expires=? 
    WHERE email_usuario=?
  `,
   ACTUALIZAR_CLAVE_USUARIO: `
    UPDATE sys_usuarios 
    SET recuperacion_clave_usuario=? 
    WHERE email_usuario=?
  `,
  ACTUALIZAR_INTENTOSFALLIDOS_USUARIO: `
    UPDATE sys_usuarios
    SET intentos_usuario=?
    WHERE id_usuario=?
  `,

};

/** ====================================================================================================================================
 * Constructs the payload for a JWT token using user data
 * @param {Object} usuario - User data
 * @returns {Object} Formatted payload for the token
 */
const construirPayloadToken = (usuario) => ({
   usid: usuario.id_usuario,
   nombre: codificarBase64(usuario.nombre_usuario), // Encode the user's name in Base64
   email: usuario.email_usuario,
   rol: usuario.rol_usuario,
   profilePicture: usuario.profilePicture || "1", // Default profile picture
   accessToken: usuario.accessToken || "0", // Default access token
   refreshToken: usuario.refreshToken || "0", // Default refresh token
   expiresIn: usuario.expiresIn || 0, // Default expiration time
   tenantId: usuario.tenantId || "0", // Default tenant ID
   userId: usuario.userId || "0", // Default user ID
   idNetsuite_usuario: usuario.idNetsuite_usuario || "0", // Default Netsuite ID
   id_empresa_usuario: usuario.id_empresa || "0", // Default empresa ID
   nombre_rol_usuario: usuario.nombre_rol || "0", // Default rol ID
});

/** ====================================================================================================================================
 * Fetches a user by their email from the database
 * @param {string} email - User's email
 * @param {Object} database - Database connection object
 * @returns {Promise<Object>} Query result
 */
const obtenerUsuarioPorEmail = async (email, database) => {
   return await realizarConsulta(QUERIES.USUARIO_POR_EMAIL, [email], database);
};

/** ====================================================================================================================================
 * Updates user data in the database
 * @param {Object} userData - Updated user data
 * @param {Object} database - Database connection object
 * @returns {Promise<Object>} Update result
 */
const actualizarUsuario = async (userData, database) => {
   return await realizarConsulta(QUERIES.ACTUALIZAR_USUARIO, userData.params, database);
};

/**
 * Actualizar clave de usuario
 * @param {string} email - User's email
 * @param {Object} database - Database connection object
 * @returns {Promise<Object>} Update result
 */
const actualizarClaveUsuario = async (email, database) => {
   return await realizarConsulta(QUERIES.ACTUALIZAR_CLAVE_USUARIO, [1, email], database);
};

/**
 * Actualizar intentos fallidos de inicio de sesión
 * @param {number} intentos - Número de intentos fallidos
 * @param {number} idUsuario - ID del usuario
 * @param {Object} database - Database connection object
 * @returns {Promise<Object>} Update result
 */
const actualizarIntentosFallidosInicioSesion = async (intentos, idUsuario, database) => {
   return await realizarConsulta(QUERIES.ACTUALIZAR_INTENTOSFALLIDOS_USUARIO, [intentos, idUsuario], database);
};

/** ====================================================================================================================================
 * Valida la existencia de un usuario en la base de datos mediante su correo electrónico.
 *
 * 1. Consulta la base de datos para verificar si el correo electrónico del usuario existe.
 * 2. Si el usuario existe, devuelve sus datos.
 * 3. Si el usuario no existe, devuelve un error de validación.
 *
 * @async
 * @function validarExistenciaUsuario
 * @param {string} email - Correo electrónico del usuario que se desea verificar.
 * @returns {Promise<Object>} Resultado de la validación:
 * - Si el usuario existe:
 *   `{ success: true, usuario: { ... } }`
 * - Si el usuario no existe:
 *   `{ success: false, respuesta: { ... } }`
 * @throws {Error} Si ocurre un error durante la consulta a la base de datos.
 */

const validarExistenciaUsuario = async (email) => {
   try {
      // Consultar usuario en la base de datos
      const resultadoConsulta = await obtenerUsuarioPorEmail(email);

      // Verificar si el usuario no existe en la base de datos
      if (!Array.isArray(resultadoConsulta.datos) || resultadoConsulta.datos.length === 0) {
         return {
            success: false,
            respuesta: crearRespuesta(false, 404, "El usuario no se encuentra registrado", [], {
               details: "No se encontró el usuario en la base de datos",
            }),
         };
      }

      // Retornar éxito con los datos del usuario encontrado
      return {
         success: true,
         usuario: resultadoConsulta.datos[0], // Se asume que solo hay un usuario por email
      };
   } catch (error) {
      console.error("❌ Error en validarExistenciaUsuario:", error);
      throw new Error("Error al validar la existencia del usuario.");
   }
};

/** ====================================================================================================================================
 * Genera un par de tokens JWT (accessToken y refreshToken).
 *
 * 1. Utiliza los datos del usuario y una clave secreta para firmar ambos tokens (access y refresh).
 * 2. El accessToken tiene una expiración corta (por defecto de 1 minuto).
 * 3. El refreshToken tiene una expiración más larga (por defecto de 30 días).
 *
 * @param {string} secretKey - Clave secreta utilizada para firmar los tokens.
 * @param {Object} usuario - Datos del usuario que se incluirán en el payload de los tokens.
 * @param {string} [expiresIn="10m"] - Tiempo de expiración del accessToken. El valor predeterminado es "10m" (10 minutos).
 *
 * @returns {Object} Resultado de la generación de tokens:
 * - Si la generación es exitosa:
 *   `{
 *     success: true,
 *     tokens: { accessToken, refreshToken }
 *   }`
 * - Si ocurre un error en la generación de los tokens:
 *   `{
 *     success: false,
 *     error: { errorCode, message, details }
 *   }`
 *
 * @throws {Error} Si ocurre un error durante el proceso de firma de los tokens.
 */

const generarTokens = (secretKey, usuario, expiresIn = "3h") => {
   // Ajustar la zona horaria a Costa Rica (UTC-6)
   const costaRicaOffset = -6 * 60; // Costa Rica está en UTC-6 (en minutos)
   const currentTime = new Date();
   
   // Ajustar a hora de Costa Rica
   const costaRicaTime = new Date(currentTime.getTime() + (currentTime.getTimezoneOffset() + costaRicaOffset) * 60000);
   
   // Calcular la hora de expiración (3 horas después) en hora de Costa Rica
   const expirationTime = new Date(costaRicaTime.getTime() + (3 * 60 * 60 * 1000));
   
   console.log("===== INFORMACIÓN DE TIEMPO DEL SERVIDOR =====");
   console.log("Zona horaria del servidor:", currentTime.getTimezoneOffset() / -60);
   console.log("Hora actual del servidor (original):", currentTime.toISOString());
   console.log("Hora actual ajustada a Costa Rica:", costaRicaTime.toISOString());
   console.log("Hora de expiración (Costa Rica):", expirationTime.toISOString());
   console.log("Diferencia (horas):", (expirationTime - costaRicaTime) / (1000 * 60 * 60));
   console.log("expiresIn configurado como:", expiresIn);
   console.log("==============================================");
   
   try {
      // Construir el payload del token usando los datos del usuario
      const payload = construirPayloadToken(usuario); // Esta función construye el cuerpo del token con la información del usuario

      return {
         success: true, // Indicador de éxito en la generación de los tokens
         tokens: {
            // Generar el accessToken con el payload y la clave secreta, con una expiración configurada por el parámetro 'expiresIn'
            accessToken: jwt.sign(payload, secretKey, { expiresIn }), // Token con expiración corta, por ejemplo 1 minuto

            // Generar el refreshToken con el mismo payload, pero con una expiración más larga
            refreshToken: jwt.sign(payload, secretKey, { expiresIn: "30d" }), // Token de refresco con expiración de 30 días
         },
      };
   } catch (error) {
      // Si ocurre un error durante la generación de los tokens, manejar el error y devolver una respuesta con el código de error 500
      return manejarError(error, 500, "Error al generar los tokens"); // Manejo del error en la generación de tokens
   }
};

/** ====================================================================================================================================
 * Prepares user data for authentication response
 * @param {Object} usuario - User data
 * @returns {Object} Formatted user data
 */
const prepararDatosUsuario = (usuario) => ({
   id_usuario: usuario.id_usuario,
   nombre_usuario: usuario.nombre_usuario,
   rol_usuario: usuario.rol_usuario,
   email_usuario: usuario.email_usuario,
   verificacion_usuario: usuario.verificacion_usuario,
   estado_usuario: usuario.estado_usuario,
   intentos_usuario: usuario.intentos_usuario,
   recuperacion_clave_usuario: usuario.recuperacion_clave_usuario,
   idNetsuite_usuario: usuario.idNetsuite_usuario,
   id_empresa_usuario: usuario.id_empresa,
   nombre_rol_usuario: usuario.nombre_rol,
});

/** ====================================================================================================================================
 * Procesa el flujo de autenticación para cualquier método de autenticación.
 *
 * 1. Genera los tokens necesarios para la sesión del usuario utilizando la clave secreta y los datos proporcionados.
 * 2. Si la generación de tokens es exitosa, devuelve los datos del usuario y los tokens generados.
 * 3. Si ocurre un error durante la generación de los tokens, devuelve una respuesta de error.
 *
 * @param {Object} usuario - Datos del usuario (por ejemplo, email, nombre, etc.) que se utilizarán para generar los tokens.
 * @param {string} secretKey - Clave secreta utilizada para firmar los tokens de autenticación (generalmente un JWT).
 *
 * @returns {Object} Resultado de la autenticación:
 * - Si la autenticación es exitosa:
 *   `{
 *     success: true,
 *     status: 200,
 *     message: "Inicio de sesión exitoso",
 *     data: {...},
 *     tokens: { accessToken, refreshToken }
 *   }`
 * - Si la generación de los tokens falla:
 *   `{
 *     success: false,
 *     status: 500,
 *     message: "Error al generar los tokens",
 *     details: "No se pudieron generar los tokens"
 *   }`
 */
const procesarAutenticacion = (usuario, secretKey) => {
   // Generar los tokens utilizando la clave secreta y los datos del usuario
   const tokens = generarTokens(secretKey, usuario);

   // Verificar si la generación de los tokens fue exitosa
   if (!tokens.success) {
      // Si la generación de tokens falla, devolver una respuesta de error
      return crearRespuesta(false, 500, "Error al generar los tokens", [], {
         details: "No se pudieron generar los tokens",
      });
   }

   // Si los tokens se generaron correctamente, devolver la respuesta exitosa
   return {
      status: 200, // Código de estado HTTP para éxito
      success: true, // Indicador de éxito
      message: "Inicio de sesión exitoso", // Mensaje de éxito
      data: prepararDatosUsuario(usuario), // Datos del usuario preparados para la respuesta
      tokens: tokens.tokens, // Tokens generados (por ejemplo, accessToken y refreshToken)
   };
};
/** ====================================================================================================================================
 * Maneja la autenticación de un usuario mediante Microsoft OAuth.
 *
 * Este endpoint:
 * 1. Extrae el correo electrónico del usuario desde la transacción.
 * 2. Valida si el usuario existe en la base de datos usando el correo electrónico.
 * 3. Si el usuario no existe, se devuelve una respuesta de error.
 * 4. Si el usuario existe, asigna la imagen de perfil obtenida desde la transacción al objeto del usuario.
 * 5. Luego, procesa la autenticación y genera los tokens necesarios para la sesión del usuario.
 * 6. Si ocurre un error en cualquier parte del proceso de autenticación, se captura y maneja adecuadamente.
 *
 * @param {Object} req - Objeto de la solicitud, que contiene la transacción del usuario y sus datos.
 * @param {Object} res - Objeto de la respuesta, utilizado para interactuar con la base de datos y devolver respuestas.
 *
 * @returns {Promise<Object>} Resultado de la autenticación:
 * - Si la autenticación es exitosa: `{ success: true, status: 200, message: "Autenticación exitosa", tokens: {...}, data: {...} }`
 * - Si la validación del usuario falla (no existe): `{ success: false, status: 404, message: "El usuario no se encuentra registrado", details: "No se encontró el usuario en la base de datos" }`
 * - Si ocurre un error durante el proceso: `{ success: false, status: 500, message: "Error al iniciar sesión", details: "Error durante el proceso de autenticación con Microsoft" }`
 */

const usuarioMicrosoft = async (req, res) => {
   try {
      // 1. Extraer el correo electrónico del usuario desde la transacción.
      const { email } = res.transaccion.user;
      // 1.1. Si el correo electrónico no está presente en la transacción, devolver la respuesta de error.
      if (!email) {
         return crearRespuesta(false, 400, "Error de autenticación", {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      // 2. Validar si el usuario existe en la base de datos usando el correo electrónico.
      const validacion = await validarExistenciaUsuario(email, res.database);

      // 3. Si el usuario no existe, devolver la respuesta de error.
      if (!validacion.success) return validacion.respuesta;

      // 4. Obtener los datos del usuario válidos.
      const usuario = validacion.usuario;

      // 5. Asignar la imagen de perfil del usuario obtenida desde la transacción.
      usuario.profilePicture = res.transaccion.user.imageUsuario;

      // 6. Procesar la autenticación y devolver los tokens necesarios.
      return procesarAutenticacion(usuario, process.env.JWT_SECRET);
   } catch (error) {
      // 7. Manejar cualquier error que ocurra durante el proceso de inicio de sesión.
      return manejarError(error, 500, "Error al iniciar sesión");
   }
};

/**
 * Actualiza los datos del usuario después del inicio de sesión con Microsoft.
 *
 * 1. Extrae los datos del usuario y los tokens relacionados de la transacción.
 * 2. Decodifica el token de autenticación para obtener la fecha de expiración.
 * 3. Genera un nuevo ID de usuario único y nuevos tokens de acceso.
 * 4. Prepara los datos necesarios para la actualización del usuario en la base de datos.
 * 5. Si la generación de tokens falla, se retorna un error.
 * 6. Si la actualización del usuario en la base de datos no afecta ninguna fila, se retorna un error.
 * 7. Si la actualización es exitosa, se retorna una respuesta con los detalles de la actualización y el nuevo token de acceso.
 * 8. Si ocurre un error en cualquier parte del proceso, se captura y maneja adecuadamente.
 *
 * @param {Object} req - Objeto de la solicitud, que contiene los datos de la transacción (información del usuario y los tokens).
 * @param {Object} res - Objeto de la respuesta, utilizado para interactuar con la base de datos y retornar respuestas.
 *
 * @returns {Promise<Object>} Resultado de la actualización:
 * - Si la actualización es exitosa: `{ success: true, status: 200, message: "Usuario actualizado correctamente", data: {...}, tokenHeaderApi: {...} }`
 * - Si la actualización falla (ninguna fila fue afectada): `{ success: false, status: 404, message: "No se pudo actualizar el usuario", details: "Ninguna fila fue afectada en la actualización" }`
 * - Si ocurre un error durante el proceso: `{ success: false, status: 500, message: "Error al modificar usuario", details: "Error durante la actualización de datos del usuario después del login con Microsoft" }`
 */

const modificarUsuarioLogin = async (req, res) => {
   try {
      // Extraer los datos del usuario y del token de la transacción
      const { name, email } = res.transaccion.user;

      // 1.1. Si el correo electrónico no está presente en la transacción, devolver la respuesta de error.
      if (!email) {
         return crearRespuesta(false, 400, "Error de autenticación", {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      const { tokenHeaderApi, secretKeys } = res.transaccion;
      const { tenantId, refreshToken, accessToken, expiresIn, objectId } = res.transaccion.o365Data;
      const metodo_administracion_usuario = res.transaccion.metodo_administracion_usuario;

      // Decodificar el token para obtener la fecha de expiración
      const decodedToken = jwt.decode(tokenHeaderApi);
      const expiracion_token_usuario = decodedToken?.exp || null;
      const usid = uuidv4(); // Generar un nuevo ID de usuario único

      // Generar nuevos tokens con los datos del usuario
      const tokenResult = generarTokens(secretKeys, {
         id_usuario: usid,
         nombre_usuario: name,
         email_usuario: email,
         rol_usuario: "usuario",
      });

      // Si la generación de tokens falla, devolver el error
      if (!tokenResult.success) {
         return tokenResult.error;
      }

      // Preparar los datos para la actualización del usuario en la base de datos
      const userData = {
         params: [
            name,
            email,
            "", // Se podría agregar un campo si es necesario
            expiracion_token_usuario, // Fecha de expiración del token de usuario
            metodo_administracion_usuario,
            1, // Estado activo (se puede ajustar según el negocio)
            0, // Indicar si el usuario está deshabilitado o no
            0, // Otro parámetro relacionado (especificar el uso)
            usid, // ID generado
            objectId, // ID del objeto del usuario en O365
            tenantId, // ID del tenant de O365
            1, // Indicador de estado (activo)
            refreshToken, // Refresh token
            accessToken, // Access token
            expiresIn, // Tiempo de expiración del token
            email, // Correo electrónico
         ],
      };

      // Intentar actualizar el usuario en la base de datos
      const resultadoActualizacion = await actualizarUsuario(userData, res.database);

      // Si no se afectaron filas en la actualización, devolver error
      if (resultadoActualizacion.affectedRows === 0) {
         return crearRespuesta(false, 404, "No se pudo actualizar el usuario", [], {
            details: "Ninguna fila fue afectada en la actualización",
         });
      }

      // Si la actualización es exitosa, devolver respuesta con los nuevos detalles
      return crearRespuesta(true, 200, "Usuario actualizado correctamente", {
         affectedRows: resultadoActualizacion.affectedRows,
         tokenHeaderApi: tokenResult.tokens.accessToken, // Nuevo token de acceso
      });
   } catch (error) {
      // Manejar cualquier error que ocurra durante la modificación de los datos del usuario
      return manejarError(
         error,
         500,
         "Error al modificar usuario",
         "Error durante la actualización de datos del usuario después del login con Microsoft",
      );
   }
};

/** ====================================================================================================================================
 * Maneja la autenticación manual de un usuario utilizando correo electrónico y contraseña.
 *
 * 1. Extrae el correo electrónico y la contraseña proporcionados por el usuario.
 * 2. Valida si el usuario existe en la base de datos usando el correo electrónico.
 * 3. Si el usuario no existe, devuelve una respuesta de error con el mensaje adecuado.
 * 4. Si el usuario existe, compara la contraseña proporcionada con la almacenada (encriptada).
 * 5. Si las contraseñas no coinciden, devuelve un error de autenticación.
 * 6. Si las credenciales son correctas, genera los tokens de autenticación y los devuelve.
 * 7. Si ocurre un error en cualquier parte del proceso, se captura y maneja adecuadamente.
 *
 * @param {Object} req - Objeto de la solicitud, que contiene los datos de la transacción (correo y contraseña del usuario).
 * @param {Object} res - Objeto de la respuesta, utilizado para interactuar con la base de datos y retornar respuestas.
 *
 * @returns {Promise<Object>} Resultado de la autenticación:
 * - Si las credenciales son correctas: `{ success: true, status: 200, message: "Inicio de sesión exitoso", data: {...}, tokens: {...} }`
 * - Si el usuario no existe o las credenciales son incorrectas: `{ success: false, status: 401, message: "Correo o contraseña incorrectos", details: "La contraseña proporcionada no coincide con la almacenada" }`
 * - Si ocurre un error durante el proceso: `{ success: false, status: 500, message: "Error al iniciar sesión", details: "Error durante la validación de credenciales o generación de tokens" }`
 */

const iniciarSesionManualmente = async (req, res) => {
   try {
      // Extraer el correo electrónico y la contraseña del usuario de la transacción
      const { email, password } = res.transaccion.user;

      // 1.1. Si el correo electrónico no está presente en la transacción, devolver la respuesta de error.
      if (!email) {
         return crearRespuesta(false, 400, "Error de autenticación", {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      // Validar la existencia del usuario en la base de datos
      const validacion = await validarExistenciaUsuario(email, res.database);

      // Si el usuario no existe, devolver la respuesta de error
      if (!validacion.success) return validacion.respuesta;

      const usuario = validacion.usuario;

      // Comparar la contraseña proporcionada con la contraseña almacenada (encriptada)
      const passwordMatch = await bcrypt.compare(password, usuario.clave_usuario);
      if (!passwordMatch) {

         // Actualizar los intentos fallidos del usuario
         await intentosFallidosInicioSesion(
            usuario.intentos_usuario + 1,
            usuario.id_usuario,
            res.database,
         );
         
         
         // Si la contraseña no coincide, devolver un error de autenticación
         return crearRespuesta(false, 401, "Correo o contraseña incorrectos", [], {
            details: "La contraseña proporcionada no coincide con la almacenada",
         });
      }

      // Si las credenciales son correctas, procesar la autenticación y devolver los tokens
      return procesarAutenticacion(usuario, process.env.JWT_SECRET);
   } catch (error) {
      // Manejar cualquier error que ocurra durante el proceso de inicio de sesión o autenticación
      return manejarError(
         error,
         500,
         "Error al iniciar sesión",
         "Error durante la validación de credenciales o generación de tokens",
      );
   }
};

/** ====================================================================================================================================
 * Verifica la existencia de un usuario en el sistema utilizando su correo electrónico.
 *
 * 1. Valida si el usuario existe en la base de datos mediante el correo electrónico proporcionado.
 * 2. Si el usuario existe, devuelve una respuesta exitosa con los datos del usuario.
 * 3. Si el usuario no existe, devuelve una respuesta de error.
 * 4. Si ocurre un error durante el proceso, se captura y maneja adecuadamente.
 *
 * @param {Object} req - Objeto de la solicitud, contiene la información de la transacción y el correo electrónico del usuario.
 * @param {Object} res - Objeto de la respuesta, utilizado para interactuar con la base de datos y retornar respuestas.
 *
 * @returns {Promise<Object>} Resultado de la verificación:
 * - Si el usuario existe: `{ success: true, status: 200, message: "Autenticación exitosa", data: {...} }`
 * - Si el usuario no existe: `{ success: false, status: 404, message: "El usuario no se encuentra registrado", details: "No se encontró el usuario en la base de datos" }`
 * - Si ocurre un error durante el proceso: `{ success: false, status: 500, message: "Error al autenticar usuario", details: "Error durante la verificación de existencia del usuario" }`
 */

const verificaionDeUsuario = async (req, res) => {
   try {
      // 1.1. Si el correo electrónico no está presente en la transacción, devolver la respuesta de error.
      if (!res.transaccion.user.email) {
         return crearRespuesta(false, 400, "Error de autenticación", {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      // Validar la existencia del usuario en la base de datos usando el correo electrónico del usuario
      const validacion = await validarExistenciaUsuario(res.transaccion.user.email, res.database);

      // Si la validación falla (usuario no existe), devolver la respuesta de error
      if (!validacion.success) return validacion.respuesta;

      // Si el usuario existe, devolver una respuesta de éxito con los datos del usuario
      return crearRespuesta(true, 200, "Autenticación exitosa", validacion.usuario);
   } catch (error) {
      // Manejar cualquier error que ocurra durante el proceso de verificación de usuario
      return manejarError(
         error,
         500,
         "Error al autenticar usuario",
         "Error durante la verificación de existencia del usuario",
      );
   }
};

/** ====================================================================================================================================
 * Método para actualizar la clave de un usuario.
 *
 * 1. Valida la existencia del usuario en la base de datos utilizando el correo proporcionado.
 * 2. Si el usuario existe, intenta actualizar la clave de acceso del usuario en la base de datos.
 * 3. Si la actualización es exitosa, devuelve una respuesta positiva con el número de filas afectadas y un nuevo token de acceso.
 * 4. Si el usuario no existe, o si la actualización no afecta ninguna fila, devuelve una respuesta de error.
 *
 * @param {Object} req - Objeto de la solicitud, contiene los datos del usuario.
 * @param {Object} res - Objeto de la respuesta, utilizado para interactuar con la base de datos y retornar respuestas.
 *
 * @returns {Object} Respuesta con el estado de la operación:
 * - Si la clave es actualizada correctamente: `{ success: true, status: 200, message: "Clave de usuario actualizada correctamente", data: {...} }`
 * - Si no se pudo actualizar la clave: `{ success: false, status: 404, message: "No se pudo actualizar la clave del usuario", details: "Ninguna fila fue afectada en la actualización" }`
 * - Si el usuario no existe: `{ success: false, status: 404, message: "El usuario no se encuentra registrado", details: "No se encontró el usuario en la base de datos" }`
 * - Si ocurre un error durante el proceso: `{ success: false, status: 500, message: "Error al enviar solicitud de cambio de clave", details: "Error durante la solicitud de cambio de clave" }`
 */
const solicitudCambioClave = async (req, res) => {
   try {
      // 1.1. Si el correo electrónico no está presente en la transacción, devolver la respuesta de error.
      if (!res.transaccion.user.email) {
         return crearRespuesta(false, 400, "Error de autenticación", {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      // Validar la existencia del usuario en la base de datos
      const validacion = await validarExistenciaUsuario(res.transaccion.user.email, res.database);

      // Si la validación falla (usuario no existe), devolver respuesta de error
      if (!validacion.success) return validacion.respuesta;

      // Intentar actualizar la clave del usuario
      const resultadoActualizacion = await actualizarClaveUsuario(
         validacion.usuario.email_usuario,
         res.database,
      );

      // Si no se afectaron filas en la base de datos (no se actualizó la clave), devolver error
      if (resultadoActualizacion.affectedRows === 0) {
         return crearRespuesta(false, 404, "No se pudo actualizar la clave del usuario", [], {
            details: "Ninguna fila fue afectada en la actualización",
         });
      }

      // Si la actualización es exitosa, devolver una respuesta positiva con detalles
      return crearRespuesta(true, 200, "Clave de usuario actualizada correctamente", {
         affectedRows: resultadoActualizacion.affectedRows, // Número de filas afectadas por la actualización
         tokenHeaderApi: "", // Nuevo token de acceso generado
      });
   } catch (error) {
      // Manejar cualquier error que ocurra durante el proceso
      return manejarError(
         error,
         500,
         "Error al enviar solicitud de cambio de clave",
         "Error durante la solicitud de cambio de clave",
      );
   }
};

/**
 * Actualiza los intentos fallidos de inicio de sesión de un usuario.
 *
 * Este proceso intenta actualizar el número de intentos fallidos de inicio de sesión de un usuario en la base de datos.
 * Si la actualización no afecta ninguna fila (es decir, no se actualizó nada), se devuelve un error.
 * Si la actualización es exitosa, se devuelve una respuesta positiva con detalles de la actualización.
 *
 * @param {number} intentos - El número de intentos fallidos de inicio de sesión que se deben registrar.
 * @param {number} idUsuario - El identificador único del usuario cuyo conteo de intentos fallidos se actualizará.
 * @param {Object} database - El objeto de conexión a la base de datos que se usará para ejecutar la consulta.
 *
 * @returns {Promise<Object>} - Un objeto con la respuesta del proceso:
 *   - Si la actualización es exitosa: `{ success: true, status: 200, message: "Intentos fallidos actualizados correctamente", data: { affectedRows: <número>, tokenHeaderApi: "" } }`
 *   - Si la actualización falla (no se afectaron filas): `{ success: false, status: 404, message: "No se pudo actualizar los intentos fallidos del usuario", details: "Ninguna fila fue afectada en la actualización" }`
 *   - En caso de error interno: `{ success: false, status: 500, message: "Error al actualizar los intentos fallidos del usuario", details: "Error al actualizar los intentos fallidos del usuario" }`
 */
const intentosFallidosInicioSesion = async (intentos, idUsuario, database) => {
   try {
      // 1. Intentar actualizar la cantidad de intentos fallidos del usuario en la base de datos
      const resultadoActualizacion = await actualizarIntentosFallidosInicioSesion(
         intentos,  // Número de intentos fallidos a actualizar
         idUsuario, // ID del usuario a actualizar
         database,  // Conexión a la base de datos
      );

      // 2. Si no se afectaron filas en la base de datos (no se actualizó la clave), devolver error
      if (resultadoActualizacion.affectedRows === 0) {
         return crearRespuesta(false, 404, "No se pudo actualizar los intentos fallidos del usuario", [], {
            details: "Ninguna fila fue afectada en la actualización",  // Detalle adicional para el error
         });
      }

      // 3. Si la actualización es exitosa, devolver una respuesta positiva con detalles
      return crearRespuesta(true, 200, "Intentos fallidos actualizados correctamente", {
         affectedRows: resultadoActualizacion.affectedRows,  // Número de filas afectadas por la actualización
         tokenHeaderApi: "",  // Puede incluir un nuevo token de acceso generado si es necesario
      });
   } catch (error) {
      // 4. Manejar cualquier error que ocurra durante el proceso
      return manejarError(
         error,
         500,
         "Error al actualizar los intentos fallidos del usuario",  // Mensaje de error genérico
         "Error al actualizar los intentos fallidos del usuario",  // Detalle del error para mayor claridad
      );
   }
};











/** ====================================================================================================================================
 * Exports the authentication module with all its methods
 */
const usuarioAuth = {
   usuarioMicrosoft, // Handles Microsoft OAuth authentication
   modificarUsuarioLogin, // Updates user data after Microsoft login
   iniciarSesionManualmente, // Handles manual authentication
   verificaionDeUsuario, // Verifies user existence
   solicitudCambioClave, // Handles request for password change
   
};

export default usuarioAuth;
