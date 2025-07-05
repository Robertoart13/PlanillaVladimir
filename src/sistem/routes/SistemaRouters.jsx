import { EmpleadosPage } from "../pages/EmpleadosPage/EmpleadosPage";
import { HomePage } from "../pages/HomePage/HomePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { PlanillaPage } from "../pages/PlanillaPage/PlanillaPage";
import { AccionesPage } from "../pages/AccionesPage/AccionesPage";

export const SistemaRouters = () => {
   return (
      <Routes>
         {/* // home de usuario */}
         <Route
            path="/"
            element={<HomePage />}
         />

         {/* Ruta para gestión de empleados */}
         <Route
            path="/empleados/*"
            element={<EmpleadosPage />}
         />

         {/* Ruta para el Planilla */}  
         <Route
            path="/planilla/*"
            element={<PlanillaPage />}
         />

         {/* Ruta para el Acciones */}  
         <Route
            path="/acciones/*"
            element={<AccionesPage />}
         />

         {/* // ruta por defecto */}
         <Route
            path="/*"
            element={<Navigate to="/" />}
         />
      </Routes>
   );
};
