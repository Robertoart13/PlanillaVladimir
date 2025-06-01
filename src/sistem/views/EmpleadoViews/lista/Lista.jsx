import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import "../../../styles/customstyles.css";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePermiso } from "../../../../hooks/usePermisos";

/**
 * Obtiene las columnas de la tabla configuradas.
 * @returns {Array} Arreglo de objetos que representan las columnas de la tabla.
 */
const obtenerColumnasTabla = () => [
   {
      data: null,
      title: "Nombre Completo",
      searchPanes: { show: true },
      render: (data, type, row) => `${row.nombre_empleado} ${row.apellidos_empleado}`,
   },
   {
      data: "cedula_empleado",
      title: "Identificador Fiscal",
      searchPanes: { show: true },
   },
   {
      data: "cedula_empleado",
      title: "Cédula",
      searchPanes: { show: true },
   },
   {
      data: "correo_empleado",
      title: "Correo",
      searchPanes: { show: true },
   },
   {
      data: "nombre_empresa",
      title: "Empresa",
      searchPanes: { show: true },
   },
   {
      data: "nombre_supervisor",
      title: "Supervisor",
      searchPanes: { show: true },
   },
   {
      data: "ministerio_hacienda_empleado",
      title: "Ministerio de Hacienda",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "rt_ins_empleado",
      title: "RT-INS",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "caja_costarricense_seguro_social_empleado",
      title: "CCSS",
      searchPanes: { show: true },
      render: (data) => renderEstadoInscripcion(data),
   },
   {
      data: "estado_empleado",
      title: "Estado",
      searchPanes: { show: true },
      render: (data) => renderEstadoEmpleado(data),
   },
];

/**
 * Renderiza el estado de inscripción de un empleado.
 * @param {number} data - Valor que indica si el empleado está inscrito.
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
 * Renderiza el estado de un empleado.
 * @param {number} data - Valor que indica si el empleado está activo.
 * @returns {string} HTML que representa el estado del empleado.
 */
const renderEstadoEmpleado = (data) => {
   const estaActivo = data === 1;
   return `
      <span class="badge bg-light-${estaActivo ? "success" : "danger"}">
         ${estaActivo ? "Activo" : "Inactivo"}
      </span>
   `;
};

/**
 * Formatea los datos de un empleado para su uso en la tabla.
 * @param {Object} datosEmpleado - Datos del empleado.
 * @returns {Object} Datos formateados del empleado.
 */
const formatearDatosEmpleado = (datosEmpleado) => ({
   id_empleado: datosEmpleado.id_empleado,
   nombre_empleado: datosEmpleado.nombre_empleado,
   apellidos_empleado: datosEmpleado.apellidos_empleado,
   cedula_empleado: datosEmpleado.cedula_empleado,
   fecha_vencimiento_cedula_empleado: datosEmpleado.fecha_vencimiento_cedula_empleado,
   fecha_nacimiento_empleado: datosEmpleado.fecha_nacimiento_empleado,
   estado_civil_empleado: datosEmpleado.estado_civil_empleado,
   correo_empleado: datosEmpleado.correo_empleado,
   telefono_empleado: datosEmpleado.telefono_empleado,
   direccion_empleado: datosEmpleado.direccion_empleado,
   fecha_ingreso_empleado: datosEmpleado.fecha_ingreso_empleado,
   fecha_salida_empleado: datosEmpleado.fecha_salida_empleado,
   jornada_laboral_empleado: datosEmpleado.jornada_laboral_empleado,
   horario_empleado: datosEmpleado.horario_empleado,
   salario_empleado: datosEmpleado.salario_empleado,
   id_nacionalidad: datosEmpleado.id_nacionalidad,
   id_tipo_contrato: datosEmpleado.id_tipo_contrato,
   id_departamento: datosEmpleado.id_departamento,
   id_puesto: datosEmpleado.id_puesto,
   id_supervisor: datosEmpleado.id_supervisor,
   id_empresa: datosEmpleado.id_empresa,
   estado_empleado: datosEmpleado.estado_empleado,
   fecha_creacion_empleado: datosEmpleado.fecha_creacion_empleado,
   fecha_modificacion_empleado: datosEmpleado.fecha_modificacion_empleado,
   nombre_empresa: datosEmpleado.nombre_empresa,
   nombre_puesto: datosEmpleado.nombre_puesto,
   nombre_departamento: datosEmpleado.nombre_departamento,
   nombre_tipo_contrato: datosEmpleado.nombre_tipo_contrato,
   nombre_nacionalidad: datosEmpleado.nombre_nacionalidad,
   nombre_supervisor: datosEmpleado.nombre_supervisor,
   cuentas_iban: datosEmpleado.cuentas_iban,
   ministerio_hacienda_empleado: datosEmpleado.ministerio_hacienda_empleado,
   rt_ins_empleado: datosEmpleado.rt_ins_empleado,
   caja_costarricense_seguro_social_empleado:
      datosEmpleado.caja_costarricense_seguro_social_empleado,
   asegurado_empleado: datosEmpleado.asegurado_empleado,
});

