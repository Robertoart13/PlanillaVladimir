import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
   name: "auth",
   initialState: {
      status: "checking", // 'authenticated', 'not-authenticated'
      id_user: null,
      name_user: null,
      email_user: null,
      role_user: null,
      estado_user: null,
   },
   reducers: {
      login: (state, { payload }) => {
         state.status = "authenticated";
         state.id_user = payload.id_user;
         state.name_user = payload.name_user;
         state.email_user = payload.email_user;
         state.role_user = payload.role_user;
         state.estado_user = payload.estado_user;
      },
      logout: (state, { payload }) => {
         state.status = "checking";
         state.id_user = null;
         state.name_user = null;
         state.email_user = null;
         state.role_user = null;
         state.estado_user = null;
      },
      checkingAuthentication: (state) => {
         state.status = "checking";
      },
   },
});

export const { login, logout, checkingAuthentication } = authSlice.actions;
