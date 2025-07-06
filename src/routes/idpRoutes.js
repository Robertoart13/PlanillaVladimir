// Importar dependencias
import dotenv from "dotenv";
import path from "path";
import helpers from "../utils/helpers.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la autenticación
 * Estos módulos manejan autenticación
 * ====================================================================================================================================
 */
import usuarioAuth from "../modules/01-usuarioAuth/usuarioAuth.js"; // Autenticación de usuarios

/**
 * =================================================================================== =================================================
 * Importación de módulos relacionados con la empresa
 * Estos módulos manejan la lista de empresas
 * ====================================================================================================================================
 */
import Empresas_Listar from "../modules/naturalEmpresa/03-Empresas/Empresas_ListaCompleta.js";
import Empresas_Crear from "../modules/naturalEmpresa/03-Empresas/Empresas_Crear.js";
import Empresas_Editar from "../modules/naturalEmpresa/03-Empresas/Empresas_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la empresa
 * Estos módulos manejan la lista de empresas
 * ====================================================================================================================================
 */
import Empleados_Listar from "../modules/naturalEmpresa/02-Empleados/Empleados_ListaCompleta.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la Selecciones
 * Estos módulos manejan la lista de selecciones
 * ====================================================================================================================================
 */
import Departamentos_Listar_select from "../modules/05-Selects/Departamentos_Lista.js";
import Nacionalidad_Listar_select from "../modules/05-Selects/Nacionalidad_Lista.js";
import Empresas_Listar_select from "../modules/05-Selects/Empresas_Lista.js";
import Puesto_Listar_select from "../modules/05-Selects/Puestos_Lista.js";
import TipoContrato_Listar_select from "../modules/05-Selects/TipoContrato.js";
import Supervisor_Listar_select from "../modules/05-Selects/Supervisores.js";
import Planilla_Listar_select from "../modules/05-Selects/Planilla_Lista.js";
import Permisos_Listar_select from "../modules/05-Selects/Permisos_Lista.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la Empleados
 * Estos módulos manejan la lista de empleados
 * ====================================================================================================================================
 */
import Empleados_Crear from "../modules/naturalEmpresa/04-Empleados/Empleados_Crear.js";
import Empleados_Editar from "../modules/naturalEmpresa/04-Empleados/Empleados_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la Empleados
 * Estos módulos manejan la lista de empleados
 * ====================================================================================================================================
 */
import Clientes_Listar from "../modules/06-Clientes/Clientes_ListaCompleta.js";
import Clientes_Crear from "../modules/06-Clientes/Cliente_Crear.js";
import Clientes_Editar from "../modules/06-Clientes/Clientes_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la Empleados
 * Estos módulos manejan la lista de empleados
 * ====================================================================================================================================
 */
import Calendario_Listar from "../modules/naturalEmpresa/07-Calendario/Clalendario_ListaCompleta.js";
import Calendario_Crear from "../modules/naturalEmpresa/07-Calendario/Calendario_Crear.js";
import Calendario_Evento from "../modules/naturalEmpresa/07-Calendario/Calendario_Evento.js";
import Calendario_Estado from "../modules/naturalEmpresa/07-Calendario/Calendario_Estado.js";
import Calendario_Editar from "../modules/naturalEmpresa/07-Calendario/Calendario_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos relacionados con la Empleados
 * Estos módulos manejan la lista de empleados
 * ====================================================================================================================================
 */
import Planilla_Listar from "../modules/naturalEmpresa/08-planilla/Planilla_ListaCompleta.js";
import Planilla_Crear from "../modules/naturalEmpresa/08-planilla/Planilla_Crear.js";
import Planilla_Editar from "../modules/naturalEmpresa/08-planilla/Planilla_Editar.js";
import Planilla_Listar_Empleados from "../modules/naturalEmpresa/08-planilla/Planilla_Lista_empleados.js";
import Planilla_Insertar_Empleado from "../modules/naturalEmpresa/08-planilla/Planilla_Insertar_Empleado.js";
import Planilla_AplicarPlanilla from "../modules/naturalEmpresa/08-planilla/Planilla_AplicarPlanilla.js";
import Planilla_Listar_aplicadas from "../modules/naturalEmpresa/08-planilla/Planilla_ListaCompletaAplicadas.js";
import Planilla_Habilitar from "../modules/naturalEmpresa/08-planilla/Planilla_HabilitarApi.js";

import Planil_Empleado_Aplicadas_Empleado from "../modules/naturalEmpresa/08-planilla/Planil_Empleado_Aplicadas_Empleado.js";
import Planilla_Aplicado from "../modules/naturalEmpresa/08-planilla/Planilla_Aplicado.js";
import Planilla_Incritos from "../modules/naturalEmpresa/08-planilla/Planilla_Incritos.js";
import planilla_estado from "../modules/naturalEmpresa/08-planilla/Planilla_CmabioEstado.js";







