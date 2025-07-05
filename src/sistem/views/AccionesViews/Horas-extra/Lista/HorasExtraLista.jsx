import { useMemo, useRef } from "react";
// Importaciones de estilos
import { Button, Stack } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { TarjetaRow } from "../../../../components/TarjetaRow/TarjetaRow";

// Constantes para los textos
const TEXTOS = {
   titulo: "Listado de Compensaciones Extras",
   subtitulo: "Tabla que muestra todos los Compensaciones Extras disponibles.",
   crearEmpresa: "Crear Compensacion Extra",
};

/**
 * Obtiene las columnas de la tabla con sus configuraciones.
 * @returns {Array} Arreglo de objetos de configuración de columnas.
 */
const obtenerColumnasTabla = () => [
  
   {
      data: "nombre_empleado",
      title: "Nombre del Empleado",
      searchPanes: { show: true },
   },
   {
      data: "planilla_afectada",
      title: "Planilla Afectada",
      searchPanes: { show: true },
   },
   {
      data: "planilla_tipo",
      title: "Tipo Planilla",
      searchPanes: { show: true },
   },
   
   {
      data: "monto_hora_extra",
      title: "Monto de Compensacion Extra",
      searchPanes: { show: true },
      render: (data) => {
         if (!data) return "";
         const monto = parseFloat(data);
         if (isNaN(monto)) return data;
         return new Intl.NumberFormat('es-CR', {
            style: 'currency',
            currency: 'CRC',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
         }).format(monto);
      },
   },
 
   {
      data: "horas_extra_estado",
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
        return (
           <span className={`badge bg-light-${estado.color}`}>
              {estado.texto}
           </span>
        );
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
   nombre_empleado: datosFila.nombre_empleado,
   planilla_afectada: datosFila.planilla_afectada,
   planilla_tipo: datosFila.planilla_tipo,
   monto_hora_extra: datosFila.monto_hora_extra,
   horas_extra_estado: datosFila.horas_extra_estado,
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
 * Navega a la página de creación de una nueva Horas extra.
 * @param {Function} navigate - Función de navegación de React Router.
 */
const navegarCrearHorasExtra = (navigate) => {
   navigate('/acciones/compensacion-extra/crear');
};

/**
 * Componente principal que muestra la lista de Horas extra.
 * @returns {JSX.Element} Componente de lista de Horas extra.
 */
export const HorasExtraLista = () => {
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
         horas_extra_id: 1,
         nombre_empleado: "Juan Perez",
         planilla_afectada: "Planilla 1",
         planilla_tipo: "Mensual",
         monto_hora_extra: 10000,
         horas_extra_estado: "Activa",
      },
      {
         horas_extra_id: 2,
         nombre_empleado: "Maria Lopez",
         planilla_afectada: "Planilla 2",
         planilla_tipo: "Quincenal",
         monto_hora_extra: 15000,
         horas_extra_estado: "En Proceso",
      }
   ];

   return (
    <>
       <TarjetaRow
          texto={TEXTOS.titulo}
          subtitulo={TEXTOS.subtitulo}
       >
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
                   width: "300px",
                   minWidth: "300px",
                }}
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