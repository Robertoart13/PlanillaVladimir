import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency, formatCurrencyUSD } from "../../../../hooks/formatCurrency";    

/**
 * =========================
 * CONSTANTS & CONFIGURATION    
 * =========================
 */

/** Configuración de columnas para la tabla principal de planilla */
const PAYROLL_COLUMNS = [
   { key: "nombre", label: "Nombre Socio", style: { minWidth: 180 } },
   { key: "cedula", label: "Cédula", style: { minWidth: 100 } },
   { key: "compensacion_base", label: "Compensacion Base", type: "number" },
   { key: "devengado", label: "Devengado", type: "number" },
   { key: "cargas_sociales", label: "Cargas Sociales", type: "number" },
   { key: "monto_neto", label: "Monto Neto", type: "number", style: { minWidth: 180 } },
   { key: "accion", label: "Acciones" },
   { key: "estado", label: "Estado" },
];

/** Configuración de columnas para la tabla de detalles */
const SUBTABLE_COLUMNS = [
   { key: "categoria", label: "Categoria", style: { minWidth: 150 } },
   { key: "tipoAccion", label: "Tipo de Accion", style: { minWidth: 100 } },
   { key: "monto", label: "Monto", type: "number", style: { minWidth: 120 } },
   { key: "tipo", label: "Tipo (+/-)", style: { minWidth: 120 } },
   { key: "estado", label: "Estado", style: { minWidth: 200 } },
];

/** Opciones de tamaño de página para la paginación */
const PAGE_SIZES = [5, 10, 30, 60, 80, 100];

/**
 * Función para transformar los datos de la API al formato de la tabla
 * @param {Array} planillaData - Datos de la API
 * @returns {Array} Datos transformados para la tabla
 */
const transformarDatosPlanilla = (planillaData) => {
   if (!planillaData || !Array.isArray(planillaData)) return [];

   console.log(planillaData);
   
   return planillaData.map(empleado => ({
      nombre: empleado.nombre_completo_empleado_gestor,
      cedula: empleado.numero_socio_empleado_gestor,
      compensacion_base:
      empleado.moneda_pago_empleado_gestor === "dolares"
        ? formatCurrencyUSD(empleado.salario_base_empleado_gestor)
        : empleado.moneda_pago_empleado_gestor === "colones_y_dolares"
        ? `${formatCurrency(empleado.salario_base_empleado_gestor)} / ${formatCurrencyUSD(empleado.salario_base_empleado_gestor)}`
        : formatCurrency(empleado.salario_base_empleado_gestor),
      devengado: "0", // Por el momento en cero
      cargas_sociales: "0", // Por el momento en cero
      monto_neto: "0", // Por el momento en cero
      accion: "",
      estado: "Pendiente", // Siempre pendiente
   }));
};

/**
 * Función para generar datos de subtabla basados en los arrays de la API
 * @param {Array} planillaData - Datos de la API
 * @returns {Object} Datos de subtabla organizados por cédula
 */
const generarDatosSubtabla = (planillaData) => {
   if (!planillaData || !Array.isArray(planillaData)) return {};
   
   const subtableData = {};
   
   planillaData.forEach(empleado => {
      const cedula = empleado.numero_socio_empleado_gestor;
      const detalles = [];
      
      // Agregar aumentos
      if (empleado.aumentos && Array.isArray(empleado.aumentos)) {
         empleado.aumentos.forEach(aumento => {
            detalles.push({
               categoria: "Aumento",
               tipoAccion: "Aumento",
               monto: formatCurrency(aumento.monto_aumento_gestor) || "0",
               tipo: "+",
               estado: aumento.estado_planilla_aumento_gestor || "Pendiente"
            });
         });
      }
      
      // Agregar rebajos a compensación
      if (empleado.rebajos_compensacion && Array.isArray(empleado.rebajos_compensacion)) {
         empleado.rebajos_compensacion.forEach(rebajo => {
            detalles.push({
               categoria: "Rebajo Compensación",
               tipoAccion: "Deducción",
               monto: rebajo.monto_rebajo_calculado || "0",
               tipo: "-",
               estado: rebajo.estado_rebajo || "Pendiente"
            });
         });
      }
      
      // Agregar horas extras
      if (empleado.horas_extras && Array.isArray(empleado.horas_extras)) {
         empleado.horas_extras.forEach(horaExtra => {
            detalles.push({
               categoria: "Horas Extras",
               tipoAccion: "Ingreso",
               monto: horaExtra.monto_compensacion_calculado_gestor || "0",
               tipo: "+",
               estado: horaExtra.estado_compensacion_extra_gestor || "Pendiente"
            });
         });
      }
      
      // Agregar compensación por métrica
      if (empleado.compensacion_metrica && Array.isArray(empleado.compensacion_metrica)) {
         empleado.compensacion_metrica.forEach(compensacion => {
            detalles.push({
               categoria: "Compensación Métrica",
               tipoAccion: "Ingreso",
               monto: compensacion.monto_compensacion_metrica_gestor || "0",
               tipo: "+",
               estado: compensacion.estado_compensacion_metrica_gestor || "Pendiente"
            });
         });
      }
      
      subtableData[cedula] = detalles;
   });
   
   return subtableData;
};