/**
 * ====================================================================================================================================
 * Importación de módulos que tengan solo que ver con el gestor de planilla no de Natual 

 * ====================================================================================================================================
 */
import Gestor_Empleados_Listar from "../modules/GestorPlanilla/01-Gestor-Empleados/Gestor_Empleados_Lista.js";
import Gestor_Empleado_Crear from "../modules/GestorPlanilla/01-Gestor-Empleados/Gestor_Empleado_Crear.js";
import Gestor_Empleado_Editar from "../modules/GestorPlanilla/01-Gestor-Empleados/Gestor_Empleado_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos que tengan solo que ver con el gestor de planilla no de Natual 

 * ====================================================================================================================================
 */
import Gestor_Planilla_Listar from "../modules/GestorPlanilla/02-Gestor_Planilla/Planilla_ListaCompletaOptions.js";
import Gestor_Planilla_Empleados_Options from "../modules/GestorPlanilla/02-Gestor_Planilla/Planilla_empleadosOptions.js";

/**
 * ====================================================================================================================================
 * Importación de módulos que tengan solo que ver con el gestor de planilla no de Natual 

 * ====================================================================================================================================
 */
import Gestor_Aumento_Crear from "../modules/GestorPlanilla/03-Gestor_Aumento/Gestor_Aumento_Crear.js";
import Gestor_Aumento_Listar from "../modules/GestorPlanilla/03-Gestor_Aumento/Gestor_Aumento_Lista.js";
import Gestor_Aumento_Editar from "../modules/GestorPlanilla/03-Gestor_Aumento/Gestor_Aumento_Editar.js";


/**
 * ====================================================================================================================================
 * Importación de módulos que tengan solo que ver con el gestor de planilla no de Natual 

 * ====================================================================================================================================
 */
import Gestor_Bono_Crear from "../modules/GestorPlanilla/03-Gestor_Bono/Gestor_Bono_Crear.js";
import Gestor_Bono_Listar from "../modules/GestorPlanilla/03-Gestor_Bono/Gesto_Bono_Lista.js";
import Gestor_Bono_Editar from "../modules/GestorPlanilla/03-Gestor_Bono/Gestor_Bono_Editar.js";

/**
 * ====================================================================================================================================
 * Importación de módulos que tengan solo que ver con el gestor de planilla no de Natual 

 * ====================================================================================================================================
 */
