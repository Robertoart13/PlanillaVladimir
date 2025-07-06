import { apiUrlImg, commonRequestData, getAuthToken } from "../api/Api";
import { useCallback, useEffect } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-bs5";
import "datatables.net-searchpanes-bs5";
import "datatables.net-select-bs5";
import { verificarErroresRespuesta } from "./verificarErroresRespuesta";
import { crearRespuestaError } from "./crearRespuestaError";

/**
 * Genera configuración para DataTables con opciones personalizadas
 *
 * @param {Object} Parámetros requeridos
 * @param {Function} setError - Función para establecer estado de error
 * @param {Function} setMessage - Función para establecer mensaje de error
 * @param {Object} user - Información del usuario actual
 * @param {string} urlEndpoint - Ruta del endpoint (ej: 'usuarios/obtenerTodosLosUsuarios')
 * @param {string} requestType - Método HTTP ('GET', 'POST', etc.)
 * @param {Object} transaccion - Datos específicos para el endpoint
 * @param {string} columnsLayout - Layout para searchPanes (ej: 'columns-2')
 * @param {Array<number>} columnsFilter - Índices de columnas filtrables [0,1,2,3]
 * @param {Array<Object>} columns - Definición de columnas para la tabla
 *
 * @returns {Object} Configuración completa para DataTables
 *
 * @example
 * // Inicialización básica:
 * const config = getDataTableConfig(
 *   setError,
 *   setMessage,
 *   user,
 *   'usuarios/listar',
 *   'POST',
 *   { user: { id: user.id_usuario } },
 *   'columns-2',
 *   [0, 1, 2, 3],
 *   columnDefinitions
 * );
 * $(tableRef.current).DataTable(config);
 */
export const getDataTableConfig = (setError, setMessage, user, urlEndpoint, requestType, transaccion, columnsLayout, columnsFilter, columns) => {
   // Determina si es dispositivo móvil
   const isMobile = window.innerWidth <= 768;

   return {
      // Configuración de la petición AJAX
      ajax: {
         url: `${apiUrlImg}${urlEndpoint}`,
         type: requestType,
         data: function (d) {
            return {
               ...commonRequestData,
               start: d.start,
               length: d.length,
               search: d.searchPanes || undefined,
               transaccion,
            };
         },
         dataSrc: (response) => {
            // Verificar si la respuesta fue exitosa
            if (!response || !response.success) {
               // Permiso denegado
               if (response.respuesta?.status === 403) {
                  setError(true);
                  setMessage(response.respuesta.error?.details || "Permiso denegado");
                  return [];
               }

               // Manejo de diferentes códigos de estado HTTP
               if (response?.status === 500) {
                  setError(true);
                  setMessage(response.error?.details || "Error interno del servidor");
                  return [];
               }

               // Recurso no encontrado
               if (response.respuesta?.status === 404) {
                  setError(true);
                  setMessage(response.respuesta.error?.details || "Recurso no encontrado");
                  return [];
               }

               // Para cualquier otro tipo de error, usar el patrón del primer fragmento
               setError(true);
               setMessage("Error desconocido, favor de contactar al administrador del sistema");
               return [];
            }

            // Respuesta exitosa
            setError(false);
            setMessage("");

            // Asegurar que siempre devolvemos un array
            return Array.isArray(response.array) ? response.array : [];
         },
         beforeSend: function (xhr) {
            const token = getAuthToken();
            if (token) {
               xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }
         },
      },

      // Definición de columnas
      columns: columns,

      // Configuración de paneles de búsqueda
      searchPanes: {
         layout: isMobile ? "columns-1" : columnsLayout,
         initCollapsed: true,
         cascadePanes: true,
         dtOpts: {
            select: { style: "multi" },
            info: false,
            searching: true,
         },
         viewTotal: true,
         columns: columnsFilter,
      },

      // Opciones generales
      processing: true,
      dom: "lPBfrtip",

      // Textos en español
      language: {
         searchPanes: {
            title: "Filtros",
            collapse: "Filtros",
            clearMessage: "Limpiar Todo",
            emptyPanes: "No hay datos para filtrar",
            count: "{total}",
            countFiltered: "{shown} ({total})",
            loadMessage: "Cargando paneles de búsqueda...",
         },
      },

      // Persistencia del estado
      stateSave: true,
      stateDuration: -1,
      stateSaveCallback: function (settings, data) {
         localStorage.setItem("DataTables_state", JSON.stringify(data));
      },
      stateLoadCallback: function () {
         return JSON.parse(localStorage.getItem("DataTables_state")) || null;
      },

      // Configuración de selección
      select: {
         style: "single",
         className: "selected-row",
      },
   };
};

