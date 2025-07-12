import { HomePage } from "../pages/HomePage/HomePage";
import { Routes, Route, Navigate } from "react-router-dom";




import { EmpresasPage } from "../pages/EmpresasPage/EmpresasPage";
import { ClientesPage } from "../pages/ClientesPage/ClientePage";
import { CalendarioPage } from "../pages/CalendarioPage/CalendarioPage";
import { PlanillaPage } from "../pages/NturalEmpresa/PlanillaPage/PlanillaPage";
import { EmpleadosPage } from "../pages/NturalEmpresa/EmpleadosPage/EmpleadosPage";
import { PlanillaGestorPage } from "../pages/GestorPlanilla/PlanillaGestorPage";


// Componente principal de rutas del sistema
export const SistemaRouters = () => {
   return (
      <Routes>
         {/* Ruta principal: Página de inicio */}
         <Route
            path="/"
            element={<HomePage />}
         />

         {/* Ruta para gestión de empleados */}
         <Route
            path="/empleados/*"
            element={<EmpleadosPage />}
         />

         {/* Ruta para gestión de empresas */}
         <Route
            path="/empresas/*"
            element={<EmpresasPage />}
         />

         {/* Ruta para gestión de clientes */}
         <Route
            path="/clientes/*"
            element={<ClientesPage />}
         />

         {/* Ruta para el calendario */}
         <Route
            path="/calendario/*"
            element={<CalendarioPage />}
         />

         {/* Ruta para el Planilla */}  
         <Route
            path="/planilla/*"
            element={<PlanillaPage />}
         />

         {/* Ruta por defecto: redirige a la página de inicio si la ruta no existe */}
         <Route
            path="/*"
            element={<Navigate to="/" />}
         />
         {/* Ruta para el Gestor de Planillas */}
         <Route
            path="/gestor/planillas-aplicadas"
            element={<PlanillaGestorPage />}
         />
      </Routes>
   );
};
