import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";


/**
 * =========================
 * CONSTANTS & CONFIGURATION    
 * =========================
*/

/** Payroll table column definitions */
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

/** Subtable column definitions */
const SUBTABLE_COLUMNS = [
   { key: "categoria", label: "Categoria", style: { minWidth: 150 } },
   { key: "tipoAccion", label: "Tipo de Accion", style: { minWidth: 100 } },
   { key: "monto", label: "Monto", type: "number", style: { minWidth: 120 } },
   { key: "tipo", label: "Tipo (+/-)", style: { minWidth: 120 } },
   { key: "estado", label: "Estado", style: { minWidth: 200 } },
];

const PAGE_SIZES = [5, 10, 30, 60, 80, 100];

const MOCK_PLANILLAS = [
   { planilla_id: "1", planilla_codigo: "PLAN-001", planilla_estado: "En Proceso" },
   { planilla_id: "2", planilla_codigo: "PLAN-002", planilla_estado: "Activa" },
   { planilla_id: "3", planilla_codigo: "PLAN-003", planilla_estado: "Procesada" },
];

const MOCK_ROWS = [
   {
      nombre: "Juan Pérez",
      cedula: "123456789",
      compensacion_base: "12345",
      devengado: "1",
      cargas_sociales: "50000.00",
      monto_neto: "750.00",
      accion: "",
      estado: "Verificado",
   },
   {
      nombre: "María García",
      cedula: "987654321",
      compensacion_base: "67890",
      devengado: "1",
      cargas_sociales: "45000.00",
      monto_neto: "675.00",
      accion: "",
      estado: "Verificado",
   },
   {
      nombre: "Carlos López",
      cedula: "456789123",
      compensacion_base: "11111",
      devengado: "1",
      cargas_sociales: "60000.00",
      monto_neto: "900.00",
      accion: "",
      estado: "Pendiente",
   },
];