import Gestor_Extra_Crear from "../modules/GestorPlanilla/03-Gestor_Extra/Gestor_Extra_Crear.js";
import Gestor_Extra_Listar from "../modules/GestorPlanilla/03-Gestor_Extra/Gesto_Extra_Lista.js";




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
         }, // Combinamos ambos modelos
         routes: [
            // Definición de rutas asociadas al módulo
            {
               path: "usuario/login", // Ruta para autenticación con Microsoft
               method: "iniciarSesionManualmente", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
            {
               path: "usuario/verificaionDeUsuario", // Ruta para autenticación con Microsoft
               method: "verificarEstadoUsuario", // Método que se ejecutará
               isAuthRequired: false, // No requiere autenticación
            },
         ],
      },
      {
         category: "Empresa", // Nombre del módulo
         model: {
            ...Empresas_Listar,
            ...Empresas_Crear,
            ...Empresas_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "empresas", // Ruta para la lista de empresas
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "empresa/crear", // Ruta para la lista de empresas
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "empresa/editar", // Ruta para la lista de empresas
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Empleado", // Nombre del módulo
         model: {
            ...Empleados_Listar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "empleados", // Ruta para la lista de empleados
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Selecciones", // Nombre del módulo
         model: {
            ...Departamentos_Listar_select,
            ...Nacionalidad_Listar_select,
            ...Empresas_Listar_select,
            ...Puesto_Listar_select,
            ...TipoContrato_Listar_select,
            ...Supervisor_Listar_select,
            ...Planilla_Listar_select,
            ...Permisos_Listar_select,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "departamentos/select", // Ruta para la lista de departamentos
               method: "Departamentos_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "nacionalidades/select", // Ruta para la lista de nacionalidades
               method: "Nacionalidad_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "empresas/select", // Ruta para la lista de empresas
               method: "Empresas_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "puestos/select", // Ruta para la lista de puestos
               method: "Puestos_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "tipos_contrato/select", // Ruta para la lista de tipos de contrato
               method: "Tipos_Contrato_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "supervisores/select", // Ruta para la lista de supervisores
               method: "Supervisores_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/select", // Ruta para la lista de planilla
               method: "Planilla_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "permisos/select", // Ruta para la lista de permisos
               method: "Permisos_Listar_select", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Empleado", // Nombre del módulo
         model: {
            ...Empleados_Crear,
            ...Empleados_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "empleado/crear", // Ruta para la lista de empleados
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "empleado/editar", // Ruta para la lista de empleados
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Cliente", // Nombre del módulo
         model: {
            ...Clientes_Listar,
            ...Clientes_Crear,
            ...Clientes_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "clientes", // Ruta para la lista de clientes
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "cliente/crear", // Ruta para la lista de clientes
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "cliente/editar", // Ruta para la lista de clientes
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Calendario", // Nombre del módulo
         model: {
            ...Calendario_Listar,
            ...Calendario_Crear,
            ...Calendario_Evento,
            ...Calendario_Estado,
            ...Calendario_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "calendario", // Ruta para la lista de calendario
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "calendario/crear", // Ruta para la lista de calendario
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "calendario/id", // Ruta para la lista de calendario
               method: "obtenerEvento", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "calendario/estado", // Ruta para la lista de calendario
               method: "editarEstado", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "calendario/editar", // Ruta para la lista de calendario
               method: "editarEvento", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Planilla", // Nombre del módulo
         model: {
            ...Planilla_Listar,
            ...Planilla_Crear,
            ...Planilla_Editar,
            ...Planilla_Listar_Empleados,
            ...Planilla_Insertar_Empleado,
            ...Planilla_AplicarPlanilla,
            ...Planilla_Listar_aplicadas,
            ...Planil_Empleado_Aplicadas_Empleado,
            ...Planilla_Aplicado,
            ...Planilla_Incritos,
            ...planilla_estado,
            ...Planilla_Habilitar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "planilla", // Ruta para la lista de planilla
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/crear", // Ruta para la lista de planilla
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/editar", // Ruta para la lista de planilla
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/lista_empleado", // Ruta para la lista de planilla
               method: "Planilla_Listar_Empleados", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/insertar_empleado_planilla", // Ruta para la lista de planilla
               method: "Planilla_Insertar_Empleado", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/aplicar_planilla", // Ruta para la lista de planilla
               method: "aplicarPlanilla", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/listaAplicadas", // Ruta para la lista de planilla
               method: "Planilla_Listar_aplicadas", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/lista_empleado_planilla", // Ruta para la lista de planilla
               method: "ListaPlanilla", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/Planilla_Aplicado", // Ruta para la lista de planilla
               method: "Planilla_Aplicado", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/Planilla_Incritos", // Ruta para la lista de planilla
               method: "Planilla_Incritos", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/Planilla_CmabioEstado_Thunks", // Ruta para la lista de planilla
               method: "planilla_estado", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "planilla/habilitar", // Ruta para la lista de planilla
               method: "Planilla_Habilitar", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Gestor", // Nombre del módulo
         model: {
            ...Gestor_Empleados_Listar,
            ...Gestor_Empleado_Crear,
            ...Gestor_Empleado_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "gestor/empleados", // Ruta para la lista de empleados
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/empleados/crear", // Ruta para la lista de empleados
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/empleados/editar", // Ruta para la lista de empleados
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Gestor", // Nombre del módulo
         model: {
            ...Gestor_Planilla_Listar,
            ...Gestor_Planilla_Empleados_Options,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "gestor/planillas/listas", // Ruta para la lista de planilla
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/planillas/empleados/options", // Ruta para la lista de planilla
               method: "empleadosPlanillaOptions", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
         ],
      },
      {
         category: "Gestor", // Nombre del módulo
         model: {
            ...Gestor_Aumento_Crear,
            ...Gestor_Aumento_Listar,
            ...Gestor_Aumento_Editar,
         }, // Combinamos ambos modelos
         routes: [
            {
               path: "gestor/planilla/aumentos/crear", // Ruta para la lista de planilla
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/planilla/aumentos/lista", // Ruta para la lista de planilla
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/planilla/aumentos/editar", // Ruta para la lista de planilla
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            }, 
         ], 

      },
      {
         category: "Gestor", // Nombre del módulo
         model: {
            ...Gestor_Bono_Crear,
            ...Gestor_Bono_Listar,
            ...Gestor_Bono_Editar,
            }, // Combinamos ambos modelos
         routes: [
            {
               path: "gestor/planilla/bonificaciones/crear", // Ruta para la lista de planilla
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/planilla/bonificaciones/lista", // Ruta para la lista de planilla
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            }, 
            {
               path: "gestor/planilla/bonificaciones/editar", // Ruta para la lista de planilla
               method: "editarTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            }, 
         ],
      },
      {
         category: "Gestor", // Nombre del módulo
         model: {
            ...Gestor_Extra_Crear,
            ...Gestor_Extra_Listar,
            }, // Combinamos ambos modelos
         routes: [
            {
               path: "gestor/planilla/compensaciones/crear", // Ruta para la lista de planilla
               method: "crearTransaccion", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
            },
            {
               path: "gestor/planilla/compensaciones/lista", // Ruta para la lista de planilla
               method: "obtenerListaCompleta", // Método que se ejecutará
               isAuthRequired: true, // Requiere autenticación
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
