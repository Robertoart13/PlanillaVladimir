import { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { ErrorMessage } from "../../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../../components/TarjetaRow/TarjetaRow";

// Importaciones de estilos
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDataTable } from "../../../../../hooks/getDataTableConfig";

// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Vacaciones",
   subtitulo: "Tabla que muestra todos los registros de vacaciones disponibles.",
   crearVacaciones: "Crear Vacaciones",
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
      data: "fecha_inicio_vacaciones_gestor",
      title: "Fecha de Inicio",
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
      data: "dias_vacaciones_vacaciones_gestor",
      title: "Días de Vacaciones",
      searchPanes: { show: false },
      render: function(data, type, row) {
         if (type === 'display') {
            if (!data) return "0";
            const dias = parseFloat(data);
            if (isNaN(dias)) return data;
            return dias.toFixed(1);
         }
         return data;
      }
   },
   {
      data: "motivo_vacaciones_gestor",
      title: "Motivo",
      searchPanes: { show: true },
      render: function(data, type, row) {
         if (type === 'display') {
            if (!data) return "Sin motivo";
            return data.length > 50 ? data.substring(0, 50) + "..." : data;
         }
         return data;
      }
   },
   {
      data: "estado_vacaciones_gestor",
      title: "Estado",
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
   // Campos principales de la tabla gestor_vacaciones_tbl
   id_vacacion_vacaciones_gestor: datosFila.id_vacacion_vacaciones_gestor,
   empresa_id_vacaciones_gestor: datosFila.empresa_id_vacaciones_gestor,
   empleado_id_vacaciones_gestor: datosFila.empleado_id_vacaciones_gestor,
   fecha_inicio_vacaciones_gestor: datosFila.fecha_inicio_vacaciones_gestor,
   dias_vacaciones_vacaciones_gestor: datosFila.dias_vacaciones_vacaciones_gestor,
   motivo_vacaciones_gestor: datosFila.motivo_vacaciones_gestor,
   estado_vacaciones_gestor: datosFila.estado_vacaciones_gestor,
   activo_vacaciones_gestor: datosFila.activo_vacaciones_gestor,
   usuario_id_vacaciones_gestor: datosFila.usuario_id_vacaciones_gestor,
   fecha_creacion_vacaciones_gestor: datosFila.fecha_creacion_vacaciones_gestor,
   fecha_modificacion_vacaciones_gestor: datosFila.fecha_modificacion_vacaciones_gestor,
   
   // Campos adicionales para mostrar en la tabla
   nombre_empleado: datosFila.nombre_empleado,
   nombre_usuario_creador: datosFila.nombre_usuario_creador,
   nombre_empresa: datosFila.nombre_empresa,
});

/**
 * Crea la configuración de la tabla para el componente.
 * @param {Object} usuario - Usuario autenticado.
 * @returns {Object} Configuración de la tabla.
 */
const crearConfiguracionTabla = (usuario) => ({
   urlEndpoint: "gestor/vacaciones/lista", // API endpoint para obtener los datos.
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
   columnsFilter: [0, 3, 4, 5], // Índices de columnas que se pueden filtrar (Nombre del Socio, Motivo, Estado, Creado por).
   columns: obtenerColumnasTabla(), // Definición de columnas.
});

/**
 * Navega a la página de creación de una nueva vacación.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearVacaciones = (navigate) => {
   navigate("/acciones/vacaciones/crear");
};

/**
 * Componente principal que muestra la lista de vacaciones.
 * @returns {JSX.Element} Componente de lista de vacaciones.
 */
export const VacacionesLista = () => {
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
      localStorage.removeItem("vacacionParaEditar");
   }, []);

   // Manejar la selección de vacación para editar
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
      // Formatear todos los datos de la vacación usando la función formatearDatosFila
      const datosFormateados = formatearDatosFila(datosFila);

      // Almacena todos los datos formateados en el almacenamiento local
      localStorage.setItem("vacacionParaEditar", JSON.stringify(datosFormateados));

      // Verificar que se guardó correctamente
      const datosGuardados = localStorage.getItem("vacacionParaEditar");

      // Navega a la página de edición de vacación
      navigate("/acciones/vacaciones/editar");
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
    * Recarga la tabla después de agregar o actualizar una vacación.
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
                  onClick={() => navegarCrearVacaciones(navigate)}
                  className="user-detail-dialog-buttonSecondary"
               >
                  <i
                     className="ph-duotone ph-calendar"
                     style={{ paddingRight: "5px" }}
                  ></i>
                  {TEXTOS.crearVacaciones}
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
               Mostrando vacaciones en estado:{" "}
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