import { useMemo } from "react";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
 * Componente principal que muestra la lista de empleados.
 * @returns {JSX.Element} Componente de lista de empleados.
 */
export const EmpleadoLista = () => {
   const navigate = useNavigate();

   /**
    * Configuración para la tabla de empleados.
    * Define las columnas y su configuración.
    */
   const configuracionTabla = useMemo(
      () => ({
         columns: obtenerColumnasTabla(), // Definición de columnas.
      }),
      [], // No depende de ningún valor que cambie.
   );

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
                     <table className="table table-hover datatable-table">
                        <thead>
                           <tr>
                              {configuracionTabla.columns.map((columna, index) => (
                                 <th key={index}>{columna.title}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {/* Aquí se agregarán los datos cuando esté listo */}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </TarjetaRow>
      </>
   );
};