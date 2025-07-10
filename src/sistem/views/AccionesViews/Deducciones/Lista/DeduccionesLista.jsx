import { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ErrorMessage } from "../../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../../components/TarjetaRow/TarjetaRow";

// Importaciones de estilos
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDataTable } from "../../../../../hooks/getDataTableConfig";
import { getMonedaSymbol } from "../../../../../hooks/formatCurrency";



// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Rebajos a Compensación",
   subtitulo: "Tabla que muestra todos los rebajos a compensación registrados.",
   crearDeduccion: "Crear Rebajo a Compensación",
   filtrarPorEstado: "Filtrar por Estado",
   sinPermiso: "Sin permisos para acceder a esta funcionalidad",
};

const OPCIONES_ESTADO = [
   { value: "Todos", label: "Todos los Estados" },
   { value: "Pendiente", label: "Pendiente" },
   { value: "Aprobado", label: "Aprobado" },
   { value: "Aplicado", label: "Aplicado" },
   { value: "Cancelado", label: "Cancelado" },
];

/**
 * Obtiene las columnas de la tabla con sus configuraciones.
 * @returns {Array} Arreglo de objetos de configuración de columnas.
 */
const obtenerColumnasTabla = () => [
   {
      data: "nombre_empleado",
      title: "Nombre del Socio",
      searchPanes: { show: true },
   },
   {
      data: "codigo_planilla",
      title: "Código de Planilla",
      searchPanes: { show: true },
   },
   {
      data: "tipo_rebajo",
      title: "Tipo de Rebajo",
      searchPanes: { show: true },
   },
   {
      data: "monto_rebajo_calculado",
      title: "Monto del Rebajo",
      searchPanes: { show: false },
      render: function(data, type, row) {
         if (type === 'display') {
            const simbolo = getMonedaSymbol(row.planilla_moneda || 'colones');
            return `<span style="color: red; font-weight: bold;">${simbolo}${parseFloat(data).toLocaleString('es-CR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>`;
         }
         return data;
      }
   },
   {
      data: "fecha_rebajo",
      title: "Fecha del Rebajo",
      searchPanes: { show: false },
      render: function(data, type, row) {
         if (type === 'display' && data) {
            const fecha = new Date(data);
            return fecha.toLocaleDateString('es-CR');
         }
         return data;
      }
   },
   {
      data: "aplica_compensacion_anual",
      title: "¿Aplica Comp. Anual?",
      searchPanes: { show: true },
      render: function(data, type, row) {
         if (type === 'display') {
            return data ? '<span style="color: green; font-weight: bold;">Sí</span>' : '<span style="color: red; font-weight: bold;">No</span>';
         }
         return data;
      }
   },
   {
      data: "estado_rebajo",
      title: "Estado Rebajo",
      searchPanes: { show: true },
      render: function(data, type, row) {
         if (type === 'display') {
            const colores = {
               'Pendiente': 'orange',
               'Aprobado': 'blue',
               'Aplicado': 'green',
               'Cancelado': 'red'
            };
            const color = colores[data] || 'gray';
            return `<span style="color: ${color}; font-weight: bold;">${data}</span>`;
         }
         return data;
      }
   },
   {
      data: "nombre_usuario_creador",
      title: "Creado por",
      searchPanes: { show: true },
   },
];

/**
 * Formatea los datos de una fila de la tabla.
 * @param {Object} datosFila - Datos de la fila a formatear.
 * @returns {Object} Datos formateados de la fila.
 */
const formatearDatosFila = (datosFila) => ({
   // Campos principales de la tabla gestor_rebajo_compensacion_tbl
   id_rebajo_compensacion: datosFila.id_rebajo_compensacion,
   empresa_id_rebajo: datosFila.empresa_id_rebajo,
   planilla_id_rebajo: datosFila.planilla_id_rebajo,
   empleado_id_rebajo: datosFila.empleado_id_rebajo,
   tipo_rebajo: datosFila.tipo_rebajo,
   tipo_jornada_laboral: datosFila.tipo_jornada_laboral,
   horas_rebajadas: datosFila.horas_rebajadas,
   dias_rebajados: datosFila.dias_rebajados,
   monto_fijo_rebajo: datosFila.monto_fijo_rebajo,
   salario_actual: datosFila.salario_actual,
   monto_rebajo_calculado: datosFila.monto_rebajo_calculado,
   motivo_rebajo: datosFila.motivo_rebajo,
   fecha_rebajo: datosFila.fecha_rebajo,
   aplica_compensacion_anual: datosFila.aplica_compensacion_anual,
   estado_rebajo: datosFila.estado_rebajo,
   usuario_id_rebajo: datosFila.usuario_id_rebajo,
   fecha_creacion: datosFila.fecha_creacion,
   fecha_modificacion: datosFila.fecha_modificacion,
   
   // Campos adicionales para mostrar en la tabla
   nombre_empleado: datosFila.nombre_empleado,
   codigo_planilla: datosFila.codigo_planilla,
   nombre_usuario_creador: datosFila.nombre_usuario_creador,
   nombre_empresa: datosFila.nombre_empresa,
});

