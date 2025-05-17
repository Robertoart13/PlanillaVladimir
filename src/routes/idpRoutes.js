// Importar dependencias
import dotenv from "dotenv";
import path from "path";
import helpers from "../utils/helpers.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la autenticación y gestión de usuarios
 * Estos módulos manejan el registro, autenticación, verificación y administración de usuarios
 * ====================================================================================================================================
 */
import usuarioAuth from "../modules/01-usuarioAuth/usuarioAuth.js"; // Autenticación de usuarios
import Usuarios_Enlistar from "../modules/02-usuarios/Usuario_Enlistar.js"; // Listado de usuarios
import Usuarios_Editar from "../modules/02-usuarios/Usuarios_Editar.js"; // Edición de usuarios
import Usuarios_CambioEstado from "../modules/02-usuarios/Usuarios_CambioEstado.js"; // Cambio de estado de usuarios
import Usuarios_Verificar from "../modules/02-usuarios/Usuarios_Verificar.js"; // Verificación de usuarios
import Usuario_Reintentos from "../modules/02-usuarios/Usuario_Reintentos.js"; // Gestión de reintentos de acceso
import Usuario_Crear from "../modules/02-usuarios/Usuario_Crear.js"; // Creación de usuarios
import Usuario_AsignarPermiso from "../modules/02-usuarios/Uusario_AsiganrPermiso.js"; // Asignación de permisos a usuarios

import ejemploUsuario from "../modules/ejemploConexion/ejemploUsuario.js";


/** ====================================================================================================================================
 * @fileoverview Módulo de configuración de rutas para la aplicación.
 * Este archivo maneja la configuración de rutas, autenticación y gestión de solicitudes HTTP.
 * Implementa un sistema modular para definir y gestionar rutas dinámicamente.
 * @module idpRoutes
 */

// Configuración inicial de entorno
dotenv.config();

// Constantes de configuración
const API_VERSION = "/api/v1";
const NETSUITE_TOKEN = process.env.NETSUITE_TOKEN;

/** ====================================================================================================================================
 * Valida el token de acceso comparándolo con el token almacenado en las variables de entorno
 * @param {string} token - Token de acceso a validar
 * @param {object} body - Cuerpo de la solicitud que puede contener token_access
 * @param {boolean} requiresAuth - Indica si la ruta requiere autenticación completa
 * @returns {boolean} - True si el token es válido, false en caso contrario
 * @private
 */
function isValidToken(token, body, requiresAuth) {
   if (!token || typeof token !== "string") {
      console.log("[Auth] Token no proporcionado o inválido");
      return false;
   }

   if (
      requiresAuth &&
      (!body || body.token_access === undefined || process.env.JWT_SECRET !== body.token_access)
   ) {
      console.log(
         "[Auth] token_access es requerido para rutas protegidas o no coincide con JWT_SECRET",
      );
      return false;
   }

   if (token.startsWith("ey") && token.split(".").length === 3) {
      try {
         const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
         const currentTime = Math.floor(Date.now() / 1000);
         if (payload.exp && payload.exp < currentTime) {
            console.log("[Auth] JWT token has expired");
            return false;
         }
         return true;
      } catch (error) {
         console.error("[Auth] Error validating JWT token:", error);
         return false;
      }
   }

   return NETSUITE_TOKEN === token;
}

/** ====================================================================================================================================
 * Extrae el token de autorización del header de la solicitud
 * @param {object} headers - Headers de la solicitud HTTP
 * @returns {string|null} - Token extraído o null si no existe
 * @private
 */
function extractAuthToken(headers) {
   const authHeader = headers["authorization"];
   if (!authHeader) return null;

   const [bearer, token] = authHeader.split(" ");
   return bearer === "Bearer" ? token : null;
}

