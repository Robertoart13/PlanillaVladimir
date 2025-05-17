import dotenv from "dotenv";
dotenv.config();


/**
 * Obtiene y valida las configuraciones de la base de datos desde las variables de entorno
 * @returns {Object} Configuración de la base de datos
 */
const getDatabaseConfig = () => {
   const hostLocalBD = process.env.HOST_LOCALBD;
   const authLocalBD = process.env.AUTH_LOCALBD;
   const passLocalBD = process.env.PASS_LOCALBD;
   const databasenexo = process.env.NAMEBD;
   const portmysql = process.env.PORT_LOCAL;
   

   return {
      host: hostLocalBD,
      user: authLocalBD,
      password: passLocalBD,
      database: databasenexo,
      port: portmysql,
   };
};

export const baseDeDatosCronjob = "pruebas";

/**
 * Obtiene y valida las configuraciones de OAuth para NetSuite
 * @returns {Object} Configuración de OAuth
 */
const getOAuthConfig = () => ({
   consumer: {
      key: process.env.OAUTH_NETSUITE_CONSUMER_KEY,
      secret: process.env.OAUTH_NETSUITE_CONSUMER_SECRET,
   },
   token: {
      id: process.env.OAUTH_NETSUITE_TOKEN_ID,
      secret: process.env.OAUTH_NETSUITE_TOKEN_SECRET,
   },
   realm: process.env.OAUTH_NETSUITE_REALM,
   signature: process.env.OAUTH_NETSUITE_SIGNATURE,
});

/**
 * Obtiene y valida las configuraciones del entorno
 * @returns {Object} Configuración del entorno
 */
const getEnvironmentConfig = () => ({
   nodeEnv: process.env.NODE_ENV || "pruebas",
   port: process.env.PORT || 7500,
   corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : 
   ["https://4552704-sb1.app.netsuite.com", "https://kpital360.com", "https://www.kpital360.com", "http://localhost:5173"],
});

/**
 * Configuración principal de la aplicación
 * @typedef {Object} AppConfig
 * @property {Object} oauthNetsuite - Configuración de OAuth para NetSuite
 * @property {Object} database - Configuraciones de base de datos
 * @property {Object} entorno - Configuraciones del entorno
 */

/**
 * Genera y retorna la configuración completa de la aplicación
 * @returns {AppConfig} Configuración completa de la aplicación
 */
const getAppConfig = () => {
   const databaseConfig = getDatabaseConfig();

   return {
      oauthNetsuite: getOAuthConfig(),
      database: {
         produccion: databaseConfig,
         pruebas: databaseConfig,
      },
      entorno: getEnvironmentConfig(),
   };
};

// Exportar la configuración de la aplicación
export default getAppConfig();
