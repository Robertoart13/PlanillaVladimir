import { createSlice } from "@reduxjs/toolkit";

export const permisosSlice = createSlice({
   name: "permisos",
   initialState: {
      listaPermisos: [],
      loading: true,
      error: null,
   },
   reducers: {
      cargandoPermisos: (state) => {
         state.loading = true;
         state.error = null;
      },
      /**
       * Maneja el éxito en la carga de permisos
       * Actualiza el estado con la lista de permisos recibida
       * @param {Object} state - Estado actual de Redux
       * @param {Object} action - Acción de Redux con payload
       */
      cargarPermisosExito: (state, action) => {
         state.listaPermisos = action.payload;
         state.loading = false;
         state.error = null;
      },
      cargarPermisosError: (state, action) => {
         state.loading = false;
         state.error = action.payload;
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
   cargandoPermisos,
   cargarPermisosExito,
   cargarPermisosError,
   agregarPermiso,
   actualizarPermiso,
   eliminarPermiso
} = permisosSlice.actions;
