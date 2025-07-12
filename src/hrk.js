import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import config_env from "./config/config.js";
import fs from "fs";
import dotenv from "dotenv";
import idpRoutes from "./routes/idpRoutes.js";
import cookieParser from "cookie-parser"; // Aquí importamos cookie-parser
import { fileURLToPath } from "url";

// Configuración inicial de entorno
dotenv.config();

// Constantes de configuración
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, "../deploy.log");

/** ====================================================================================================================================
 * Lee las últimas líneas de un archivo de log.
 *
 * @param {string} filePath - Ruta del archivo de log.
 * @param {number} [lines=5] - Número de líneas a leer desde el final del archivo. Por defecto es 5.
 *
 * @returns {string|null} Últimas líneas del archivo o null si el archivo no existe.
 *
 * @example
 * const lastLines = readLastLines("/path/to/logfile.log", 10);
 * console.log(lastLines);
 */
function readLastLines(filePath, lines = 5) {
  if (!fs.existsSync(filePath)) return null; // Verifica si el archivo existe.
  const content = fs.readFileSync(filePath, "utf-8").trim(); // Lee el archivo y elimina espacios en blanco al principio y al final.
  return content.split("\n").slice(-lines).join("\n"); // Divide el contenido por líneas, selecciona las últimas 'lines' líneas y las une de nuevo en un solo string.
}

/** ====================================================================================================================================
 * Muestra los últimos cambios registrados en el archivo de log.
 *
 * @param {string} logPath - Ruta del archivo de log que contiene los registros de los cambios.
 *
 * @example
 * showLastDeployChanges("/path/to/deploy.log");
 */
function showLastDeployChanges(logPath) {
  const lastChanges = readLastLines(logPath); // Obtiene las últimas líneas del archivo de log.

  if (lastChanges) {
    console.log(`📝 Últimos cambios en el servidor:\n${lastChanges}`); // Si existen cambios, los muestra.
  } else {
    console.log("⚠️ No se encontraron registros previos de despliegue."); // Si no hay cambios, muestra un mensaje de advertencia.
  }
}

/** ====================================================================================================================================
 * Configura los middlewares básicos para la aplicación.
 *
 * Esta función establece varios middlewares necesarios para una aplicación Express,
 * incluyendo el manejo de solicitudes JSON, codificación URL, cookies, logging y archivos estáticos.
 *
 * @param {object} app - Instancia de Express.
 *
 * @example
 * setupBasicMiddlewares(app);
 */
