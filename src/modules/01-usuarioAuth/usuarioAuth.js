import {
   realizarConsulta,
   crearRespuesta,
   manejarError,
   codificarBase64,
} from "../../mysql2-promise/mysql2-promise.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/**
 * Consultas SQL para operaciones con usuarios
 *
 * @example
 * // Obtener usuario por email
 * const resultado = await realizarConsulta(QUERIES.USUARIO_POR_EMAIL, [email], database);
 */
const QUERIES = {
   USUARIO_POR_EMAIL: `
    SELECT *
    FROM usuarios_tbl
    WHERE email_usuario = ?
  `,
};

/**
 * Construye el payload para un token JWT
 *
 * @param {Object} usuario - Datos del usuario
 * @returns {Object} Payload con datos esenciales del usuario (id, nombre codificado, email, rol, estado)
 */
const construirPayloadToken = (usuario) => ({
   id_usuario: usuario.id_usuario,
   nombre_usuario: usuario.nombre_usuario, // Codificamos el nombre para evitar caracteres especiales
   email_usuario: usuario.email_usuario,
   rol_usuario: usuario.rol_usuario,
   estado_usuario: usuario.estado_usuario,
   intentos_login_usuario: usuario.intentos_login_usuario,
   login_usuario: usuario.login_usuario,
});

/**
 * Obtiene un usuario por su email
 *
 * @param {string} email - Email del usuario
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Resultado de la consulta con datos del usuario
 */
const obtenerUsuarioPorEmail = async (email, database) => {
   return await realizarConsulta(QUERIES.USUARIO_POR_EMAIL, [email], database);
};

/**
 * Valida la existencia de un usuario por email
 *
 * @param {string} email - Email del usuario
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Objeto con resultado de la validación:
 *   - Si existe: {success: true, usuario: {...}}
 *   - Si no existe: {success: false, respuesta: {...}}
 * @throws {Error} Si ocurre un error durante la consulta
 */
const validarExistenciaUsuario = async (email, database) => {
   try {
      const resultadoConsulta = await obtenerUsuarioPorEmail(email, database);

      // Verificamos si la consulta no devolvió resultados
      if (!Array.isArray(resultadoConsulta.datos) || resultadoConsulta.datos.length === 0) {
         return {
            success: false,
            respuesta: crearRespuesta(
               false,
               404,
               "El usuario no se encuentra registrado en el sistema.",
               [],
               {
                  details: "No se encontró el usuario en la base de datos",
               },
            ),
         };
      }

      return {
         success: true,
         usuario: resultadoConsulta.datos[0],
      };
   } catch (error) {
      console.error("❌ Error en validarExistenciaUsuario:", error);
      throw new Error("Error al validar la existencia del usuario.");
   }
};

/**
 * Valida la existencia de un usuario por email
 *
 * @param {string} email - Email del usuario
 * @param {Object} database - Conexión a la base de datos
 * @returns {Promise<Object>} Objeto con resultado de la validación:
 *   - Si existe: {success: true, usuario: {...}}
 *   - Si no existe: {success: false, respuesta: {...}}
 * @throws {Error} Si ocurre un error durante la consulta
 */
const verificarEstadoUsuario = async (req, res) => {
   try {
      const resultadoConsulta = await obtenerUsuarioPorEmail(
         res.transaccion.user.email,
         res.database,
      );

      // Verificamos si la consulta no devolvió resultados
      if (!Array.isArray(resultadoConsulta.datos) || resultadoConsulta.datos.length === 0) {
         return {
            success: false,
            respuesta: crearRespuesta(false, 404, "El usuario no se encuentra registrado", [], {
               details: "No se encontró el usuario en la base de datos",
            }),
         };
      }

      return {
         success: true,
         usuario: resultadoConsulta.datos[0],
      };
   } catch (error) {
      console.error("❌ Error en validarExistenciaUsuario:", error);
      throw new Error("Error al validar la existencia del usuario.");
   }
};

/**
 * Genera tokens JWT para autenticación
 *
 * @param {string} secretKey - Clave secreta para firmar el token
 * @param {Object} usuario - Datos del usuario
 * @param {string} expiresIn - Tiempo de expiración del token de acceso (por defecto 3 horas)
 * @returns {Object} Tokens generados: {success: true, tokens: {accessToken, refreshToken}}
 *
 * @example
 * const tokens = generarTokens(process.env.JWT_SECRET, usuario);
 * // tokens.tokens.accessToken - Token de acceso para autenticación (3h)
 * // tokens.tokens.refreshToken - Token de refresco (30 días)
 */
const generarTokens = (secretKey, usuario, expiresIn = "3h") => {
   try {
      const payload = construirPayloadToken(usuario);

      return {
         success: true,
         tokens: {
            // Token principal con duración corta (3 horas)
            accessToken: jwt.sign(payload, secretKey, { expiresIn }),
            // Token de refresco con duración extendida (30 días)
            refreshToken: jwt.sign(payload, secretKey, { expiresIn: "30d" }),
         },
      };
   } catch (error) {
      return manejarError(error, 500, "Error al generar los tokens");
   }
};

