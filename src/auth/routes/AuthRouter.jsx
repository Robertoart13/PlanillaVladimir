import { LoginPage, RecoverPage } from "../pages";
import { Routes, Route, Navigate } from "react-router-dom";

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
         {/* // ruta por defecto */}
         <Route
            path="/*"
            element={<Navigate to="/auth/login" />}
         />
      </Routes>
   );
};
