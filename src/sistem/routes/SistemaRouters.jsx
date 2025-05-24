import { HomePage } from "../pages/HomePage/HomePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { EmpleadosPage } from "../pages/EmpleadosPage/EmpleadosPage";
import { EmpresasPage } from "../pages/EmpresasPage/EmpresasPage";

export const SistemaRouters = () => {
   return (
      <Routes>
         {/* // home de usuario */}
         <Route
            path="/"
            element={<HomePage />}
         />

         <Route
            path="/empleados/*"
            element={<EmpleadosPage />}
         />

         <Route
            path="/empresas/*"
            element={<EmpresasPage />}
         />

         {/* // ruta por defecto */}
         <Route
            path="/*"
            element={<Navigate to="/" />}
         />
      </Routes>
   );
};