/** ====================================================================================================================================
 * Middleware para validar el token de acceso en las solicitudes
 * @param {object} req - Objeto de solicitud HTTP
 * @param {object} res - Objeto de respuesta HTTP
 * @param {function} next - Función para continuar con el siguiente middleware
 * @param {boolean} requiresAuth - Indica si la ruta requiere autenticación completa
 * @public
 */
function validateAccessToken(req, res, next) {
   const token = extractAuthToken(req.headers);
   const requiresAuth = req.requiresAuth === true;

   if (isValidToken(token, req.body, requiresAuth)) {
      console.log("[Auth] Se recibió un token de acceso válido");
      next();
   } else {
      console.log("[Auth] Intento de token de acceso no válido");
      res.status(401).json({
         status: 401,
         message: "Acceso no autorizado. Token no válido",
         timestamp: new Date().toISOString(),
      });
   }
}

/** ====================================================================================================================================
 * Maneja la respuesta de las solicitudes HTTP utilizando el helper de respuestas
 * @param {object} res - Objeto de respuesta HTTP
 * @param {object} response - Datos de respuesta exitosa
 * @param {object} error - Objeto de error si existe
 * @private
 */
function handleResponse(res, response, error) {
   if (!res.headersSent) {
      helpers.manageResponse(res, response, error);
   }
}

/**
 * Ejecuta una operación del modelo de forma segura y maneja sus resultados
 * @param {object} model - Modelo que contiene la lógica de negocio
 * @param {string} method - Nombre del método a ejecutar
 * @param {object} req - Objeto de solicitud HTTP
 * @param {object} res - Objeto de respuesta HTTP
 * @returns {Promise<void>}
 * @private
 */
async function executeModelOperation(model, method, req, res) {
   if (!model[method] || typeof model[method] !== "function") {
      console.error(`[Error] Method ${method} not found in model`);
      return handleResponse(res, null, new Error(`Method ${method} not implemented`));
   }

   try {
      const response = await model[method](res, req.body);
      handleResponse(res, response, null);
   } catch (error) {
      console.error(`[Error] ${method} operation failed:`, error);
      handleResponse(res, null, error);
   }
}

/** ====================================================================================================================================
 * Configura una ruta individual con sus middlewares correspondientes
 * @param {object} app - Instancia de Express
 * @param {object} routeConfig - Configuración de la ruta
 * @param {object} model - Modelo asociado a la ruta
 * @private
 */
function configureSingleRoute(app, { path, method, isAuthRequired }, model) {
   const routePath = `${API_VERSION}/${path}`;
   const middlewares = [];

   if (isAuthRequired) {
      middlewares.push((req, res, next) => {
         req.requiresAuth = true;
         next();
      });
      middlewares.push(validateAccessToken);
   }

   middlewares.push((req, res) => executeModelOperation(model, method, req, res));

   app.post(routePath, ...middlewares);
}

/** ====================================================================================================================================
 * Configura las rutas dinámicas basadas en la configuración de módulos
 * @param {object} app - Instancia de Express
 * @param {array} modulesConfig - Array de configuración de módulos
 * @private
 */
function configureDynamicRoutes(app, modulesConfig) {
   modulesConfig.forEach(({ model, routes }) => {
      routes.forEach((routeConfig) => {
         configureSingleRoute(app, routeConfig, model);
      });
   });
}

/** ====================================================================================================================================
 * Configura la ruta raíz que sirve el archivo index.html
 * @param {object} app - Instancia de Express
 * @private
 */
function configureRootRoute(app) {
   const __dirname = new URL(".", import.meta.url).pathname;
   const indexPath = path.join(__dirname, "../public", "index.html");
   app.get("/", (req, res) => {
      res.sendFile(indexPath);
   });
}

