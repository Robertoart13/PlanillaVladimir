import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import "../../../styles/customstyles.css";
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Planillas de todas las empresas",
   subtitulo: "Tabla que muestra todas las planillas de todas las empresas",  
   crearEmpresa: "Crear Planilla",
   sinPermiso: "No tienes permiso para ver la lista de planillas",
   filtrarPorEstado: "Filtrar por estado",
};

const OPCIONES_ESTADO = [
   { value: "1", label: "En Proceso/Activa" },
   { value: "2", label: "Cerrada/Cancelada" },
   { value: "3", label: "Procesada" },
];

/**
 * Obtiene las columnas de la tabla con sus configuraciones.
 * @returns {Array} Arreglo de objetos de configuración de columnas.
 */
const obtenerColumnasTabla = () => [
   {
      data: "planilla_codigo",
      title: "Consecutivo",
      searchPanes: { show: true },
   },
   {
      data: "nombre_empresa",
      title: "Nombre Empresa",
      searchPanes: { show: true },
   },
   {
      data: "nombre_usuario",
      title: "Creado por",
      searchPanes: { show: true },
   },
   {
      data: "planilla_tipo",
      title: "Tipo Planilla",
      searchPanes: { show: true },
   },
   {
      data: "planilla_fecha_inicio",
      title: "Fecha Inicio",
      searchPanes: { show: true },
      render: (data) => (data ? String(data).split("T")[0] : ""),
   },
   {
      data: "planilla_fecha_fin",
      title: "Fecha Fin",
      searchPanes: { show: true },
      render: (data) => (data ? String(data).split("T")[0] : ""),
   },

   {
      data: "planilla_estado",
      title: "Estado",
      searchPanes: { show: true },
      render: (data) => {
         // Mapea cada estado a un color y texto descriptivo
         const estados = {
            "En Proceso": { color: "secondary", texto: "En Proceso" }, // Fase inicial de edición
            Activa: { color: "success", texto: "Activa" }, // Lista para carga de datos
            Cerrada: { color: "warning", texto: "Cerrada" }, // Solo revisión o validación
            Procesada: { color: "primary", texto: "Procesada" }, // Lista para pagar o archivar
            Cancelada: { color: "danger", texto: "Cancelada" }, // Descartada
         };
         const estado = estados[data] || { color: "secondary", texto: data };
         return `
            <span class="badge bg-light-${estado.color}">
               ${estado.texto}
            </span>
         `;
      },
   },
];

/**
 * Formatea los datos de una fila de la tabla.
 * @param {Object} datosFila - Datos de la fila a formatear.
 * @returns {Object} Datos formateados de la fila.
 */
const formatearDatosFila = (datosFila) => ({
   planilla_id: datosFila.planilla_id,
   planilla_codigo: datosFila.planilla_codigo,
   empresa_id: datosFila.empresa_id,
   planilla_tipo: datosFila.planilla_tipo,
   planilla_descripcion: datosFila.planilla_descripcion,
   planilla_estado: datosFila.planilla_estado,
   planilla_fecha_inicio: datosFila.planilla_fecha_inicio,
   planilla_fecha_fin: datosFila.planilla_fecha_fin,
   planilla_fecha_creacion: datosFila.planilla_fecha_creacion,
   planilla_creado_por: datosFila.planilla_creado_por,
});

/**
 * Crea la configuración de la tabla para el componente.
 * @param {Object} usuario - Usuario autenticado.
 * @returns {Object} Configuración de la tabla.
 */
const crearConfiguracionTabla = (usuario) => ({
   urlEndpoint: "planilla", // API endpoint para obtener los datos.
   requestType: "POST", // Método HTTP para la solicitud.
   transaccion: {
      user: {
         id: parseInt(usuario?.id_usuario) || 0,
         rol: parseInt(usuario?.id_rol) || 0,
      },
      data: {
         estados: 1,
      },
      acceso: {
         type: 0,
         permiso: 0,
         details: TEXTOS.sinPermiso,
      },
   },
   columnsLayout: "columns-2", // Diseño de columnas en la tabla.
   columnsFilter: [0, 1, 2, 3, 6], // Índices de columnas que se pueden filtrar.
   columns: obtenerColumnasTabla(), // Definición de columnas.
});

/**
 * Maneja el clic en una fila de la tabla.
 * @param {Object} datosFila - Datos de la fila seleccionada.
 */