/**
 * Crea la configuración de la tabla para el componente.
 * @param {Object} usuario - Usuario autenticado.
 * @returns {Object} Configuración de la tabla.
 */
const crearConfiguracionTabla = (usuario) => ({
   urlEndpoint: "gestor/planilla/deducciones/lista", // API endpoint para obtener los datos.
   requestType: "POST", // Método HTTP para la solicitud.
   transaccion: {
      user: {
         id: parseInt(usuario?.id_usuario) || 0,
         rol: parseInt(usuario?.id_rol) || 0,
         id_empresa: parseInt(usuario?.id_empresa) || 0,
      },
      data: {
         empresaAplica: true,
         estados: OPCIONES_ESTADO,
      },
      acceso: {
         type: 0,
         permiso: 0,
         details: TEXTOS.sinPermiso,
      },
   },
   columnsLayout: "columns-2", // Diseño de columnas en la tabla.
   columnsFilter: [0,1,2,6,7], // Índices de columnas que se pueden filtrar (Nombre del Socio, Código de Planilla, Tipo de Rebajo, Estado Rebajo, Creado por).
   columns: obtenerColumnasTabla(), // Definición de columnas.
});

/**
 * Navega a la página de creación de un nuevo rebajo a compensación.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearDeduccion = (navigate) => {
   navigate("/acciones/rebajo-compensacion/crear");
};

/**
 * Componente principal que muestra la lista de rebajos a compensación.
 * @returns {JSX.Element} Componente de lista de rebajos a compensación.
 */
export const DeduccionesLista = () => {
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
   const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todos");

   // Limpiar localStorage al cargar el componente
   useEffect(() => {
      localStorage.removeItem("selectedDeduccion");
   }, []);

   // Manejar la selección de deducción para editar
   useEffect(() => {
      if (selected) {
         manejarClicFila(selected);
         // Limpiar la selección después de navegar
         setSelected(null);
      }
   }, [selected]);

   /**
    * Maneja el clic en una fila de la tabla.
    * @param {Object} datosFila - Datos de la fila seleccionada.
    */
   const manejarClicFila = (datosFila) => {
      // Formatear todos los datos de la deducción usando la función formatearDatosFila
      const datosFormateados = formatearDatosFila(datosFila);

      // Almacena todos los datos formateados en el almacenamiento local
      localStorage.setItem("selectedDeduccion", JSON.stringify(datosFormateados));

      // Verificar que se guardó correctamente
      const datosGuardados = localStorage.getItem("selectedDeduccion");

      // Navega a la página de edición de deducción
      navigate("/acciones/rebajo-compensacion/editar");
   };

   // Configuración de la tabla usando useMemo para optimizar el rendimiento.
   const configuracionTabla = useMemo(
      () => ({
         ...crearConfiguracionTabla(user),
         transaccion: {
            ...crearConfiguracionTabla(user).transaccion,
            data: {
               empresaAplica: true,
               estados: estadoSeleccionado === "Todos" ? undefined : estadoSeleccionado,
            },
         },
      }),
      [user?.id_usuario, estadoSeleccionado],
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
    * Recarga la tabla después de agregar o actualizar una deducción.
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
                  onClick={() => navegarCrearDeduccion(navigate)}
                  className="user-detail-dialog-buttonSecondary"
               >
                  <i
                     className="ph-duotone ph-minus-circle"
                     style={{ paddingRight: "0px" }}
                  ></i>
                  {TEXTOS.crearDeduccion}
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
                     <MenuItem
                        key={opcion.value}
                        value={opcion.value}
                     >
                        {opcion.label}
                     </MenuItem>
                  ))}
               </Select>
            </FormControl>

            <Alert
               severity="info"
               sx={{ mb: 2 }}
            >
               Mostrando rebajos a compensación en estado:{" "}
               {OPCIONES_ESTADO.find((op) => op.value === estadoSeleccionado)?.label || "Todos"}
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
      </>
   );
}; 