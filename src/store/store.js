import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";

// store redux 
export const store = configureStore({
   reducer: {
      auth: authSlice.reducer,
   },
});