/**
 * Componente principal que muestra la lista de empleados.
 * @returns {JSX.Element} Componente de lista de empleados.
 */
export const EmpleadoLista = () => {
   // Obtener el usuario autenticado desde Redux.
   const { user } = useSelector((state) => state.auth);

   const tienePermiso = usePermiso(1);

   if (!tienePermiso) {
      return (
         <TarjetaRow
            texto="Lista de Empleados"
            subtitulo="No tienes permiso para ver esta sección."
         >
            <div
               className="alert alert-danger"
               role="alert"
            >
               No tiene permiso para ver lista de  empleados del sistema. Por favor, contacta al
               administrador del sistema para solicitar acceso.
            </div>
         </TarjetaRow>
      );
   }

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

   /**
    * Configuración para la tabla de catálogo de cuentas.
    * Define el endpoint, el tipo de solicitud y los permisos necesarios.
    */
   const configuracionTabla = useMemo(
      () => ({
         urlEndpoint: "empleados", // API endpoint para obtener los datos.
         requestType: "POST", // Método HTTP para la solicitud.
         transaccion: {
            user: {
               id: parseInt(user?.id_usuario) || 0,
               rol: parseInt(user?.id_rol) || 0,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tienes permiso para ver la lista de empleados",
            },
         },
         columnsLayout: "columns-2", // Diseño de columnas en la tabla.
         columnsFilter: [0, 1, 2, 3, 4, 5, 6, 7, 8], // Índices de columnas que se pueden filtrar.
         columns: obtenerColumnasTabla(), // Definición de columnas.
      }),
      [user?.id_usuario], // Se actualiza si cambia el usuario autenticado.
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

   /**
    * Recarga la tabla después de agregar o actualizar una cuenta.
    */
   const recargarTabla = () => {
      if (tableInstanceRef.current) {
         tableInstanceRef.current.ajax.reload();
      }
   };

   /**
    * Maneja el clic en una fila de la tabla.
    * @param {Object} datosFila - Datos de la fila seleccionada.
    */
   const manejarClicFila = (datosFila) => {
      // Almacena los datos de la fila seleccionada en el almacenamiento local
      localStorage.setItem("selectedEmpleado", JSON.stringify(datosFila));
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
            texto="Listado de Empleados"
            subtitulo="Tabla que muestra todos los empleados disponibles."
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
                  onClick={abrirCrearEmpleado}
                  className="user-detail-dialog-buttonSecondary"
               >
                  <i
                     className="ph-duotone ph-certificate"
                     style={{ paddingRight: "5px" }}
                  ></i>
                  Crear Empleado
               </Button>
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

         {selected && manejarClicFila(selected)}
      </>
   );
};
