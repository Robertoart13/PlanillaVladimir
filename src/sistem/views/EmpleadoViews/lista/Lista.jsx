import { useMemo, useEffect } from "react";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { Button, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";

// campos importantes
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";

/**
 * Obtiene las columnas de la tabla configuradas.
 * @returns {Array} Arreglo de objetos que representan las columnas de la tabla.
 */
const obtenerColumnasTabla = () => [
   {
      data: "numero_socio_empleado_gestor",
      title: "N° Socio",
      searchPanes: { show: true },
   },
   {
      data: "nombre_completo_empleado_gestor",
      title: "Nombre Completo",
      searchPanes: { show: true },
   },
   {
      data: "cedula_empleado_gestor",
      title: "Cédula",
      searchPanes: { show: true },
   },
   {
      data: "correo_empleado_gestor",
      title: "Correo",
      searchPanes: { show: true },
   },
   {
      data: "nombre_supervisor",
      title: "Supervisor",
      searchPanes: { show: true },
   },
   {
      data: "ministerio_hacienda_empleado_gestor",
      title: "Ministerio de Hacienda",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "rt_ins_empleado_gestor",
      title: "RT-INS",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "ccss_empleado_gestor",
      title: "CCSS",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "estado_empleado_gestor",
      title: "Estado",
      searchPanes: { show: true },
      render: (data) => renderEstadoEmpleado(data),
   },
];

/**
 * Renderiza el estado de inscripción de un Socio.
 * @param {number} data - Valor que indica si el Socio está inscrito (1 = Inscrito, 0 = No Inscrito).
 * @returns {string} HTML que representa el estado de inscripción.
 */
const renderEstadoInscripcion = (data) => {
   const estaInscrito = data === 1;
   return `
      <span class="badge bg-light-${estaInscrito ? "success" : "danger"}">
         ${estaInscrito ? "Inscrito" : "No Inscrito"}
      </span>
   `;
};

/**
 * Renderiza el estado de un Socio.
 * @param {number} data - Valor que indica si el Socio está activo (1 = Activo, 0 = Inactivo).
 * @returns {string} HTML que representa el estado del Socio.
 */
const renderEstadoEmpleado = (data) => {
   const estaActivo = data === 1;
   return `
      <span class="badge bg-light-${estaActivo ? "success" : "danger"}">
         ${estaActivo ? "Activo" : "Inactivo"}
      </span>
   `;
};

const formatearDatosEmpleado = (datosEmpleado) => ({
   id_empleado_gestor: datosEmpleado.id_empleado_gestor,
   numero_socio_empleado_gestor: datosEmpleado.numero_socio_empleado_gestor,
   nombre_completo_empleado_gestor: datosEmpleado.nombre_completo_empleado_gestor,
   correo_empleado_gestor: datosEmpleado.correo_empleado_gestor,
   telefono_empleado_gestor: datosEmpleado.telefono_empleado_gestor,
   cedula_empleado_gestor: datosEmpleado.cedula_empleado_gestor,
   salario_base_empleado_gestor: datosEmpleado.salario_base_empleado_gestor,
   tipo_contrato_empleado_gestor: datosEmpleado.tipo_contrato_empleado_gestor,
   departamento_empleado_gestor: datosEmpleado.departamento_empleado_gestor,
   puesto_empleado_gestor: datosEmpleado.puesto_empleado_gestor,
   supervisor_empleado_gestor: datosEmpleado.supervisor_empleado_gestor,
   id_empresa: datosEmpleado.id_empresa,
   fecha_ingreso_empleado_gestor: datosEmpleado.fecha_ingreso_empleado_gestor,
   fecha_salida_empleado_gestor: datosEmpleado.fecha_salida_empleado_gestor,
   jornada_laboral_empleado_gestor: datosEmpleado.jornada_laboral_empleado_gestor,
   numero_asegurado_empleado_gestor: datosEmpleado.numero_asegurado_empleado_gestor,
   numero_ins_empleado_gestor: datosEmpleado.numero_ins_empleado_gestor,
   numero_hacienda_empleado_gestor: datosEmpleado.numero_hacienda_empleado_gestor,
   cuenta_bancaria_1_empleado_gestor: datosEmpleado.cuenta_bancaria_1_empleado_gestor,
   cuenta_bancaria_2_empleado_gestor: datosEmpleado.cuenta_bancaria_2_empleado_gestor,
   vacaciones_acumuladas_empleado_gestor: datosEmpleado.vacaciones_acumuladas_empleado_gestor,
   aguinaldo_acumulado_empleado_gestor: datosEmpleado.aguinaldo_acumulado_empleado_gestor,
   cesantia_acumulada_empleado_gestor: datosEmpleado.cesantia_acumulada_empleado_gestor,
   ministerio_hacienda_empleado_gestor: datosEmpleado.ministerio_hacienda_empleado_gestor,
   rt_ins_empleado_gestor: datosEmpleado.rt_ins_empleado_gestor,
   ccss_empleado_gestor: datosEmpleado.ccss_empleado_gestor,
   moneda_pago_empleado_gestor: datosEmpleado.moneda_pago_empleado_gestor,
   tipo_planilla_empleado_gestor: datosEmpleado.tipo_planilla_empleado_gestor,
   estado_empleado_gestor: datosEmpleado.estado_empleado_gestor,
});

/**
 * Componente principal que muestra la lista de Socios.
 * @returns {JSX.Element} Componente de lista de Socios.
 */
export const EmpleadoLista = () => {
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

   // Estado para el filtro de estado de Socios (1 = Activos, 2 = Inactivos, 3 = Todos)
   const [estadoFiltro, setEstadoFiltro] = useState(1);

   // Limpiar localStorage al cargar el componente
   useEffect(() => {
      localStorage.removeItem("selectedEmpleado");
   }, []);

   /**
    * Maneja el cambio en el filtro de estado.
    * @param {number} nuevoEstado - Nuevo valor del filtro de estado.
    */
   const handleEstadoChange = useCallback((nuevoEstado) => {
      setEstadoFiltro(nuevoEstado);
   }, []);

   /**
    * Configuración para la tabla de catálogo de cuentas.
    * Define el endpoint, el tipo de solicitud y los permisos necesarios.
    */
   const configuracionTabla = useMemo(
      () => ({
         urlEndpoint: "gestor/empleados", // API endpoint para obtener los datos.
         requestType: "POST", // Método HTTP para la solicitud.
         transaccion: {
            user: {
               id: parseInt(user?.id_usuario) || 0,
               rol: parseInt(user?.id_rol) || 0,
               id_empresa: parseInt(user?.id_empresa) || 0,
            },
            estado: estadoFiltro, // Valor del filtro de estado
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tienes permiso para ver la lista de Socios",
            },
         },
         columnsLayout: "columns-2", // Diseño de columnas en la tabla.
         columns: obtenerColumnasTabla(), // Definición de columnas.
      }),
      [user?.id_usuario, estadoFiltro], // Se actualiza si cambia el usuario autenticado o el filtro de estado.
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
      formatearDatosEmpleado,
   );

   // Manejar la selección de empleado para editar
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

      
      // Formatear todos los datos del empleado usando la función formatearDatosEmpleado
      const datosFormateados = formatearDatosEmpleado(datosFila);

   
      // Almacena todos los datos formateados en el almacenamiento local
      localStorage.setItem("selectedEmpleado", JSON.stringify(datosFormateados));
      
      // Verificar que se guardó correctamente
      const datosGuardados = localStorage.getItem("selectedEmpleado");

      
      // Navega a la página de edición
      navigate("/empleados/editar");
   };

   /**
    * Abre el diálogo para crear un nuevo empleado.
    */
   const abrirCrearEmpleado = () => {
      navigate("/empleados/crear");
   };

   return (
      <>
         <TarjetaRow
            texto="Listado de Socios"
            subtitulo="Tabla que muestra todos los Socios disponibles."
         >
            {/* Muestra mensajes de error cuando ocurren */}
            {error && (
               <ErrorMessage
                  error={error}
                  message={message}
               />
            )}
            
            {/* Contenedor de botones y filtros */}
            <Stack
               direction="row"
               spacing={2}
               sx={{
                  mb: 2,
                  alignItems: "center",
                  justifyContent: "space-between",
               }}
            >
               {/* Botón para crear Socio */}
               <Button
                  variant="contained"
                  onClick={abrirCrearEmpleado}
                  className="user-detail-dialog-buttonSecondary"
                  sx={{ minWidth: "200px" }}
               >
                  <i
                     className="ph-duotone ph-certificate"
                     style={{ paddingRight: "5px" }}
                  ></i>
                  Crear Socio
               </Button>

               {/* Filtro de estado de Socios */}
               <FormControl sx={{ minWidth: "250px" }}>
                  <InputLabel id="estado-filtro-label">Filtrar por Estado</InputLabel>
                  <Select
                     labelId="estado-filtro-label"
                     id="estado-filtro"
                     value={estadoFiltro}
                     label="Filtrar por Estado"
                     onChange={(e) => handleEstadoChange(e.target.value)}
                  >
                     <MenuItem value={1}>Socios Activos</MenuItem>
                     <MenuItem value={2}>Socios Inactivos</MenuItem>
                     <MenuItem value={3}>Todos los Socios</MenuItem>
                  </Select>
               </FormControl>
            </Stack>

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
