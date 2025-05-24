import { AuthRouter } from "../auth/routes/AuthRouter";
import { SistemaRouters } from "../sistem/routes/SistemaRouters";
import { Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/auth/authSlice";

import CircularProgress from "@mui/material/CircularProgress";

// Decodifica un JWT y retorna su payload
const decodeJwt = (token) => {
   if (typeof token !== "string" || token.split(".").length !== 3) {
      console.error("Token inválido: El token no tiene la estructura correcta.");
      return null;
   }

   try {
      const payloadBase64Url = token.split(".")[1];
      const base64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedPayload = atob(base64);
      return JSON.parse(decodedPayload);
   } catch (error) {
      console.error("Error decodificando el JWT:", error);
      return null;
   }
};

// Verifica si el token de acceso actual es válido
const isAccessTokenValid = () => {
   const accessToken = Cookies.get("access_token");
   if (!accessToken) return false;

   const jwt = decodeJwt(accessToken);
   if (!jwt) return false;

   const isExpired = jwt.exp * 1000 <= Date.now();
   if (isExpired) return false;

   return true;
};

// Hook personalizado para manejar el temporizador de expiración del token
function useTokenExpirationTimer(accessToken, setCountdown) {
   const dispatch = useDispatch();

   useEffect(() => {
      if (!accessToken) return;

      const jwt = decodeJwt(accessToken);
      if (!jwt) return;

      const expirationTime = jwt.exp * 1000;
      const bufferTime = 5000;

      const interval = setInterval(() => {
         const updatedTimeLeft = expirationTime - Date.now();
         const updatedMinutesLeft = Math.floor(updatedTimeLeft / 60000);
         const updatedSecondsLeft = Math.floor((updatedTimeLeft % 60000) / 1000);

         if (updatedTimeLeft <= -bufferTime) {
            dispatch(
               logout({
                  mensaje: `Lo sentimos, su sesión ha expirado, por favor inicie sesión nuevamente`,
               }),
            );
            clearInterval(interval);
            Cookies.remove("access_token");
            return;
         }

         setCountdown(`${updatedMinutesLeft} minutos y ${updatedSecondsLeft} segundos`);
      }, 1000);

      return () => clearInterval(interval);
   }, [accessToken, setCountdown, dispatch]);
}

// Hook personalizado para monitorear cambios en el token de acceso
const useTokenMonitor = (accessToken, setAccessToken) => {
   useEffect(() => {
      const interval = setInterval(() => {
         const newToken = Cookies.get("access_token");
         if (newToken !== accessToken) {
            setAccessToken(newToken);
         }
      }, 100);

      return () => clearInterval(interval);
   }, [accessToken, setAccessToken]);
};

export const AppRouter = () => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [accessToken, setAccessToken] = useState(Cookies.get("access_token"));
   const [countdown, setCountdown] = useState(null);
   const [isLoading, setIsLoading] = useState(true);

   const dispatch = useDispatch();

   useEffect(() => {
      const validateToken = async () => {
         try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const tokenValid = isAccessTokenValid();
            setIsAuthenticated(tokenValid);

            if (tokenValid && accessToken) {
               const jwt = decodeJwt(accessToken);
               if (!jwt) throw new Error("Error al decodificar el token");
               const construccionUsuario = {
                  token: accessToken,
                  user: {
                     name: jwt.nombre_usuario,
                     email: jwt.email_usuario,
                     id_usuario: jwt.id_usuario,
                     id_rol: jwt.rol_usuario,
                  },
               };

               dispatch(loginSuccess(construccionUsuario));
            }
         } catch (error) {
            console.error("Error en la validación del token:", error);
            dispatch(
               logout({ mensaje: `Error en la autenticación, por favor inicie sesión nuevamente` }),
            );
            Cookies.remove("access_token");
         } finally {
            setIsLoading(false);
         }
      };

      validateToken();
   }, [accessToken, dispatch]);

   useTokenExpirationTimer(accessToken, setCountdown);
   useTokenMonitor(accessToken, setAccessToken);

   if (isLoading) {
      return (
         <div
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               height: "100vh",
            }}
         >
            <CircularProgress />
         </div>
      );
   }

   return (
      <Routes>
         {isAuthenticated ? renderMainRoutes() : renderAuthRoutes()}
         <Route
            path="/*"
            element={<Navigate to="/auth/login" />}
         />
      </Routes>
   );
};

const renderAuthRoutes = () => {
   return (
      <Route
         path="/auth/*"
         element={<AuthRouter />}
      />
   );
};

const renderMainRoutes = () => {
   return (
      <Route
         path="/*"
         element={<SistemaRouters />}
      />
   );
};
