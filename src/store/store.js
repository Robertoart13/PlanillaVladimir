import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { permisosSlice } from "./Permisos/PermisoSlice";

// store redux 
export const store = configureStore({
   reducer: {
      auth: authSlice.reducer,
      // Aquí puedes agregar otros slices de Redux
      permisos: permisosSlice.reducer,
   },
});
