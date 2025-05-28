


import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDataTable } from "../../../../hooks/getDataTableConfig";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import "../../../styles/customstyles.css";
import { Button, Stack } from "@mui/material";
import { useNavigate } from 'react-router-dom';

// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Planillas",
   subtitulo: "Tabla que muestra todas las planillas disponibles.",
   crearEmpresa: "Crear Planilla",
   sinPermiso: "No tienes permiso para ver la lista de planillas",
};

/**
 * Obtiene las columnas de la tabla con sus configuraciones.
 * @returns {Array} Arreglo de objetos de configuración de columnas.
 */
const obtenerColumnasTabla = () => [
   {
      data: "nombre_comercial_empresa",
      title: "Nombre comercial",
      searchPanes: { show: true },
   },
   {
      data: "nombre_razon_social_empresa",
      title: "Razón social",
      searchPanes: { show: true },
   },
   {
      data: "cedula_juridica_empresa",
      title: "Identificador fiscal",
      searchPanes: { show: true },
   },
   {
      data: "correo_contacto_empresa",
      title: "Correo contacto",
      searchPanes: { show: true },
   },
   {
      data: "correo_facturacion_empresa",
      title: "Correo facturación",
      searchPanes: { show: true },
   },
   {
      data: "estado_empresa",
      title: "Estado",
      searchPanes: { show: true },
      render: (data) => {
         const isActive = data === 1;
         return `
           <span class="badge bg-light-${isActive ? "success" : "danger"}">
              ${isActive ? "Activo" : "Inactivo"}
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
   id_empresa: datosFila.id_empresa,
   nombre_comercial_empresa: datosFila.nombre_comercial_empresa, 
   nombre_razon_social_empresa: datosFila.nombre_razon_social_empresa,
   cedula_juridica_empresa: datosFila.cedula_juridica_empresa,
   nombre_contacto_empresa: datosFila.nombre_contacto_empresa,
   correo_contacto_empresa: datosFila.correo_contacto_empresa,
   correo_facturacion_empresa: datosFila.correo_facturacion_empresa,
   direccion_empresa: datosFila.direccion_empresa,
   estado_empresa: datosFila.estado_empresa,
});

/**
 * Crea la configuración de la tabla para el componente.
 * @param {Object} usuario - Usuario autenticado.
 * @returns {Object} Configuración de la tabla.
 */
const crearConfiguracionTabla = (usuario) => ({
   urlEndpoint: "empresas", // API endpoint para obtener los datos.
   requestType: "POST", // Método HTTP para la solicitud.
   transaccion: {
      user: {
         id: parseInt(usuario?.id_usuario) || 0,
         rol: parseInt(usuario?.id_rol) || 0,
      },
      acceso: {
         type: 0,
         permiso: 0,
         details: TEXTOS.sinPermiso,
      },
   },
   columnsLayout: "columns-2", // Diseño de columnas en la tabla.
   columnsFilter: [0, 1, 2, 3, 4, 5], // Índices de columnas que se pueden filtrar.
   columns: obtenerColumnasTabla(), // Definición de columnas.
});

/**
 * Maneja el clic en una fila de la tabla.
 * @param {Object} datosFila - Datos de la fila seleccionada.
 */
const manejarClicFila = (datosFila, navigate) => {
   localStorage.setItem('selectedEmpresa', JSON.stringify(datosFila));
   navigate('/empresas/editar');
};

/**
 * Navega a la página de creación de una nueva empresa.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearEmpresa = (navigate) => {
   navigate('/empresas/crear');
};

/**
 * Componente principal que muestra la lista de empresas.
 * @returns {JSX.Element} Componente de lista de empresas.
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

   // Configuración de la tabla usando useMemo para optimizar el rendimiento.
   const configuracionTabla = useMemo(
      () => crearConfiguracionTabla(user),
      [user?.id_usuario],
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
           manejarClicFila(selected, navigate)
         )}
    </>
 );
};
