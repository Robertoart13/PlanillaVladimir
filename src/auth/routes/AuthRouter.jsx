import { LoginPage, RecoverPage } from "../pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPrueba } from "../pages/LoginPrueba";

export const AuthRouter = () => {
   return (
      <Routes>
         {/* // login de usuario */}
         <Route
            path="login"
            element={<LoginPage />}
         />
         {/* // recuperar contraseña de usuario */}
         <Route
            path="recover"
            element={<RecoverPage />}
         />
         
         <Route
            path="ejemplo"
            element={<LoginPrueba />}
         />
         {/* // ruta por defecto */}
         <Route
            path="/*"
            element={<Navigate to="/auth/login" />}
         />
      </Routes>
   );
};
