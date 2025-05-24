import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
   name: "auth",
   initialState: {
      authUsuario: "NoAutenticado", // "NoAutenticado", "Autenticado", "Error", "EnProceso", "enproceso","Procesado"
      mensaje: "",
      user: {
         name: null,
         email: null,
         phone: null,
         company: null,
         jobTitle: null,
         profilePicture: null,
      },
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenExpiresIn: null,
      lastTokenRefresh: null,

   },
   reducers: {
       /**
       * Inicia el proceso de autenticación
       * Este reducer marca el estado como cargando e inicializa los valores de error.
       * @param {Object} state - Estado actual de Redux
       */
       loginStart: (state) => {
         state.isLoading = true;
         state.error = null;
      },

      /**
       * Maneja el éxito en la autenticación
       * Actualiza el estado de autenticación con la información del usuario y tokens.
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      loginSuccess: (state, action) => {
         state.authUsuario = "Autenticado";  // Indica que el usuario está autenticado
         state.mensaje = "";  // Limpia cualquier mensaje anterior
         state.isLoading = false;
         state.isAuthenticated = true; // Marca al usuario como autenticado
         state.token = action.payload.token; // Almacena el token
         state.user = {
            ...action.payload.user,
         };

         // Verifica que la carga de datos sea válida
         if (action.payload.user && action.payload.token) {
            // Aquí podrían guardarse los datos en una localStorage si fuera necesario
         } else {
            console.error("loginSuccess: Missing payload data");
         }
      },


      /**
       * Maneja el fallo en la autenticación
       * Actualiza el estado de error con el mensaje recibido.
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      loginFailure: (state, action) => {
         state.isLoading = false;
         state.error = action.payload; // Almacena el mensaje de error
      },
      /**
       * Realiza el logout del usuario, reseteando el estado
       * Elimina todos los datos relacionados con el usuario y su sesión.
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload (por ejemplo, un mensaje)
       */
      logout: (state, action) => {
         state.isAuthenticated = false; // Marca al usuario como no autenticado
         state.token = null; // Elimina el token
         state.tokenExpiresIn = null;
         state.lastTokenRefresh = null;
         state.authUsuario = "Error";  // Estado de autenticación a error
         state.mensaje = action.payload.mensaje;  // Mensaje relacionado con el logout

         
      },
      /**
       * Actualiza los tokens de autenticación
       * Este reducer se encarga de actualizar tanto el token de acceso como el refresh token.
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      refreshToken: (state, action) => {
         state.token = action.payload.token || action.payload.accessToken; // Actualiza el token de acceso
         state.o365Data.accessToken = action.payload.accessToken; // Actualiza el access token de O365
         state.o365Data.expiresIn = action.payload.expiresIn; // Actualiza el tiempo de expiración del token
         state.lastTokenRefresh = new Date().toISOString(); // Marca la hora de la última actualización de token

         if (action.payload.tokenExpiresIn) {
            state.tokenExpiresIn = action.payload.tokenExpiresIn; // Actualiza la expiración del token si se recibe
         }
      },
      verificacionUsuario: (state, action) => {
         return {
            ...state,  // Propaga el estado actual
            authUsuario: action.payload.authUsuario,  // Actualiza el valor de authUsuario
            mensaje: action.payload.Mensaje,  // Actualiza el valor de mensaje
         };
      }
   },
});

export const {loginSuccess, login, logout, checkingAuthentication, verificacionUsuario, refreshToken , loginStart, loginFailure } = authSlice.actions;
