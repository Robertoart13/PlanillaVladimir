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
   titulo: "Listado de Compensaciones Extras",
   subtitulo: "Tabla que muestra todos los Compensaciones Extras disponibles.",
   crearEmpresa: "Crear Compensacion Extra",
   filtrarPorEstado: "Filtrar por Estado",
   sinPermiso: "Sin permisos para acceder a esta funcionalidad",
};

const OPCIONES_ESTADO = [
   { value: "Pendiente", label: "Pendiente" },
   { value: "Aplicada", label: "Aplicada" },
   { value: "Procesada", label: "Procesada" },
   { value: "Cancelada", label: "Cancelada" },
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
         data: "tipo_compensacion_extra_gestor",
         title: "Tipo de Compensación",
         searchPanes: { show: true },
      },
      {
         data: "cantidad_horas_gestor",
         title: "Horas",
         searchPanes: { show: true },
      },
      {
         data: "monto_compensacion_calculado_gestor",
         title: "Monto Calculado",
         searchPanes: { show: true },
         render: function(data, type, row) {
            if (type === 'display') {
               return new Intl.NumberFormat('es-CR', {
                  style: 'currency',
                  currency: 'CRC'
               }).format(data);
            }
            return data;
         }
      },
      {
         data: "fecha_compensacion_gestor",
         title: "Fecha",
         searchPanes: { show: true },
         render: function(data, type, row) {
            if (type === 'display' && data) {
               return new Date(data).toLocaleDateString('es-CR');
            }
            return data;
         }
      },
      {
         data: "nombre_usuario_creador",
         title: "Creador",
         searchPanes: { show: true },
      },
      {
         data: "nombre_empresa",
         title: "Empresa",
         searchPanes: { show: true },
      },
      {
         data: "aplica_en_compensacion_anual_gestor",
         title: "Compensación Anual",
         searchPanes: { show: true },
         render: function(data, type, row) {
            if (type === 'display') {
               if (data === 1 || data === '1') {
                  return '<span style="color: green; font-weight: bold;">Si</span>';
               } else if (data === 0 || data === '0') {
                  return '<span style="color: red; font-weight: bold;">No</span>';
               } else {
                  return data; // Mostrar el valor original si no es 0 o 1
               }
            }
            return data; // Para otros tipos de renderizado (sort, filter, etc.)
         }
      },
      {
         data: "estado_compensacion_extra_gestor",
         title: "Estado",
         searchPanes: { show: true },
         render: function(data, type, row) {
            if (type === 'display') {
               const estados = {
                  'Pendiente': '<span style="color: orange; font-weight: bold;">Pendiente</span>',
                  'Aplicada': '<span style="color: blue; font-weight: bold;">Aplicada</span>',
                  'Procesada': '<span style="color: green; font-weight: bold;">Procesada</span>',
                  'Cancelada': '<span style="color: red; font-weight: bold;">Cancelada</span>'
               };
               return estados[data] || data;
            }
            return data; // Para otros tipos de renderizado (sort, filter, etc.)
         }
      },
   ];

   /**
    * Formatea los datos de una fila de la tabla.
    * @param {Object} datosFila - Datos de la fila a formatear.
    * @returns {Object} Datos formateados de la fila.
    */
   const formatearDatosFila = (datosFila) => ({
      id_compensacion_extra_gestor: datosFila.id_compensacion_extra_gestor,
      empresa_id_compensacion_extra_gestor: datosFila.empresa_id_compensacion_extra_gestor,
      planilla_id_compensacion_extra_gestor: datosFila.planilla_id_compensacion_extra_gestor,
      empleado_id_compensacion_extra_gestor: datosFila.empleado_id_compensacion_extra_gestor,
      remuneracion_actual_gestor: datosFila.remuneracion_actual_gestor,
      tipo_jornada_gestor: datosFila.tipo_jornada_gestor,
      tipo_compensacion_extra_gestor: datosFila.tipo_compensacion_extra_gestor,
      cantidad_horas_gestor: datosFila.cantidad_horas_gestor,
      fecha_compensacion_gestor: datosFila.fecha_compensacion_gestor,
      monto_compensacion_calculado_gestor: datosFila.monto_compensacion_calculado_gestor,
      motivo_compensacion_gestor: datosFila.motivo_compensacion_gestor,
      aplica_en_compensacion_anual_gestor: datosFila.aplica_en_compensacion_anual_gestor,
      estado_compensacion_extra_gestor: datosFila.estado_compensacion_extra_gestor,
      usuario_id_compensacion_extra_gestor: datosFila.usuario_id_compensacion_extra_gestor,
      fecha_creacion_compensacion_extra_gestor: datosFila.fecha_creacion_compensacion_extra_gestor,
      fecha_modificacion_compensacion_extra_gestor: datosFila.fecha_modificacion_compensacion_extra_gestor,
      // Campos de JOIN
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
      urlEndpoint: "gestor/planilla/compensaciones/lista", // API endpoint para obtener los datos.
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
      columnsFilter: [0, 1, 2, 3, 4, 5, 6], // Índices de columnas que se pueden filtrar.
      columns: obtenerColumnasTabla(), // Definición de columnas.
   });

   /**
    * Navega a la página de creación de una nueva compensación extra.
    * @param {Function} navigate - Función de navegación de React Router.
    */
   const navegarCrearHorasExtra = (navigate) => {
      navigate("/acciones/compensacion-extra/crear");
   };

/**
 * Componente principal que muestra la lista de Compensaciones Extras.
 * @returns {JSX.Element} Componente de lista de Compensaciones Extras.
 */
export const HorasExtraLista = () => {
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
   const [estadoSeleccionado, setEstadoSeleccionado] = useState("Pendiente");

   // Limpiar localStorage al cargar el componente
   useEffect(() => {
      localStorage.removeItem("selectedHorasExtra");
   }, []);

   // Manejar la selección de planilla para editar
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
      // Formatear todos los datos de la planilla usando la función formatearDatosFila
      const datosFormateados = formatearDatosFila(datosFila);

      // Almacena todos los datos formateados en el almacenamiento local
      localStorage.setItem("selectedHorasExtra", JSON.stringify(datosFormateados));

      // Verificar que se guardó correctamente
      const datosGuardados = localStorage.getItem("selectedHorasExtra");

      // Navega a la página de edición de compensación extra
      navigate("/acciones/horas-extra/editar"); 
   };

   // Configuración de la tabla usando useMemo para optimizar el rendimiento.
   const configuracionTabla = useMemo(
      () => ({
         ...crearConfiguracionTabla(user),
         transaccion: {
            ...crearConfiguracionTabla(user).transaccion,
            data: {
               empresaAplica: true,
               estados: estadoSeleccionado,
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
          {/* Botones para crear  */}
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
                onClick={() => navegarCrearHorasExtra(navigate)}
                className="user-detail-dialog-buttonSecondary"
                style={{
                   width: "350px",
                   minWidth: "350px",
                }}
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
               Mostrando planillas en estado:{" "}
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