// Mock data for subtables
const MOCK_SUBTABLE_DATA = {
   "123456789": [
      { categoria: "Salario Base", tipoAccion: "Ingreso", monto: "50000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "Horas Extra", tipoAccion: "Ingreso", monto: "15000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "ISR", tipoAccion: "Deducción", monto: "-8000.00", tipo: "-", estado: "Pendiente" },
      { categoria: "Seguro Social", tipoAccion: "Deducción", monto: "-3000.00", tipo: "-", estado: "Pendiente" },
   ],
   "987654321": [
      { categoria: "Salario Base", tipoAccion: "Ingreso", monto: "45000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "Bonificación", tipoAccion: "Ingreso", monto: "5000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "ISR", tipoAccion: "Deducción", monto: "-7000.00", tipo: "-", estado: "Pendiente" },
      { categoria: "Seguro Social", tipoAccion: "Deducción", monto: "-2700.00", tipo: "-", estado: "Pendiente" },
   ],
   "456789123": [
      { categoria: "Salario Base", tipoAccion: "Ingreso", monto: "60000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "Vacaciones", tipoAccion: "Ingreso", monto: "5000.00", tipo: "+", estado: "Pendiente" },
      { categoria: "ISR", tipoAccion: "Deducción", monto: "-10000.00", tipo: "-", estado: "Pendiente" },
      { categoria: "Seguro Social", tipoAccion: "Deducción", monto: "-3600.00", tipo: "-", estado: "Pendiente" },
   ],
};

/**
 * ================
 * STYLE FUNCTIONS
 * ================ 
 */

/**
 * Devuelve el estilo para las celdas de la tabla.
 * @param {object} col - Definición de la columna.
 * @param {boolean} isSelected - Si la fila está seleccionada.
 * @param {number} idx - Índice de la fila.
 * @returns {object} Objeto de estilo CSS.
 */
function getTableCellStyle(col, isSelected, idx) {
   return {
      ...col.style,
      borderRight: "1px solid #dee2e6",
      borderLeft: "1px solid #dee2e6",
      background: !isSelected && idx % 2 !== 0 ? "#f8f9fa" : undefined,
   };
}

/**
 * Devuelve el estilo para los encabezados de la tabla.
 * @param {object} col - Definición de la columna.
 * @returns {object} Objeto de estilo CSS.
 */
function getTableHeaderStyle(col) {
   return {
      ...col.style,
      background: "#e9ecef",
      borderBottom: "2px solid #adb5bd",
      borderTop: "2px solid #adb5bd",
      textAlign: "center",
   };
}



/**
 * =========================
 * UTILITY FUNCTIONS
 * =========================
 */





/**
 * =========================
 * COMPONENTS
 * =========================
 */

/**
 * SubTable
 * Tabla secundaria que muestra los detalles de cada empleado.
 */
function SubTable({ columns, data, employeeName }) {
   if (!data || data.length === 0) {
      return (
         <div className="text-center py-3 text-muted">
            No hay datos disponibles para {employeeName}
         </div>
      );
   }

   return (
      <div className="subtable-container" style={{ marginLeft: 20, marginRight: 20 }}>
         <div className="card border-0" style={{borderRadius: "0px"}}>
           
               <h6 className="mb-3 mt-3 p-2">
                 
                  Detalles de Acciones de personal: {employeeName}
               </h6>
          
            <div className="card-body p-0">
               <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                     <thead className="table-secondary">
                        <tr>
                           {columns.map((col) => (
                              <th
                                 key={col.key}
                                 style={{
                                    ...col.style,
                                    fontSize: "0.85rem",
                                    padding: "8px 12px",
                                    textAlign: "center",
                                    background: "#e9ecef",
                                    borderBottom: "2px solid #adb5bd",
                                 }}
                              >
                                 {col.label}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {data.map((row, idx) => (
                           <tr key={idx} style={{ fontSize: "0.85rem" }}>
                              {columns.map((col) => (
                                 <td
                                    key={col.key}
                                    style={{
                                       padding: "8px 12px",
                                       borderRight: "1px solid #dee2e6",
                                       borderLeft: "1px solid #dee2e6",
                                       background: idx % 2 !== 0 ? "#f8f9fa" : undefined,
                                       textAlign: col.key === "estado" || col.key === "tipo" ? "center" : col.type === "number" ? "right" : "left",
                                    }}
                                 >
                                    {col.key === "tipo" ? (
                                       <span
                                          className={`badge bg-light-${
                                             row[col.key] === "+" 
                                                ? "success" 
                                                : "danger"
                                          }`}
                                          style={{ fontSize: "0.75rem" }}
                                       >
                                          {row[col.key]}
                                       </span>
                                                                         ) : col.key === "estado" ? (
                                        <span
                                           className={`badge bg-light-${
                                              row[col.key] === "Pendiente" 
                                                 ? "warning" 
                                                 : "success"
                                           }`}
                                           style={{ fontSize: "0.75rem" }}
                                        >
                                           {row[col.key]}
                                        </span>
                                     )  : col.key === "monto" ? (
                                        <span>
                                           ${row[col.key]}
                                        </span>
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
            </div>
         </div>
      </div>
   );
}

/**
 * PayrollTable
 * Tabla principal editable con selección de filas y funcionalidad de expansión.
 */
function PayrollTable({
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
}) {
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
         <thead
            className="table-light sticky-top"
            style={{ zIndex: 2 }}
         >
            <tr>
               <th style={{ width: 40, textAlign: "center" }}></th>
               {columns.map((col) => (
                  <th
                     key={col.key}
                     style={getTableHeaderStyle(col)}
                  >
                     {col.label}
                  </th>
               ))}
            </tr>
         </thead>
         <tbody>
            {pageRows.map((row, idx) => {
               const globalIdx = startIdx + idx;
               const isSelected = selectedRows.includes(globalIdx);
               const isExpanded = expandedRows.includes(globalIdx);
               const rowDisabled = disabled || (planillaEstado === "Procesada");
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
                        {columns.map((col) => {
                           return (
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
                                    (() => {
                                       console.log(`Estado para ${row.nombre}:`, row[col.key], typeof row[col.key]);
                                       return (
                                          <span
                                             className={`badge bg-light-${
                                                row[col.key] === "Verificado" 
                                                   ? "success" 
                                                   : "danger"
                                             }`}
                                          >
                                             {row[col.key]}
                                          </span>
                                       );
                                    })()
                                 ) : (
                                    row[col.key]
                                 )}
                              </td>
                           );
                        })}
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
            })}
         </tbody>
      </table>
   );
}

/**
 * TablePagination
 * Componente de paginación reutilizable.
 */
function TablePagination({
   pageSize,
   pageSizes,
   currentPage,
   totalPages,
   onPageSizeChange,
   onPageChange,
}) {
   const pages = useMemo(() => {
      const arr = [];
      for (let i = 1; i <= totalPages; i++) {
         arr.push(
            <li
               key={i}
               className={`dt-paging-button page-item${currentPage === i ? " active" : ""}`}
            >
               <button
                  className="page-link"
                  type="button"
                  aria-current={currentPage === i ? "page" : undefined}
                  onClick={() => onPageChange(i)}
               >
                  {i}
               </button>
            </li>,
         );
      }
      return arr;
   }, [currentPage, totalPages, onPageChange]);

   return (
      <div className="d-flex justify-content-end align-items-center mt-2 mb-2">
         <label
            className="me-2 mb-0"
            htmlFor="pageSizeSelect"
         >
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
               <option
                  key={size}
                  value={size}
               >
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
            <li
               className={`dt-paging-button page-item${
                  currentPage === totalPages ? " disabled" : ""
               }`}
            >
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
            <li
               className={`dt-paging-button page-item${
                  currentPage === totalPages ? " disabled" : ""
               }`}
            >
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
}

/**
 * =========================
 * HANDLERS
 * =========================
 */

/**
 * Maneja el cambio de selección de una fila (checkbox).
 */
function useHandleCheckbox({ rows, selectedRows, startIdx, setSelectedRows }) {
   return useCallback(
      (idx) => {
         const globalIdx = startIdx + idx;
         const isCurrentlySelected = selectedRows.includes(globalIdx);
         const shouldSelect = !isCurrentlySelected;

         // Actualizar selectedRows localmente
         setSelectedRows((prev) =>
            shouldSelect
               ? [...prev, globalIdx]
               : prev.filter((i) => i !== globalIdx)
         );
      },
      [rows, selectedRows, startIdx, setSelectedRows],
   );
}

/**
 * Maneja la expansión/contracción de una fila.
 */
function useHandleRowToggle({ expandedRows, setExpandedRows }) {
   return useCallback(
      (globalIdx) => {
         setExpandedRows((prev) =>
            prev.includes(globalIdx)
               ? prev.filter((i) => i !== globalIdx)
               : [...prev, globalIdx]
         );
      },
      [expandedRows, setExpandedRows],
   );
}



/**
 * PayrollGenerator
 * Componente principal de la vista de generación de planilla.
 */
export const PayrollGenerator = () => {
   // Estados principales
   const [rows] = useState(MOCK_ROWS);
   
   // Debug: Verificar los datos
   const [selectedRows, setSelectedRows] = useState([]); // Sin selección por defecto
   const [expandedRows, setExpandedRows] = useState([]); // Filas expandidas
   const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
   const [currentPage, setCurrentPage] = useState(1);

   const [empresaSeleccionada] = useState("1");
   const [planillaSeleccionada, setPlanillaSeleccionada] = useState("");

   // Estados para la API
   const [planillaData, setPlanillaData] = useState(null);
   const [planillasList, setPlanillasList] = useState([]); // Lista de planillas desde API
   const [loading, setLoading] = useState(false);
   const [loadingPlanillas, setLoadingPlanillas] = useState(false);
   const [error, setError] = useState(null);

   // Hook de Redux
   const dispatch = useDispatch();

   // useEffect para cargar datos de la API al montar el componente
   useEffect(() => {
      const cargarDatosPlanilla = async () => {
         try {
            setLoading(true);
            setError(null);
            
            const response = await dispatch(fetchData_api(null, "gestor/planilla/gestor"));
            
 
            
            if (response.success && response.data.array?.length > 0) {
               setPlanillaData(response.data.array);
               console.log("Datos de planilla cargados exitosamente:", response.data.array);
            } else {
               console.error("Error en la respuesta de la API:", response);
               setError("Error al cargar los datos de la planilla");
            }
         } catch (error) {
            console.error("Error al cargar datos de planilla:", error);
            setError("Error de conexión al cargar los datos");
         } finally {
            setLoading(false);
         }
      };

      cargarDatosPlanilla();
   }, [dispatch]);

   // useEffect para cargar la lista de planillas
   useEffect(() => {
      const cargarListaPlanillas = async () => {
         try {
            setLoadingPlanillas(true);
            setError(null);
            
            const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));
            
            if (response.success && response.data.array?.length > 0) {  
               setPlanillasList(response.data.array || []);
               console.log("Lista de planillas cargada exitosamente:", response.data.array);
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

   // Obtener el estado de la planilla seleccionada
   const selectedPlanilla = planillasList.find(
      (p) => String(p.planilla_id) === String(planillaSeleccionada),
   );
   const planillaEstado = selectedPlanilla?.planilla_estado;



   // Calculamos el índice inicial para la paginación
   const startIdx = (currentPage - 1) * pageSize;
   
   // Derivados de los datos
   const totalPages = Math.ceil(rows.length / pageSize);
   const pageRows = rows.slice(startIdx, startIdx + pageSize);


   // Handler para gestionar los checkboxes
   const handleCheckbox = useHandleCheckbox({
      rows,
      selectedRows,
      startIdx,
      setSelectedRows,
   });

   // Handler para gestionar la expansión de filas
   const handleRowToggle = useHandleRowToggle({
      expandedRows,
      setExpandedRows,
   });

   // Handler para cambiar el tamaño de página
   const handlePageSizeChange = useCallback((e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(1);
   }, []);

   // Handler para cambio de página
   const handlePageChange = useCallback(
      (page) => {
         if (page >= 1 && page <= Math.ceil(rows.length / pageSize)) {
            setCurrentPage(page);
         }
      },
      [rows.length, pageSize],
   );

   // Handler para cambio de planilla
   const handlePlanillaChange = useCallback((e) => {
      setPlanillaSeleccionada(e.target.value);
   }, []);



   // IDs únicos para accesibilidad
   const planillaSelectId = "planillaSelect";

   // Renderizamos la interfaz de usuario
   return (
      <div className="container-fluid">
         {/* Estilos globales para tablas */}
         <style>
            {`
                /* Efecto hover para filas de tablas */
                .table-hover tbody tr:hover {
                    background-color: #e2e6ea !important;
                }
                /* Alineación vertical para celdas */
                .table th, .table td {
                    vertical-align: middle !important;
                }
                /* Estilo para filas seleccionadas */
                .fila-seleccionada {
                    background-color: #b6fcb6 !important;
                }
                /* Estilo para filas expandidas */
                .table-active {
                    background-color: #e3f2fd !important;
                    border-left: 4px solid #2196f3 !important;
                }
                /* Transición suave para la expansión */
                .subtable-container {
                    transition: all 0.3s ease-in-out;
                }
                /* Estilo para el botón de expansión */
                .btn-outline-secondary:hover {
                    background-color: #6c757d;
                    border-color: #6c757d;
                    color: white;
                }
                `}
         </style>
         <div className="row">
            <div className="col-12">
               <div className="card shadow-sm">
                  <div className="card-body">
                  
                     {/* Indicador de carga y errores */}
                     {loading && (
                        <div className="alert alert-info text-center">
                           <i className="fas fa-spinner fa-spin me-2"></i>
                           Cargando datos de planilla...
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

                     {/* Información de datos cargados */}
                     {planillaData && !loading && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Datos de planilla cargados exitosamente
                        </div>
                     )}

                     {/* Información de lista de planillas cargada */}
                     {planillasList.length > 0 && !loadingPlanillas && (
                        <div className="alert alert-success text-center">
                           <i className="fas fa-check-circle me-2"></i>
                           Lista de planillas cargada exitosamente ({planillasList.length} planillas disponibles)
                        </div>
                     )}

                     {/* Select de tipo de planilla */}
                     <div className="mb-3">
                        <label
                           htmlFor={planillaSelectId}
                           className="form-label"
                        >
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
                                 <option
                                    key={planilla.planilla_id}
                                    value={planilla.planilla_id}
                                 >
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


              

                     {/* Mostrar tablas */}
                     {empresaSeleccionada && planillaSeleccionada && (
                        <>
                           {/* Tabla principal de planilla */}
                           <div
                              className="table-responsive"
                              style={{ overflowX: "auto" }}
                           >
                              <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                                 <div className="datatable-container">
                                    <PayrollTable
                                       columns={PAYROLL_COLUMNS}
                                       pageRows={pageRows}
                                       selectedRows={selectedRows}
                                       onCheckboxChange={
                                          planillaEstado === "En Proceso" ||
                                          planillaEstado === "Activa"
                                             ? handleCheckbox
                                             : () => {}
                                       }
                                       startIdx={startIdx}
                                       disabled={false}
                                       planillaEstado={planillaEstado}
                                       expandedRows={expandedRows}
                                       onRowToggle={handleRowToggle}
                                       subtableData={MOCK_SUBTABLE_DATA}
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