/**
 * Prepara los datos del usuario para la respuesta de autenticación
 * Excluye información sensible como contraseñas y normaliza el formato
 *
 * @param {Object} usuario - Datos del usuario desde BD
 * @returns {Object} Datos seguros del usuario para la respuesta
 */
const prepararDatosUsuario = (usuario) => ({
   id_usuario: usuario.id_usuario,
   nombre_usuario: usuario.nombre_usuario,
   email_usuario: usuario.email_usuario,
   rol_usuario: usuario.rol_usuario,
   estado_usuario: usuario.estado_usuario,
   intentos_login_usuario: usuario.intentos_login_usuario,
   login_usuario: usuario.login_usuario,
});

/**
 * Procesa la autenticación generando los tokens necesarios
 *
 * @param {Object} usuario - Datos del usuario autenticado
 * @param {string} secretKey - Clave secreta para firmar los tokens
 * @returns {Object} Respuesta con tokens y datos del usuario
 */
const procesarAutenticacion = (usuario, secretKey) => {
   const tokens = generarTokens(secretKey, usuario);

   if (!tokens.success) {
      return crearRespuesta(false, 500, "Error al generar los tokens", [], {
         details: "No se pudieron generar los tokens",
      });
   }

   return {
      status: 200,
      success: true,
      message: "Inicio de sesión exitoso",
      data: prepararDatosUsuario(usuario),
      tokens: tokens.tokens,
   };
};

/**
 * Maneja la autenticación con email y contraseña
 *
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta con conexión a BD
 * @returns {Promise<Object>} Resultado de la autenticación con tokens si es exitosa
 *
 * @example
 * // Ejemplo de solicitud esperada
 * res.transaccion = {
 *   user: {
 *     email: "usuario@example.com",
 *     password: "contraseña123"
 *   }
 * };
 * const resultado = await iniciarSesionManualmente(req, res);
 */
const iniciarSesionManualmente = async (req, res) => {
   try {
      const { email, password } = res.transaccion.user;

      if (!email) {
         return crearRespuesta(false, 400, "Error de autenticación", [], {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      const validacion = await validarExistenciaUsuario(email, res.database);
      if (!validacion.success) return validacion.respuesta;

      const usuario = validacion.usuario;

      // Verificamos la contraseña con bcrypt (manejo especial para errores de bcrypt)
      try {
         // Verificamos si el hash tiene formato correcto
         if (!usuario.password_hash_usuario.match(/^\$2[aby]\$\d+\$/)) {
            console.log("⚠️ El formato del hash no parece ser bcrypt estándar");
         }

         // Comparamos la contraseña
         const passwordMatch = await bcrypt.compare(password.trim(), usuario.password_hash_usuario);

         // Si la contraseña no coincide, devolvemos un error
         // console.log("🔑 Contraseña proporcionada:", passwordMatch);

         if (!passwordMatch) {
            return crearRespuesta(
               false,
               401,
               "Correo o contraseña incorrectos , favor volver a ingresar las credenciales",
               [],
               {
                  details: "La contraseña proporcionada no coincide con la almacenada",
               },
            );
         }

         // Si la autenticación es exitosa, generamos los tokens
         return procesarAutenticacion(usuario, process.env.JWT_SECRET);
      } catch (bcryptError) {
         return crearRespuesta(false, 500, "Error en la verificación de contraseña", [], {
            details:
               "Ocurrió un error durante la comparación de contraseñas: " + bcryptError.message,
         });
      }
   } catch (error) {
      console.log("🔑 Error en iniciarSesionManualmente:", error);
      return manejarError(
         error,
         500,
         "Error al iniciar sesión",
         "Error durante la validación de credenciales o generación de tokens",
      );
   }
};

/**
 * Verifica la existencia de un usuario por email sin validar contraseña
 * Útil para operaciones que solo requieren confirmar que el usuario existe
 *
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta con conexión a BD
 * @returns {Promise<Object>} Resultado de la verificación
 */
const verificacionDeUsuario = async (req, res) => {
   try {
      if (!res.transaccion.user.email) {
         return crearRespuesta(false, 400, "Error de autenticación", [], {
            details: "El correo electrónico no está presente en la transacción",
         });
      }

      const validacion = await validarExistenciaUsuario(res.transaccion.user.email, res.database);
      if (!validacion.success) return validacion.respuesta;

      return crearRespuesta(true, 200, "Autenticación exitosa", validacion.usuario);
   } catch (error) {
      return manejarError(
         error,
         500,
         "Error al autenticar usuario",
         "Error durante la verificación de existencia del usuario",
      );
   }
};

/**
 * Módulo de autenticación de usuarios
 * Provee funciones para validar credenciales y generar tokens de sesión
 */
const usuarioAuth = {
   iniciarSesionManualmente,
   verificacionDeUsuario,
   verificarEstadoUsuario,
};

// For testing purposes, generate a new hash
// const salt = await bcrypt.genSalt(10);
// const newHash = await bcrypt.hash("!Rocca.2025JGJG", salt);
// console.log("New hash:", newHash);

export default usuarioAuth;
