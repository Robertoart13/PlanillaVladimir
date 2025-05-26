import { LoginPage, RecoverPage } from "../pages";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPrueba } from "../pages/LoginPrueba";
import Trans from "../pages/Trans";
import ExitAnimation from "../pages/ShowButton";

export const AuthRouter = () => {
   return (
      <Routes>
         {/* // login de usuario */}
         <Route
            path="login"
            element={<LoginPage />}
         />
         <Route
            path="Text"
            element={<Trans
            text="Service Sherwin"
            delay={150}
            animateBy="words"
            direction="top"
            />}
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

         <Route
            path="ShowButton"
            element={<ExitAnimation />}
         />
      </Routes>
   );
};