function setupBasicMiddlewares(app) {
  // Configurar codificación UTF-8 para todas las respuestas
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Middleware para analizar el cuerpo de la solicitud en formato JSON
  app.use(express.json({ limit: '10mb' }));

  // Middleware para analizar datos codificados en URL
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware para parsear cookies
  app.use(cookieParser());

  // Middleware para logging de solicitudes HTTP
  app.use(morgan("dev"));

  // Middleware personalizado para logging detallado de peticiones
  app.use((req, res, next) => {
    const startTime = Date.now();
    
    // Log de inicio de petición
    console.log(`🚀 [${new Date().toISOString()}] ${req.method} ${req.path} - Iniciando...`);
    
    // Interceptar el evento 'finish' para logging de finalización
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
      
      console.log(`${statusColor} [${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      
      // Log de advertencia para peticiones lentas
      if (duration > 10000) {
        console.warn(`🐌 Petición lenta detectada: ${req.method} ${req.path} tomó ${duration}ms`);
      }
    });
    
    next();
  });

  // Middleware para archivos estáticos
  app.use(express.static(path.join(__dirname, "../public")));
}

/** ====================================================================================================================================
 * Crea un manejador de errores personalizado para CORS.
 *
 * Este middleware intercepta los errores relacionados con CORS (Cross-Origin Resource Sharing)
 * y devuelve una respuesta con un código de estado 403 (Forbidden) y un mensaje específico de error.
 * Si el error no está relacionado con CORS, se pasa al siguiente middleware de manejo de errores.
 *
 * @returns {function} Middleware para manejo de errores CORS.
 *
 * @example
 * const corsErrorHandler = createCorsErrorHandler();
 * app.use(corsErrorHandler); // Añadir el manejador de errores CORS a la cadena de middlewares
 */
function createCorsErrorHandler() {
  return (err, req, res, next) => {
    // Verifica si el mensaje de error contiene "CORS"
    if (err.message.includes("CORS")) {
      // Si es un error CORS, responde con un 403 y un mensaje específico
      res.status(403).json({
        error: "Error CORS",
        message: err.message,
      });
    } else {
      // Si no es un error CORS, pasa el error al siguiente middleware
      next(err);
    }
  };
}

/** ====================================================================================================================================
 * Configura CORS en la aplicación.
 *
 * Esta función establece las configuraciones de CORS (Cross-Origin Resource Sharing) para una
 * aplicación Express. Permite el acceso desde orígenes específicos definidos en la lista `allowedOrigins`.
 * Si el origen de la solicitud no está en la lista de orígenes permitidos, se devuelve un error CORS.
 * Además, se configuran los métodos HTTP permitidos y se gestiona el estado de éxito para las solicitudes OPTIONS.
 *
 * @param {object} app - Instancia de Express.
 * @param {Array<string>} allowedOrigins - Lista de orígenes permitidos.
 *
 * @example
 * const allowedOrigins = ["http://example.com", "https://anotherdomain.com"];
 * configureCORS(app, allowedOrigins); // Configura CORS para la aplicación
 */
function configureCORS(app, allowedOrigins) {
  const corsOptions = {
    // Configura la validación del origen
    origin: (origin, callback) => {
      // Si el origen es permitido o si no hay origen (caso de solicitudes internas)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Permite la solicitud
      } else {
        // Si el origen no es permitido, genera un error
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    // Métodos permitidos
    methods: ["GET", "PUT", "POST"],
    // Código de éxito para solicitudes OPTIONS (verificación previa)
    optionsSuccessStatus: 200,
  };

  // Usa la configuración CORS con Express
  app.use(cors(corsOptions));
  // Añade el manejador de errores CORS para capturar problemas específicos de CORS
  app.use(createCorsErrorHandler());
}

/** ====================================================================================================================================
 * Configura el manejo de errores globales en la aplicación.
 *
 * Esta función configura un middleware que maneja los errores que ocurren en cualquier parte
 * de la aplicación Express. Si ocurre un error, el middleware captura el error y devuelve una
 * respuesta con un código de estado 500 (Error Interno del Servidor) y un mensaje descriptivo.
 * Además, se imprime el error en la consola para su rastreo y depuración.
 *
 * @param {object} app - Instancia de Express.
 *
 * @example
 * setupErrorHandling(app); // Configura el manejo de errores globales en la aplicación
 */
function setupErrorHandling(app) {
  // Middleware para manejar los errores globalmente
  app.use((err, req, res, next) => {
    // Registra el error en la consola
    console.error("❌ Error:", err);

    // Responde con un error 500 y el mensaje del error
    res.status(500).json({
      error: "Error interno del servidor", // Mensaje genérico de error
      message: err.message, // Mensaje específico del error
    });
  });
}

/** ====================================================================================================================================
 * Configura el manejo de la señal SIGINT para un cierre controlado del servidor.
 *
 * Esta función configura un manejador para la señal SIGINT (generalmente enviada al presionar Ctrl+C en la terminal),
 * lo que permite realizar un cierre controlado del servidor. Durante el proceso de cierre, el servidor intentará cerrar
 * sus conexiones abiertas y limpiar cualquier recurso antes de finalizar. Si no se puede cerrar correctamente dentro de
 * un tiempo determinado, el proceso se forzará a salir.
 *
 * @param {object} server - Instancia del servidor HTTP (generalmente creado con express).
 *
 * @example
 * setupSigintHandler(server); // Configura el cierre controlado para el servidor
 */
function setupSigintHandler(server) {
  process.on("SIGINT", () => {
    // Mensaje para indicar que el cierre del servidor está iniciando
    console.log("🔒 Iniciando cierre del servidor...");

    // Intenta cerrar el servidor de manera controlada
    server.close((err) => {
      if (err) {
        // Si ocurre un error al cerrar el servidor, lo logea y termina el proceso con código 1
        console.error("Error al cerrar el servidor:", err);
        process.exit(1);
      }

      // Si el servidor se cierra correctamente, se muestra el mensaje correspondiente
      console.log("✅ Servidor cerrado correctamente");

      // Finaliza el proceso con código 0, indicando que todo salió bien
      process.exit(0);
    });

    // Si el cierre no se completa dentro de 5 segundos, forzamos el cierre del proceso
    setTimeout(() => {
      console.error("⚠️ Forzando cierre después de 5 segundos");
      process.exit(1); // Fuerza la salida del proceso con código 1
    }, 5000);
  });
}

/** ====================================================================================================================================
 * Configura el manejo de promesas no controladas.
 */
function setupUnhandledRejectionHandler() {
  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Rechazo de promesa no manejado:", reason);
  });
}

/** ====================================================================================================================================
 * Configura el manejo de señales de terminación del proceso.
 * @param {object} server - Instancia del servidor HTTP.
 */
function setupProcessHandlers(server) {
  setupSigintHandler(server);
  setupUnhandledRejectionHandler();
}

/** ====================================================================================================================================
 * Crea y configura una nueva instancia de Express.
 * @returns {object} Instancia de la aplicación Express configurada.
 */
function createExpressApp() {
  const app = express();
  app.set("port", config_env.entorno.port);
  app.set("env", config_env.entorno.nodeEnv);
  return app;
}

/** ====================================================================================================================================
 * Inicia el servidor HTTP en el puerto configurado.
 * @param {object} app - Instancia de Express.
 * @returns {object} Instancia del servidor HTTP.
 */
function startHttpServer(app) {
  return app.listen(app.get("port"), () => {
    console.log(`💻 Server 🔊 on PORT ${app.get("port")}`);
  });
}

/** ====================================================================================================================================
 * Configura y lanza la aplicación.
 *
 * Esta función se encarga de inicializar la aplicación Express, configurar los middlewares esenciales,
 * definir las rutas de la aplicación y arrancar el servidor HTTP. Además, se encarga de mostrar los últimos cambios
 * del despliegue y configurar los manejadores de señales del proceso para un cierre controlado.
 *
 * @example
 * bootstrapApplication(); // Inicializa y arranca la aplicación.
 */
function bootstrapApplication() {
  // Mostrar últimos cambios del despliegue (útil para auditoría o diagnóstico)
  showLastDeployChanges(LOG_PATH);

  // Inicialización de la aplicación Express
  const app = createExpressApp();

  // Configuración de middlewares esenciales
  setupBasicMiddlewares(app); // Middlewares básicos (JSON, urlencoded, cookieParser, morgan)

  // Middleware de timeout global (15 segundos)
  app.use((req, res, next) => {
    // Configurar timeout más largo para operaciones complejas
    const timeout = req.path.includes('/gestor/planilla/gestor') ? 30000 : 15000;
    
    res.setTimeout(timeout, () => {
      if (!res.headersSent) {
        console.error(`⏰ Timeout en ruta: ${req.path} después de ${timeout}ms`);
        res.status(504).json({ 
          error: 'Timeout', 
          message: 'La petición tardó demasiado en responder.',
          path: req.path,
          timeout: timeout
        });
      }
    });
    
    // Agregar listener para detectar cuando la respuesta se envía
    res.on('finish', () => {
      console.log(`✅ Respuesta enviada para ${req.path} - Status: ${res.statusCode}`);
    });
    
    next();
  });

  configureCORS(app, config_env.entorno.corsOrigins); // Configura CORS con orígenes permitidos
  setupErrorHandling(app); // Configura manejo global de errores

  // Configuración de rutas de la aplicación
  idpRoutes(app); // Define las rutas para el IDP (Proveedor de Identidad) o rutas relacionadas con autenticación

  // Inicia el servidor HTTP
  const server = startHttpServer(app);

  // Configuración de manejo de señales del proceso (para cierre controlado)
  setupProcessHandlers(server);
}

// Iniciar la aplicación
bootstrapApplication();

// Exportar la configuración del entorno (para ser utilizada en otros módulos)
export { config_env };