/**
 * ================
 * UTILITY FUNCTIONS
 * ================ 
 */

/**
 * Genera el estilo para las celdas de la tabla principal
 * @param {Object} col - Definición de la columna
 * @param {boolean} isSelected - Indica si la fila está seleccionada
 * @param {number} idx - Índice de la fila
 * @returns {Object} Objeto de estilos CSS
 */
const getTableCellStyle = (col, isSelected, idx) => ({
   ...col.style,
   borderRight: "1px solid #dee2e6",
   borderLeft: "1px solid #dee2e6",
   background: !isSelected && idx % 2 !== 0 ? "#f8f9fa" : undefined,
});

/**
 * Genera el estilo para los encabezados de la tabla
 * @param {Object} col - Definición de la columna
 * @returns {Object} Objeto de estilos CSS
 */
const getTableHeaderStyle = (col) => ({
   ...col.style,
   background: "#e9ecef",
   borderBottom: "2px solid #adb5bd",
   borderTop: "2px solid #adb5bd",
   textAlign: "center",
});

/**
 * =========================
 * COMPONENTS
 * =========================
 */

/**
 * Componente de skeleton loader para las filas de la tabla
 * @param {number} count - Número de filas skeleton a mostrar
 * @param {Array} columns - Definición de columnas para generar el número correcto de celdas
 * @returns {JSX.Element} Filas skeleton
 */
const TableSkeleton = ({ count = 5, columns = PAYROLL_COLUMNS }) => {
   return (
      <>
         {Array.from({ length: count }, (_, index) => (
            <tr key={`skeleton-${index}`} className="skeleton-row">
               {/* Checkbox column */}
               <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <div className="skeleton-text" style={{ height: "16px", width: "16px", borderRadius: "4px", margin: "0 auto" }}></div>
               </td>
               {/* Data columns */}
               {columns.map((col, colIndex) => (
                  <td key={`skeleton-col-${colIndex}`} style={{ padding: "12px 8px" }}>
                     <div 
                        className="skeleton-text" 
                        style={{ 
                           height: "16px", 
                           width: `${Math.random() * 40 + 50}%`, 
                           borderRadius: "4px" 
                        }}
                     ></div>
                  </td>
               ))}
            </tr>
         ))}
      </>
   );
};

/**
 * Componente para mostrar los detalles de acciones de un empleado
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.columns - Definición de columnas
 * @param {Array} props.data - Datos a mostrar
 * @param {string} props.employeeName - Nombre del empleado
 * @returns {JSX.Element} Tabla de detalles
 */
