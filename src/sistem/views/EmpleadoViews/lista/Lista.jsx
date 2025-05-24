import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import "../../../styles/customstyles.css";
import { Button, Stack } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const getTableColumns = () => [
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
      title: "cedula" ,
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
      data: "estado_empleado",
      title: "Estado",
      searchPanes: { show: true },
      render: function (data) {
         const isActive = data === 1;
         return `
           <span class="badge bg-light-${isActive ? "success" : "danger"}">
              ${isActive ? "Activo" : "Inactivo"}
           </span>
        `;
      },
   },
];

const formatData = (rowData) => ({
   id_empresa: rowData.id_empresa,
   nombre_empresa: rowData.nombre_empresa,
   rnc_empresa: rowData.rnc_empresa,
   direccion_empresa: rowData.direccion_empresa,
   telefono_empresa: rowData.telefono_empresa,
   correo_empresa: rowData.correo_empresa,
   estado_empresa: rowData.estado_empresa,
});

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

   /**
    * Configuración para la tabla de catálogo de cuentas.
    * Define el endpoint, el tipo de solicitud y los permisos necesarios.
    */
   const tableConfig = useMemo(
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
         columnsFilter: [0, 1, 2, 3, 4,5,6], // Índices de columnas que se pueden filtrar.
         columns: getTableColumns(), // Definición de columnas.
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
      tableConfig.urlEndpoint,
      tableConfig.requestType,
      tableConfig.transaccion,
      tableConfig.columnsLayout,
      tableConfig.columnsFilter,
      tableConfig.columns,
      formatData,
   );

   /**
    * Recarga la tabla después de agregar o actualizar una cuenta.
    */
   const handleUpdated = () => {
      if (tableInstanceRef.current) {
         tableInstanceRef.current.ajax.reload();
      }
   };

   const handleRowClick = (rowData) => {
         // Store the selected row data in local storage
         localStorage.setItem('selectedEmpleado', JSON.stringify(rowData));
         // Navigate to the edit page
         navigate('/empleados/editar'); 
   };

   /**
    * Abre el diálogo para crear una nueva cuenta contable.
    */
   const crear = () => {
      navigate('/empleados/crear'); 
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
                onClick={crear}
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

       {selected && (
           handleRowClick(selected)
         )}
   
   
    </>
 );
};