const manejarClicFila = (datosFila, navigate) => {
   localStorage.setItem("selectedPlanilla", JSON.stringify(datosFila));
   navigate("/planilla/editar");
};

/**
 * Navega a la página de creación de una nueva empresa.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearEmpresa = (navigate) => {
   navigate("/planilla/crear");
};

/**
 * Componente principal que muestra la lista de planilla.
 * @returns {JSX.Element} Componente de lista de planilla.
 */
export const PlanillaLista = () => {
   // Obtener el usuario autenticado desde Redux.
   const { user } = useSelector((state) => state.auth);

   const navigate = useNavigate();

   const tableRef = useRef(null);
   const tableInstanceRef = useRef(null);

   // Estados para manejar errores y mensajes.
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");

   // Estado para manejar la selección de un artículo.
   const [selected, setSelected] = useState(null);

   // Estado para controlar la apertura del diálogo de creación de artículos.
   const [openCreate, setOpenCreate] = useState(false);

   // Estado para controlar la apertura del diálogo de edición
   const [openEdit, setOpenEdit] = useState(false);

   // Estado para manejar la selección del estado
   const [estadoSeleccionado, setEstadoSeleccionado] = useState("1");

   // Configuración de la tabla usando useMemo para optimizar el rendimiento.
   const configuracionTabla = useMemo(
      () => ({
         ...crearConfiguracionTabla(user),
         transaccion: {
            ...crearConfiguracionTabla(user).transaccion,
            data: {
               estados: estadoSeleccionado,
            },
         },
      }),
      [user?.id_usuario, estadoSeleccionado]
   );

   // Inicializa la tabla con los parámetros configurados.
   useDataTable(
      tableRef,
      tableInstanceRef,
      setSelected,
      setOpenEdit,
      setError,
      setMessage,
      user,
      configuracionTabla.urlEndpoint,
      configuracionTabla.requestType,
      configuracionTabla.transaccion,
      configuracionTabla.columnsLayout,
      configuracionTabla.columnsFilter,
      configuracionTabla.columns,
      formatearDatosFila,
   );

   /**
    * Recarga la tabla después de agregar o actualizar una cuenta.
    */
   const recargarTabla = () => {
      if (tableInstanceRef.current) {
         tableInstanceRef.current.ajax.reload();
      }
   };

   return (
      <>
         <TarjetaRow
            texto={TEXTOS.titulo}
            subtitulo={TEXTOS.subtitulo}
         >
            {/* Muestra mensajes de error cuando ocurren */}
            {error && (
               <ErrorMessage
                  error={error}
                  message={message}
               />
            )}

            {/* Botones para crear */}
            <Stack
               direction="row"
               spacing={2}
               sx={{
                  mb: 2,
                  width: "15%",
               }}
            >
               <Button
                  variant="contained"
                  onClick={() => navegarCrearEmpresa(navigate)}
                  className="user-detail-dialog-buttonSecondary"
               >
                  <i
                     className="ph-duotone ph-certificate"
                     style={{ paddingRight: "5px" }}
                  ></i>
                  {TEXTOS.crearEmpresa}
               </Button>
           
            </Stack>
            <FormControl sx={{ minWidth: 200, marginRight: 2, marginBottom: 2 }}>
                  <InputLabel>{TEXTOS.filtrarPorEstado}</InputLabel>
                  <Select
                     value={estadoSeleccionado}
                     onChange={(e) => setEstadoSeleccionado(e.target.value)}
                     label={TEXTOS.filtrarPorEstado}
                     sx={{ height: 40 }}
                  >
                     {OPCIONES_ESTADO.map((opcion) => (
                        <MenuItem key={opcion.value} value={opcion.value}>
                           {opcion.label}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>

               <Alert severity="info" sx={{ mb: 2 }}>
                  Mostrando planillas en estado: {OPCIONES_ESTADO.find(op => op.value === estadoSeleccionado)?.label || "Todos"}
               </Alert>

            {/* Contenedor de la tabla */}
            <div className="table-responsive">
               <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                  <div className="datatable-container">
                     <table
                        ref={tableRef}
                        className="table table-hover datatable-table"
                     >
                        <thead></thead>
                        <tbody></tbody>
                     </table>
                  </div>
               </div>
            </div>
         </TarjetaRow>

         {selected && manejarClicFila(selected, navigate)}
      </>
   );
};