const SubTable = ({ columns, data, employeeName }) => {
   return (
      <div className="employee-details-block mb-4">
         <div className="details-header">
            <i className="fas fa-user me-2"></i>
            Detalles de Acciones de personal: <b>{employeeName}</b>
         </div>
         <div className="details-table-wrapper">
            {(!data || data.length === 0) ? (
               <div className="text-center py-3 text-muted">
                  No hay datos disponibles para {employeeName}
               </div>
            ) : (
               <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                     <thead>
                        <tr>
                           {columns.map((col) => (
                              <th
                                 key={col.key}
                                 style={{
                                    ...col.style,
                                    fontSize: "0.95rem",
                                    padding: "8px 12px",
                                    textAlign: "center",
                                 }}
                              >
                                 {col.label}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {data.map((row, idx) => (
                           <tr key={idx} style={{ fontSize: "0.93rem" }}>
                              {columns.map((col) => (
                                 <td
                                    key={col.key}
                                    style={{
                                       padding: "8px 12px",
                                       textAlign: col.key === "estado" || col.key === "tipo" ? "center" : col.type === "number" ? "right" : "left",
                                    }}
                                 >
                                    {col.key === "tipo" ? (
                                       <span
                                          className={`badge bg-light-${row[col.key] === "+" ? "success" : "danger"}`}
                                          style={{ fontSize: "0.80rem" }}
                                       >
                                          {row[col.key]}
                                       </span>
                                    ) : col.key === "estado" ? (
                                       <span
                                          className={`badge bg-light-${row[col.key] === "Pendiente" ? "warning" : "success"}`}
                                          style={{ fontSize: "0.80rem" }}
                                       >
                                          {row[col.key]}
                                       </span>
                                    ) : col.key === "monto" ? (
                                       <span style={{ fontWeight: 500, color: "#2d3748" }}>${row[col.key]}</span>
                                    ) : (
                                       row[col.key]
                                    )}
                                 </td>
                              ))}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
   );
};

/**
 * Componente principal de la tabla de planilla con funcionalidad de selección y expansión
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Tabla de planilla
 */
const PayrollTable = ({
   columns,
   pageRows,
   selectedRows,
   onCheckboxChange,
   startIdx,
   disabled,
   planillaEstado,
   expandedRows,
   onRowToggle,
   subtableData,
   isLoading = false,
   pageSize = 5,
}) => {
   return (
      <table
         className="table table-hover table-bordered table-striped datatable-table align-middle"
         style={{
            minWidth: 1200,
            fontSize: "0.95rem",
            borderCollapse: "separate",
            borderSpacing: 0,
         }}
      >
         <thead className="table-light sticky-top" style={{ zIndex: 2 }}>
            <tr>
               <th style={{ width: 40, textAlign: "center" }}></th>
               {columns.map((col) => (
                  <th key={col.key} style={getTableHeaderStyle(col)}>
                     {col.label}
                  </th>
               ))}
            </tr>
         </thead>
         <tbody>
            {isLoading ? (
               <TableSkeleton count={pageSize || 5} columns={columns} />
            ) : (
               pageRows.map((row, idx) => {
                  const globalIdx = startIdx + idx;
                  const isSelected = selectedRows.includes(globalIdx);
                  const isExpanded = expandedRows.includes(globalIdx);
                  const rowDisabled = disabled || planillaEstado === "Procesada";
                  const employeeData = subtableData[row.cedula] || [];

                  return (
                     <React.Fragment key={globalIdx}>
                        <tr
                           className={`${isSelected ? "fila-seleccionada" : ""} ${isExpanded ? "table-active" : ""}`}
                           style={
                              rowDisabled
                                 ? { pointerEvents: "none", opacity: 0.7, background: "#f5f5f5" }
                                 : { cursor: "pointer" }
                           }
                           onClick={() => !rowDisabled && onRowToggle(globalIdx)}
                        >
                           <td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                              <input
                                 type="checkbox"
                                 checked={isSelected}
                                 onChange={() => onCheckboxChange(idx)}
                                 aria-label={`Seleccionar fila ${globalIdx + 1}`}
                                 disabled={rowDisabled}
                              />
                           </td>
                           {columns.map((col) => (
                              <td
                                 key={col.key}
                                 style={getTableCellStyle(col, isSelected, idx)}
                                 onClick={(e) => {
                                    if (col.key === "accion") {
                                       e.stopPropagation();
                                    }
                                 }}
                              >
                                 {col.key === "accion" ? (
                                    <button
                                       className="btn btn-primary btn-sm"
                                       onClick={() => {
                                          console.log("Ver detalle para:", row.nombre);
                                          alert(`Ver detalle de ${row.nombre}`);
                                       }}
                                       disabled={rowDisabled}
                                    >
                                       <i className="fas fa-eye"> Ver detalle</i>
                                    </button>
                                 ) : col.key === "estado" ? (
                                    <span
                                       className={`badge bg-light-${
                                          row[col.key] === "Verificado" ? "success" : "danger"
                                       }`}
                                    >
                                       {row[col.key]}
                                    </span>
                                 ) : (
                                    row[col.key]
                                 )}
                              </td>
                           ))}
                        </tr>
                        {isExpanded && (
                           <tr>
                              <td colSpan={columns.length + 1} style={{ padding: 0, border: "none" }}>
                                 <SubTable
                                    columns={SUBTABLE_COLUMNS}
                                    data={employeeData}
                                    employeeName={row.nombre}
                                 />
                              </td>
                           </tr>
                        )}
                     </React.Fragment>
                  );
               })
            )}
         </tbody>
      </table>
   );
};

/**
 * Componente de paginación reutilizable
 * @param {Object} props - Propiedades del componente
 * @returns {JSX.Element} Componente de paginación
 */
const TablePagination = ({
   pageSize,
   pageSizes,
   currentPage,
   totalPages,
   onPageSizeChange,
   onPageChange,
}) => {
   const pages = useMemo(() => {
      const arr = [];
      for (let i = 1; i <= totalPages; i++) {
         arr.push(
            <li key={i} className={`dt-paging-button page-item${currentPage === i ? " active" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-current={currentPage === i ? "page" : undefined}
                  onClick={() => onPageChange(i)}
               >
                  {i}
               </button>
            </li>
         );
      }
      return arr;
   }, [currentPage, totalPages, onPageChange]);

   return (
      <div className="d-flex justify-content-end align-items-center mt-2 mb-2">
         <label className="me-2 mb-0" htmlFor="pageSizeSelect">
            Filas por página:
         </label>
         <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={onPageSizeChange}
            className="form-select d-inline-block me-3"
            style={{ width: 90 }}
         >
            {pageSizes.map((size) => (
               <option key={size} value={size}>
                  {size}
               </option>
            ))}
         </select>
         <ul className="pagination justify-content-center my-2 mb-0">
            <li className={`dt-paging-button page-item${currentPage === 1 ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="First"
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
               >
                  «
               </button>
            </li>
            <li className={`dt-paging-button page-item${currentPage === 1 ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Previous"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
               >
                  ‹
               </button>
            </li>
            {pages}
            <li className={`dt-paging-button page-item${currentPage === totalPages ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Next"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
               >
                  ›
               </button>
            </li>
            <li className={`dt-paging-button page-item${currentPage === totalPages ? " disabled" : ""}`}>
               <button
                  className="page-link"
                  type="button"
                  aria-label="Last"
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
               >
                  »
               </button>
            </li>
         </ul>
      </div>
   );
};

/**
 * =========================
 * CUSTOM HOOKS
 * =========================
 */

/**
 * Hook personalizado para manejar la selección de filas
 * @param {Object} params - Parámetros del hook
 * @returns {Function} Función para manejar cambios de checkbox
 */
const useHandleCheckbox = ({ rows, selectedRows, startIdx, setSelectedRows }) => {
   return useCallback(
      (idx) => {
         const globalIdx = startIdx + idx;
         const isCurrentlySelected = selectedRows.includes(globalIdx);
         const shouldSelect = !isCurrentlySelected;

         setSelectedRows((prev) =>
            shouldSelect ? [...prev, globalIdx] : prev.filter((i) => i !== globalIdx)
         );
      },
      [rows, selectedRows, startIdx, setSelectedRows]
   );
};

/**
 * Hook personalizado para manejar la expansión de filas
 * @param {Object} params - Parámetros del hook
 * @returns {Function} Función para manejar toggle de filas
 */
const useHandleRowToggle = ({ expandedRows, setExpandedRows }) => {
   return useCallback(
      (globalIdx) => {
         setExpandedRows((prev) =>
            prev.includes(globalIdx) ? prev.filter((i) => i !== globalIdx) : [...prev, globalIdx]
         );
      },
      [expandedRows, setExpandedRows]
   );
};

/**
 * =========================
 * MAIN COMPONENT
 * =========================
 */

/**
 * Componente principal para la generación de planillas
 * Permite seleccionar planillas, visualizar datos de empleados y gestionar la información
 * @returns {JSX.Element} Componente de generación de planillas
 */
export const PayrollGenerator = () => {
   // Estados principales
   const [rows, setRows] = useState([]);
   const [selectedRows, setSelectedRows] = useState([]);
   const [expandedRows, setExpandedRows] = useState([]);
   const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
   const [currentPage, setCurrentPage] = useState(1);

   // Estados de configuración
   const [planillaSeleccionada, setPlanillaSeleccionada] = useState("");

   // Estados para la API
   const [planillaData, setPlanillaData] = useState(null);
   const [planillasList, setPlanillasList] = useState([]);
   const [loading, setLoading] = useState(false);
   const [loadingPlanillas, setLoadingPlanillas] = useState(false);
   const [error, setError] = useState(null);

   // Hook de Redux
   const dispatch = useDispatch();

   // Obtener datos de la planilla seleccionada
   const selectedPlanilla = planillasList.find(
      (p) => String(p.planilla_id) === String(planillaSeleccionada)
   );

   
   const planillaEstado = selectedPlanilla?.planilla_estado;
   const empresaSeleccionada = selectedPlanilla?.empresa_id;
   const tipoPlanilla = selectedPlanilla?.planilla_tipo;

   // Cargar datos de planilla cuando se selecciona una
   useEffect(() => {
      const cargarDatosPlanilla = async () => {
         if (!planillaSeleccionada || !empresaSeleccionada) {
            setPlanillaData(null);
            setRows([]);
            return;
         }

         try {
            setLoading(true);
            setError(null);

            const params = {
               empresa_id: empresaSeleccionada,
               planilla_id: planillaSeleccionada,
               tipo_planilla: tipoPlanilla,
            };



            const response = await dispatch(fetchData_api(params, "gestor/planilla/gestor"));

            if (response.success && response.data.array?.length > 0) {
               setPlanillaData(response.data.array);
            } else {
               setError("Error al cargar los datos de la planilla");
               setPlanillaData(null);
            }
         } catch (error) {
            console.error("Error al cargar datos de planilla:", error);
            setError("Error de conexión al cargar los datos");
            setPlanillaData(null);
         } finally {
            setLoading(false);
         }
      };

      cargarDatosPlanilla();
   }, [dispatch, planillaSeleccionada, empresaSeleccionada]);

   // Actualizar rows cuando cambien los datos de la planilla
   useEffect(() => {
      if (planillaData && Array.isArray(planillaData)) {
         const datosTransformados = transformarDatosPlanilla(planillaData);
         setRows(datosTransformados);;
      } else {
         setRows([]);
      }
   }, [planillaData]);

   // Cargar lista de planillas disponibles
   useEffect(() => {
      const cargarListaPlanillas = async () => {
         try {
            setLoadingPlanillas(true);
            setError(null);

            const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));

            if (response.success && response.data.array?.length > 0) {
               setPlanillasList(response.data.array || []);
            } else {
               console.error("Error en la respuesta de lista de planillas:", response);
               setError("Error al cargar la lista de planillas");
            }
         } catch (error) {
            console.error("Error al cargar lista de planillas:", error);
            setError("Error de conexión al cargar la lista de planillas");
         } finally {
            setLoadingPlanillas(false);
         }
      };

      cargarListaPlanillas();
   }, [dispatch]);

   // Cálculos de paginación
   const startIdx = (currentPage - 1) * pageSize;
   const totalPages = Math.ceil(rows.length / pageSize);
   const pageRows = rows.slice(startIdx, startIdx + pageSize);

   // Handlers
   const handleCheckbox = useHandleCheckbox({
      rows,
      selectedRows,
      startIdx,
      setSelectedRows,
   });

   const handleRowToggle = useHandleRowToggle({
      expandedRows,
      setExpandedRows,
   });

   const handlePageSizeChange = useCallback((e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1);
   }, []);

   const handlePageChange = useCallback(
      (page) => {
         if (page >= 1 && page <= Math.ceil(rows.length / pageSize)) {
            setCurrentPage(page);
         }
      },
      [rows.length, pageSize]
   );

   const handlePlanillaChange = useCallback((e) => {
      setPlanillaSeleccionada(e.target.value);
   }, []);

   // IDs únicos para accesibilidad
   const planillaSelectId = "planillaSelect";

   return (
      <div className="container-fluid">
         {/* Estilos globales */}
         <style>
            {`
               .table-hover tbody tr:hover {
                  background-color: #e2e6ea !important;
               }
               .table th, .table td {
                  vertical-align: middle !important;
               }
               .fila-seleccionada {
                  background-color: #b6fcb6 !important;
               }
               .table-active {
                  background-color: #e3f2fd !important;
                  border-left: 4px solid #2196f3 !important;
               }
               .subtable-container {
                  transition: all 0.3s ease-in-out;
               }
               .btn-outline-secondary:hover {
                  background-color: #6c757d;
                  border-color: #6c757d;
                  color: white;
               }
               
               /* Skeleton loading animation */
               .skeleton-text {
                  animation: skeleton-loading 1.5s ease-in-out infinite;
                  background: linear-gradient(90deg, #e9ecef 25%, #f8f9fa 50%, #e9ecef 75%);
                  background-size: 200% 100%;
               }
               
               @keyframes skeleton-loading {
                  0% {
                     background-position: 200% 0;
                  }
                  100% {
                     background-position: -200% 0;
                  }
               }
               
               .skeleton-row {
                  pointer-events: none;
               }
               
               .skeleton-row td {
                  border: 1px solid #dee2e6 !important;
               }
               .employee-details-block {
                  background: #fff;
                  border: 1.5px solid #e3e6f0;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
                  margin: 12px 0 24px 0;
                  padding: 0 0 12px 0;
                  transition: box-shadow 0.2s;
               }
               .employee-details-block:hover {
                  box-shadow: 0 4px 16px rgba(44,62,80,0.10);
               }
               .details-header {
                  background: #f1f3f6;
                  border-bottom: 1.5px solid #e3e6f0;
                  font-size: 1.08rem;
                  font-weight: 600;
                  color: #2d3748;
                  padding: 10px 18px;
                  border-radius: 8px 8px 0 0;
                  display: flex;
                  align-items: center;
               }
               .details-table-wrapper {
                  padding: 10px 18px 0 18px;
               }
               .details-table-wrapper table {
                  font-size: 0.95rem;
               }
               .details-table-wrapper th, .details-table-wrapper td {
                  padding: 6px 10px !important;
               }
               .details-table-wrapper th {
                  background: #f8fafc;
                  color: #495057;
               }
               .details-table-wrapper td {
                  background: #fff;
               }
            `}
         </style>

         <div className="row">
            <div className="col-12">
               <div className="card shadow-sm">
                  <div className="card-body">
                     {/* Indicadores de estado */}
                     {loading && (
                        <div className="alert alert-info text-center">
                           <i className="fas fa-spinner fa-spin me-2"></i>
                           Cargando empleados de la planilla... Esto puede tomar unos segundos.
                        </div>
                     )}

                     {loadingPlanillas && (
                        <div className="alert alert-info text-center">
                           <i className="fas fa-spinner fa-spin me-2"></i>
                           Cargando lista de planillas...
                        </div>
                     )}

                     {error && (
                        <div className="alert alert-danger text-center">
                           <i className="fas fa-exclamation-triangle me-2"></i>
                           {error}
                        </div>
                     )}

                     {planillaData && !loading && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Datos de planilla cargados exitosamente
                        </div>
                     )}

                     {planillasList.length > 0 && !loadingPlanillas && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Lista de planillas cargada exitosamente ({planillasList.length} planillas disponibles)
                        </div>
                     )}

                     {/* Selector de planilla */}
                     <div className="mb-3">
                        <label htmlFor={planillaSelectId} className="form-label">
                           Tipo de Planilla
                        </label>
                        <select
                           className="form-select"
                           id={planillaSelectId}
                           value={planillaSeleccionada}
                           onChange={handlePlanillaChange}
                           disabled={loadingPlanillas}
                        >
                           <option value="">Seleccione un tipo de planilla</option>
                           {planillasList.length > 0 ? (
                              planillasList.map((planilla) => (
                                 <option key={planilla.planilla_id} value={planilla.planilla_id}>
                                    {planilla.planilla_codigo} - {planilla.planilla_tipo} ({planilla.planilla_estado})
                                 </option>
                              ))
                           ) : (
                              <option value="" disabled>
                                 {loadingPlanillas ? "Cargando planillas..." : "No hay planillas disponibles"}
                              </option>
                           )}
                        </select>
                     </div>

                     {/* Tabla principal */}
                     {empresaSeleccionada && planillaSeleccionada && selectedPlanilla && (
                        <>
                           <div className="table-responsive" style={{ overflowX: "auto" }}>
                              <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                                 <div className="datatable-container">
                                    <PayrollTable
                                       columns={PAYROLL_COLUMNS}
                                       pageRows={pageRows}
                                       selectedRows={selectedRows}
                                       onCheckboxChange={
                                          planillaEstado === "En Proceso" || planillaEstado === "Activa"
                                             ? handleCheckbox
                                             : () => {}
                                       }
                                       startIdx={startIdx}
                                       disabled={false}
                                       planillaEstado={planillaEstado}
                                       expandedRows={expandedRows}
                                       onRowToggle={handleRowToggle}
                                       subtableData={generarDatosSubtabla(planillaData)}
                                       isLoading={loading}
                                       pageSize={pageSize}
                                    />
                                 </div>
                              </div>
                           </div>

                           {/* Paginación */}
                           <TablePagination
                              pageSize={pageSize}
                              pageSizes={PAGE_SIZES}
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageSizeChange={handlePageSizeChange}
                              onPageChange={handlePageChange}
                           />
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

/**
 * Exportamos también con el nombre original para mantener compatibilidad
 */
export const GenerarPlanilla = PayrollGenerator;