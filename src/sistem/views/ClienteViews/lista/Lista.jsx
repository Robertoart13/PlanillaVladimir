import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import "../../../styles/customstyles.css";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * Obtiene las columnas de la tabla configuradas.
 * @returns {Array} Arreglo de objetos que representan las columnas de la tabla.
 */
const obtenerColumnasTabla = () => [

   {
      data: "nombre_usuario",
      title: "Nombre Supervisor",         
      searchPanes: { show: true },
   },
   {
      data: "email_usuario",
      title: "Email",
      searchPanes: { show: true },
   },
   {
      data: "rol_usuario",
      title: "Rol Usuario",   
      searchPanes: { show: true },
   },
   {
      data: "nombre_empresa",
      title: "Nombre Empresa",   
      searchPanes: { show: true },
   },
   {
      data: "estado_usuario",
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
   id_usuario : datosEmpleado.id_usuario , 
   nombre_usuario : datosEmpleado.nombre_usuario,
   email_usuario : datosEmpleado.email_usuario,
   rol_usuario : datosEmpleado.rol_usuario,
   estado_usuario : datosEmpleado.estado_usuario,
   intentos_login_usuario : datosEmpleado.intentos_login_usuario,
   login_usuario : datosEmpleado.login_usuario,
   id_empresa_usuario : datosEmpleado.id_empresa_usuario,
   password_hash_usuario : datosEmpleado.password_hash_usuario,
});

/**
 * Componente principal que muestra la lista de empleados.
 * @returns {JSX.Element} Componente de lista de empleados.
 */
export const ClienteLista = () => {
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

   /**
    * Configuración para la tabla de catálogo de cuentas.
    * Define el endpoint, el tipo de solicitud y los permisos necesarios.
    */
   const configuracionTabla = useMemo(
      () => ({
         urlEndpoint: "clientes", // API endpoint para obtener los datos.
         requestType: "POST", // Método HTTP para la solicitud.
         transaccion: {
            user: {
               id: parseInt(user?.id_usuario) || 0,
               rol: parseInt(user?.id_rol) || 0,
            },
            acceso: {
               type: 0,
               permiso: 0,
               details: "No tienes permiso para ver la lista de clientes",
            },
         },
         columnsLayout: "columns-2", // Diseño de columnas en la tabla.
         columnsFilter: [0, 1, 2, 3], // Índices de columnas que se pueden filtrar.
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
      localStorage.setItem("selectedCliente", JSON.stringify(datosFila));
      // Navega a la página de edición
      navigate("/clientes/editar");
   };

   /**
    * Abre el diálogo para crear un nuevo empleado.
    */
   const abrirCrearCliente = () => {
      navigate("/clientes/crear");
   };

   return (
      <>
         <TarjetaRow
            texto="Listado de Clientes" 
            subtitulo="Tabla que muestra todos los clientes disponibles."
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
                  onClick={abrirCrearCliente}
                  className="user-detail-dialog-buttonSecondary"
               >
                  <i
                     className="ph-duotone ph-certificate"
                     style={{ paddingRight: "5px" }}
                  ></i>
                  Crear Cliente
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
