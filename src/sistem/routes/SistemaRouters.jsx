import { HomePage } from "../pages/HomePage/HomePage";
import { Routes, Route, Navigate } from "react-router-dom";

export const SistemaRouters = () => {
   return (
      <Routes>
         {/* // home de usuario */}
         <Route
            path="/"
            element={<HomePage />}
         />

         {/* // ruta por defecto */}
         <Route
            path="/*"
            element={<Navigate to="/" />}
         />
      </Routes>
   );
};