/** ====================================================================================================================================
 * Define la configuración de todos los módulos de la aplicación.
 *
 * Esta función retorna un array con la configuración de los módulos, incluyendo las rutas asociadas,
 * los métodos a invocar para cada ruta y si la autenticación es requerida para acceder a esa ruta.
 *
 * @returns {Array<Object>} Array con la configuración de cada módulo.
 *  - `category` (string): Nombre del módulo o categoría (por ejemplo, "Usuario").
 *  - `model` (Object): El modelo o controlador asociado con el módulo (por ejemplo, `usuarioAuth`).
 *  - `routes` (Array<Object>): Lista de rutas para el módulo. Cada objeto de ruta contiene:
 *     - `path` (string): La ruta asociada al módulo.
 *     - `method` (string): El método o función que se ejecutará al acceder a la ruta.
 *     - `isAuthRequired` (boolean): Indica si la ruta requiere autenticación (`true` o `false`).
 *
 * @private
 */
function getModulesConfig() {
   return [
      // Modulo de rutas relacioando con el login de usuario
      {
         category: "Usuario", // Nombre del módulo
         model: {
            ...usuarioAuth,
            ...Usuarios_Enlistar,
            ...Usuarios_Editar,
            ...Usuarios_CambioEstado,
            ...Usuarios_Verificar,
            ...Usuario_Reintentos,
            ...Usuario_Crear,
            ...Usuario_AsignarPermiso,
         }, // Combinamos ambos modelos
         routes: [
            // Definición de rutas asociadas al módulo
            {
               path: "usuario/microsoft", // Ruta para autenticación con Microsoft
               method: "usuarioMicrosoft", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuario/modificarUsuarioLogin", // Ruta para modificar usuario tras login
               method: "modificarUsuarioLogin", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuario/iniciarSesionManualmente", // Ruta para iniciar sesión manualmente
               method: "iniciarSesionManualmente", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuario/verificaionDeUsuario", // Ruta para verificar existencia de usuario
               method: "verificaionDeUsuario", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuario/solicitudCambioClave", // Ruta para solicitud de cambio de clave
               method: "solicitudCambioClave", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuarios",
               method: "obtenerListaCompleta",
               isAuthRequired: true,
            },
            {
               path: "usuarios-editar", // Ruta para editar información de usuario
               method: "editarTransaccionInfo", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "usuarios-crear", // Ruta para cambiar el estado de un usuario
               method: "crearTransaccionUser", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "usuario-verificar", // Ruta para verificar un usuario
               method: "editarTransaccionVerificar", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "usuario-reintentos", // Ruta para reiniciar los intentos de un usuario
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "usuarios-asignarPermiso", // Ruta para asignar un permiso a un usuario
               method: "asignarPermiso", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "usuarios-cambiarEstado", // Ruta para validar un permiso de un usuario
               method: "editarTransaccionEstado", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },

      {
         category: "Ejemplo", // Nombre del módulo
         model: {
            ...ejemploUsuario,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "ejemplo",
               method: "obtenerListaCompleta",
               isAuthRequired: false,
            },
         ],
      },

  
   ];
}

/** ====================================================================================================================================
 * Configura todas las rutas de la aplicación.
 *
 * Esta función se encarga de configurar todas las rutas necesarias para el funcionamiento de la aplicación.
 * Inicializa las rutas principales y las rutas dinámicas basadas en la configuración de los módulos.
 *
 * @param {object} app - Instancia de Express para configurar las rutas.
 * @throws {Error} Si la instancia de `app` no es válida o no es una aplicación Express.
 *
 * @public
 */
export default function configureRoutes(app) {
   // Validar si la instancia proporcionada es válida para Express
   if (!app || typeof app.get !== "function" || typeof app.post !== "function") {
      throw new Error("Invalid Express application instance");
   }

   //console.log("[Setup] Initializing routes configuration");

   // Configurar la ruta raíz (ejemplo /)
   configureRootRoute(app);

   // Obtener la configuración de los módulos
   const modulesConfig = getModulesConfig();

   // Configurar rutas dinámicas basadas en la configuración de los módulos
   configureDynamicRoutes(app, modulesConfig);

   //console.log("[Setup] Routes configuration completed");
}
