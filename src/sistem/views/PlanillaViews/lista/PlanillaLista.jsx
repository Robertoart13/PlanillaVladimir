import { useMemo, useRef } from "react";
import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
// Importaciones de estilos
import { Button, Stack } from "@mui/material";
import { useNavigate } from 'react-router-dom';

// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Planillas",
   subtitulo: "Tabla que muestra todas las planillas disponibles.",
   crearEmpresa: "Crear Planilla",
};

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
      render: (data) => data ? String(data).split('T')[0] : "",
   },
   {
      data: "planilla_fecha_fin",
      title: "Fecha Fin",
      searchPanes: { show: true },
      render: (data) => data ? String(data).split('T')[0] : "",
   },
   {
      data: "planilla_estado",
      title: "Estado",
      searchPanes: { show: true },
      render: (data) => {
         // Mapea cada estado a un color y texto descriptivo
         const estados = {
            "En Proceso": { color: "secondary", texto: "En Proceso" },    // Fase inicial de edición
            "Activa":     { color: "success",   texto: "Activa" },        // Lista para carga de datos
            "Cerrada":    { color: "warning",   texto: "Cerrada" },       // Solo revisión o validación
            "Procesada":  { color: "primary",   texto: "Procesada" },     // Lista para pagar o archivar
            "Cancelada":  { color: "danger",    texto: "Cancelada" },     // Descartada
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
 * @returns {Object} Configuración de la tabla.
 */
const crearConfiguracionTabla = () => ({
   columnsLayout: "columns-2", // Diseño de columnas en la tabla.
   columnsFilter: [0, 1, 2, 3, 6], // Índices de columnas que se pueden filtrar.
   columns: obtenerColumnasTabla(), // Definición de columnas.
});


/**
 * Navega a la página de creación de una nueva planilla.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearPlanilla = (navigate) => {
   navigate('/planilla/crear');
};

/**
 * Componente principal que muestra la lista de planilla.
 * @returns {JSX.Element} Componente de lista de planilla.
 */
export const PlanillaLista = () => {
   const navigate = useNavigate();

   const tableRef = useRef(null);

   // Configuración de la tabla usando useMemo para optimizar el rendimiento.
   const configuracionTabla = useMemo(
      () => crearConfiguracionTabla(),
      [],
   );

   // Datos de ejemplo para mostrar en la tabla
   const datosEjemplo = [
      {
         planilla_id: 1,
         planilla_codigo: "001",
         nombre_empresa: "Empresa Ejemplo",
         nombre_usuario: "Usuario Demo",
         planilla_tipo: "Mensual",
         planilla_fecha_inicio: "2024-01-01",
         planilla_fecha_fin: "2024-01-31",
         planilla_estado: "Activa",
      },
      {
         planilla_id: 2,
         planilla_codigo: "002",
         nombre_empresa: "Otra Empresa",
         nombre_usuario: "Otro Usuario",
         planilla_tipo: "Quincenal",
         planilla_fecha_inicio: "2024-02-01",
         planilla_fecha_fin: "2024-02-15",
         planilla_estado: "En Proceso",
      }
   ];

   return (
    <>
       <TarjetaRow
          texto={TEXTOS.titulo}
          subtitulo={TEXTOS.subtitulo}
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
                onClick={() => navegarCrearPlanilla(navigate)}
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
                      <thead>
                         <tr>
                            {configuracionTabla.columns.map((columna, index) => (
                               <th key={index}>{columna.title}</th>
                            ))}
                         </tr>
                      </thead>
                      <tbody>
                         {datosEjemplo.map((fila, index) => {
                            const datosFormateados = formatearDatosFila(fila);
                            return (
                               <tr 
                                  key={index}
                                  onClick={() => alert("hola")}
                                  style={{ cursor: 'pointer' }}
                               >
                                  {configuracionTabla.columns.map((columna, colIndex) => (
                                     <td key={colIndex}>
                                        {columna.render 
                                           ? columna.render(datosFormateados[columna.data])
                                           : datosFormateados[columna.data] || fila[columna.data]
                                        }
                                     </td>
                                  ))}
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </TarjetaRow>
    </>
 );
};