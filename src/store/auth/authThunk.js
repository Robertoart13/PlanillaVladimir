import { ApiProvider } from "../providerApi/providerApi";
import { verificacionUsuario, logout as logoutAction } from "./authSlice";
import Cookies from "js-cookie";

// ====================================================================================================================================
// Helper Functions
// ====================================================================================================================================

/**
 * Clears user session data from cookies and local storage.
 */
const clearUserSessionData = () => {
   localStorage.removeItem("preloading");
   localStorage.removeItem("persist:auth");
   localStorage.removeItem("persist:root");
   Cookies.remove("access_token");
   Cookies.remove("refresh_token");
};

/**
 * Handles the dispatch of authentication error messages.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {string} errorMessage - The error message to display.
 */
const handleAuthenticationError = (dispatch, errorMessage) => {
   dispatch(
      verificacionUsuario({
         authUsuario: "Error",
         Mensaje: errorMessage,
      }),
   );
};

/**
 * Saves authentication tokens to cookies.
 * @param {string} accessToken - The access token.
 * @param {string} refreshToken - The refresh token.
 */
const saveTokensInCookies = async (accessToken, refreshToken) => {
   // Guardar token de acceso (corta duración - 1 hora)
   Cookies.set("access_token", accessToken, {
      secure: true,
      sameSite: "Strict",
      expires: 0.1667, // 4 horas
   });

   // Guardar token de refresco (larga duración - 30 días)
   Cookies.set("refresh_token", refreshToken, {
      httpOnly: true, // No accesible desde JavaScript
      secure: true,
      sameSite: "Strict",
      expires: 30, // Expiración de 30 días
   });

   return true;
};

// ====================================================================================================================================
// Thunks
// ====================================================================================================================================

/**
 * Logs out the user, clears session data, and updates the Redux state.
 * @param {Object} [payload={}] - Optional payload, e.g., a logout message.
 * @param {string} [payload.mensaje] - A message to be dispatched with the logout action.
 * @returns {Function} A Redux thunk.
 */
export const logout = (payload = {}) => {
   return (dispatch) => {
      clearUserSessionData();
      dispatch(logoutAction(payload.mensaje ? { mensaje: payload.mensaje } : {}));
      dispatch(
         verificacionUsuario({
            authUsuario: "NoAutenticado",
            Mensaje: payload.mensaje || "Sesión cerrada.",
         }),
      );
   };
};

/**
 * Initiates a manual login session for the user.
 * @param {Object} datosUsuario - User credentials (email, password).
 * @param {Function} navigate - Navigation function from react-router-dom.
 * @returns {Function} A Redux thunk that returns "Autenticado" on success, or null on failure.
 */
export const IniciarSesionManualmente = (datosUsuario, navigate) => {
   return async (dispatch) => {
      const loginCredentials = {
         user: {
            email: datosUsuario.email,
            password: datosUsuario.password,
         },
      };
      const endpoint = "usuario/login";
      let transaccion = loginCredentials;
      try {
         dispatch(
            verificacionUsuario({
               authUsuario: "EnProceso",
               Mensaje: `Verificando credenciales...`,
            }),
         );
         Cookies.remove("access_token");

         const resultadoValidacion = await ApiProvider({ transaccion, endpoint });

         if (
            resultadoValidacion.data.status === 401 ||
            resultadoValidacion.data.status === 404 ||
            resultadoValidacion.data.status === 500 ||
            resultadoValidacion.data.status === 400
         ) {
            clearUserSessionData();
            return handleAuthenticationError(dispatch, resultadoValidacion.data.message);
         }

         if (resultadoValidacion.data.data.estado_usuario === 0) {
            clearUserSessionData();
            return handleAuthenticationError(
               dispatch,
               "Lo sentimos, su usuario está inactivo. Por favor, contacte al administrador.",
            );
         }

         if (resultadoValidacion.data.data.intentos_login_usuario === 1) {
            clearUserSessionData();
            return handleAuthenticationError(
               dispatch,
               "Lo sentimos, existe una solicitud de cambio de contraseña pendiente. Por favor, contacte al administrador.",
            );
         }



         // if (resultadoValidacion.data.data.login_usuario === 1) {
         //    return handleAuthenticationError(
         //       dispatch,
         //       "Acceso denegado. No tiene permisos para ingresar a este sistema. Su cuenta será bloqueada si reintenta acceder sin autorización.",
         //    );
         // }

         const { accessToken, refreshToken } = resultadoValidacion.data.tokens || {};

         if (!accessToken) {
            clearUserSessionData();
            handleAuthenticationError(
               dispatch,
               "No se recibió el token de acceso después del inicio de sesión.",
            );
            return null;
         }

         // Primer dispatch inmediato: mensaje de bienvenida
         // Mostrar mensaje de bienvenida inmediatamente
         dispatch(
            verificacionUsuario({
               authUsuario: "EnProceso",
               Mensaje: `Bienvenido,  ${resultadoValidacion?.data?.data?.nombre_usuario}, \n Estamos verificando el acceso, Por favor, espera un momento...`,
            }),
         );

         // Redirigir a los 6 segundos
         setTimeout(async () => {
            await saveTokensInCookies(accessToken, refreshToken);
            navigate("/");
         }, 2000);

         return "Autenticado";
      } catch (error) {
         console.error("Error crítico durante el inicio de sesión manual:", error);
         clearUserSessionData();
         handleAuthenticationError(
            dispatch,
            "Error de conexión general durante el inicio de sesión.",
         );
         return null;
      }
   };
};
