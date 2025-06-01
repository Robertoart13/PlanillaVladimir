import { createSlice } from "@reduxjs/toolkit";

export const permisosSlice = createSlice({
   name: "permisos",   initialState: {
      listaPermisos: [],
   },   reducers: {
      /**
       * Maneja el éxito en la carga de permisos
       * Actualiza el estado con la lista de permisos recibida
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      cargarPermisosExito: (state, action) => {
         state.listaPermisos = action.payload;
      },
      /**
       * Agrega un nuevo permiso a la lista
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      agregarPermiso: (state, action) => {
         state.listaPermisos.push(action.payload);
      },

      /**
       * Actualiza un permiso existente
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      actualizarPermiso: (state, action) => {
         state.listaPermisos = state.listaPermisos.map(permiso => 
            permiso.id === action.payload.id ? action.payload : permiso
         );
      },

      /**
       * Elimina un permiso de la lista
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      eliminarPermiso: (state, action) => {
         state.listaPermisos = state.listaPermisos.filter(
            permiso => permiso.id !== action.payload
         );
      }
   },
});

export const {
   cargarPermisosExito,
   agregarPermiso,
   actualizarPermiso,
   eliminarPermiso
} = permisosSlice.actions;