/**
 * Inicializa y configura la tabla DataTables
 * @param {Object} tableRef - Referencia al elemento DOM de la tabla
 * @param {Object} tableInstanceRef - Referencia a la instancia de DataTables
 * @param {Function} setSelectedUser - Función para establecer el usuario seleccionado
 * @param {Function} setOpenDialog - Función para abrir/cerrar el diálogo
 * @param {Function} setError - Función para establecer el estado de error
 * @param {Function} setMessage - Función para establecer el mensaje de error
 * @param {Object} user - Información del usuario actual
 * @param {string} urlEndpoint - Ruta del endpoint (ej: 'usuarios/obtenerTodosLosUsuarios')
 * @param {string} requestType - Método HTTP ('GET', 'POST', etc.)
 * @param {Object} transaccion - Datos específicos para el endpoint
 * @param {string} columnsLayout - Layout para searchPanes (ej: 'columns-2')
 * @param {Array<number>} columnsFilter - Índices de columnas filtrables [0,1,2,3]
 * @param {Array<Object>} columns - Definición de columnas para la tabla
 */
export const useDataTable = (
   tableRef,
   tableInstanceRef,
   setSelectedUser,
   setOpenDialog,
   setError,
   setMessage,
   user,
   urlEndpoint,
   requestType,
   transaccion,
   columnsLayout,
   columnsFilter,
   columns,
   formatUserData,
) => {
   /**
    * Configura el evento de selección de fila
    * @param {Object} tableInstance - Instancia de DataTables
    */
   const setupRowSelectionEvent = useCallback(
      (tableInstance) => {
         tableInstance.on("select", function (e, dt, type, indexes) {
            if (type === "row") {
               const rowData = tableInstance.row(indexes).data();
               setSelectedUser(formatUserData(rowData));
               setOpenDialog(true);
            }
         });
      },
      [setSelectedUser, setOpenDialog],
   );

   /**
    * Inicializa la tabla DataTables
    */
   const initializeTable = useCallback(() => {
      if (!tableRef.current || !tableRef.current.querySelector("thead")) {
         return;
      }

      if ($.fn.DataTable.isDataTable(tableRef.current)) {
         const existingTable = $(tableRef.current).DataTable();
         existingTable.off("select");
         existingTable.destroy();
         tableInstanceRef.current = null;
      }

      tableInstanceRef.current = $(tableRef.current).DataTable({
         ...getDataTableConfig(setError, setMessage, user, urlEndpoint, requestType, transaccion, columnsLayout, columnsFilter, columns),
         ajax: {
            url: `${apiUrlImg}${urlEndpoint}`,
            type: requestType,
            data: function (d) {
               return {
                  ...commonRequestData,
                  start: d.start,
                  length: d.length,
                  search: d.searchPanes || undefined,
                  transaccion,
               };
            },
            dataSrc: getDataTableConfig(setError, setMessage, user, urlEndpoint, requestType, transaccion, columnsLayout, columnsFilter, columns).ajax.dataSrc,
            beforeSend: getDataTableConfig(setError, setMessage, user, urlEndpoint, requestType, transaccion, columnsLayout, columnsFilter, columns).ajax.beforeSend,
            error: function (xhr, error, thrown) {
               setError(true);
               setMessage(xhr.responseJSON?.respuesta?.error?.details || "Error desconocido");
            },
         },
      });

      setupRowSelectionEvent(tableInstanceRef.current);
   }, [tableRef, tableInstanceRef, setError, setMessage, user, setupRowSelectionEvent, transaccion]);

   useEffect(() => {
      // Inicializar la tabla solo una vez al montar el componente
      initializeTable();

      // Limpiar al desmontar
      return () => {
         if ($.fn.DataTable.isDataTable(tableRef.current)) {
            const table = $(tableRef.current).DataTable();
            table.off("select");
            table.destroy();
            tableInstanceRef.current = null;
         }
      };
   }, [tableRef, initializeTable]);
};
