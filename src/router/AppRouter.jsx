import { AuthRouter } from "../auth/routes/AuthRouter";
import { SistemaRouters } from "../sistem/routes/SistemaRouters";
import { Routes, Route } from "react-router-dom";

export const AppRouter = () => {
   return (
      <Routes>
         {/* // login de usuario */}
         <Route
            path="/auth/*"
            element={<AuthRouter />}
         />

         {/* // home panel de administrador */}
         <Route
            path="/*"
            element={<SistemaRouters />}
         />
      </Routes>
   );
};
