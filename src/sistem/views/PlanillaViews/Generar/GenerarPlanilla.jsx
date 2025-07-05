import React, { useState, useMemo, useCallback } from "react";
import * as XLSX from 'xlsx';

/**
 * =========================
 * CONSTANTS & CONFIGURATION    
 * =========================
*/

/** Payroll table column definitions */
const PAYROLL_COLUMNS = [
   { key: "nombre", label: "Nombre", style: { minWidth: 180 } },
   { key: "cedula", label: "Cédula", style: { minWidth: 100 } },
   { key: "asegurado", label: "# De Asegurado" },
   { key: "semana", label: "Semana", type: "number" },
   { key: "bruta", label: "Remuneración Bruta", type: "number" },
   { key: "fcl", label: "FCL 1,5% ROB 3,25%", type: "number" },
   { key: "rebajosCliente", label: "Rebajos de Cliente", type: "number" },
   { key: "reintegroCliente", label: "Reintegro de Cliente", type: "number" },
   { key: "deposito", label: "Deposito X Tecurso", type: "number" },
   { key: "cuota", label: "Cuota CC.SS", type: "number" },
   { key: "rebajosOPU", label: "Rebajos OPU", type: "number" },
   { key: "reintegrosOPU", label: "Reintegros OPU", type: "number" },
   { key: "totalDeducciones", label: "Total de Deducciones", type: "number" },
   { key: "totalReintegros", label: "Total de Reintegros", type: "number" },
   { key: "neta", label: "Remuneración Neta", type: "number" },
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
      asegurado: "12345",
      semana: "1",
      bruta: "50000.00",
      fcl: "750.00",
      rebajosCliente: "0.00",
      reintegroCliente: "0.00",
      deposito: "50750.00",
      cuota: "2500.00",
      rebajosOPU: "0.00",
      reintegrosOPU: "0.00",
      totalDeducciones: "2500.00",
      totalReintegros: "0.00",
      neta: "48250.00",
      marca_epd: 0,
   },
   {
      nombre: "María García",
      cedula: "987654321",
      asegurado: "67890",
      semana: "1",
      bruta: "45000.00",
      fcl: "675.00",
      rebajosCliente: "1000.00",
      reintegroCliente: "500.00",
      deposito: "45175.00",
      cuota: "2250.00",
      rebajosOPU: "0.00",
      reintegrosOPU: "0.00",
      totalDeducciones: "3250.00",
      totalReintegros: "500.00",
      neta: "42925.00",
      marca_epd: 1,
   },
   {
      nombre: "Carlos López",
      cedula: "456789123",
      asegurado: "11111",
      semana: "1",
      bruta: "60000.00",
      fcl: "900.00",
      rebajosCliente: "0.00",
      reintegroCliente: "0.00",
      deposito: "60900.00",
      cuota: "3000.00",
      rebajosOPU: "0.00",
      reintegrosOPU: "0.00",
      totalDeducciones: "3000.00",
      totalReintegros: "0.00",
      neta: "57900.00",
      marca_epd: 0,
   },
];

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
 * Devuelve el estilo para las celdas de la tabla de resumen.
 * @param {string} type - Tipo de celda (header, total, etc).
 * @returns {object} Objeto de estilo CSS.
 */
function getSummaryCellStyle(type) {
   switch (type) {
      case "header":
         return { background: "#a3bde3" };
      case "total":
         return { fontSize: "1.2rem", color: "#fff", background: "#4a74b5" };
      case "totalLabel":
         return { background: "#a3bde3", fontSize: "1.1rem" };
      default:
         return {};
   }
}

/**
 * =========================
 * UTILITY FUNCTIONS
 * =========================
 */

/**
 * Formatea un valor numérico como moneda en formato costarricense.
 * @param {number} value - El valor numérico a formatear
 * @param {number} [decimals=2] - Número de decimales a mostrar
 * @returns {string} - Valor formateado como moneda
 */
function formatCurrency(value, decimals = 2) {
   if (value === null || value === undefined || isNaN(value)) return "₡0.00";
   return `₡${Number(value).toLocaleString("es-CR", { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
   })}`;
}

/**
 * Suma un campo numérico para todas las filas.
 * @param {Array<Object>} rows - Arreglo de filas con datos
 * @param {string} field - Nombre del campo a sumar
 * @returns {number} - Suma total del campo especificado
 */
function sumColumn(rows, field) {
   return rows.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);
}

/**
 * =========================
 * COMPONENTS
 * =========================
 */

/**
 * PayrollTable
 * Tabla principal editable con selección de filas.
 */
function PayrollTable({
   columns,
   rows,
   pageRows,
   selectedRows,
   onCheckboxChange,
   onInputChange,
   startIdx,
   disabled,
   planillaEstado,
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
               const rowDisabled = disabled || (planillaEstado === "Procesada") || 
                                 (planillaEstado === "Activa" && row.marca_epd === 1);
               return (
                  <tr
                     key={globalIdx}
                     className={isSelected ? "fila-seleccionada" : ""}
                     style={
                        rowDisabled
                           ? { pointerEvents: "none", opacity: 0.7, background: "#f5f5f5" }
                           : {}
                     }
                  >
                     <td style={{ textAlign: "center" }}>
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
                        >
                           {col.type === "number" && !["neta", "totalReintegros"].includes(col.key) ? (
                              <input
                                 type="number"
                                 name={col.key}
                                 value={row[col.key]}
                                 onChange={(e) => onInputChange(e, idx)}
                                 onBlur={(e) => {
                                    if (col.key === 'semana') {
                                       const intVal = parseInt(e.target.value, 10) || 0;
                                       e.target.value = intVal;
                                    } else {
                                       const num = parseFloat(e.target.value) || 0;
                                       e.target.value = num.toFixed(2);
                                    }
                                    onInputChange(e, idx);
                                 }}
                                 className="form-control form-control-sm"
                                 step={col.key === 'semana' ? '1' : '0.01'}
                                 style={{
                                    minWidth: col.style?.minWidth || 80,
                                    background: "#fdfdfd",
                                 }}
                                 aria-label={col.label}
                                 disabled={rowDisabled}
                              />
                           ) : (
                              row[col.key]
                           )}
                        </td>
                     ))}
                  </tr>
               );
            })}
         </tbody>
         <tfoot>
            <tr style={{ background: "#f8f9fa", fontWeight: "bold" }}>
               <td></td>
               {columns.map((col) =>
                  col.type === "number" ? (
                     <td
                        key={col.key}
                        style={col.key === "neta" ? { color: "#198754", fontWeight: "bold" } : {}}
                     >
                        {formatCurrency(sumColumn(rows, col.key))}
                     </td>
                  ) : (
                     <td key={col.key}></td>
                  ),
               )}
            </tr>
         </tfoot>
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
 * SummaryTable
 * Tabla resumen reutilizable para operarios o datos financieros.
 */
function SummaryTable({ rows, selectedRows, montoPorOperario, setMontoPorOperario, totalTarifa, financialData }) {
   if (financialData) {
      const { montoTarifa, montoRemuneraciones, subtotal, iva, montoTotal } = financialData;
      return (
         <div style={{ maxWidth: 350 }}>
            <table
               className="table table-bordered"
               style={{ background: "#bcd2f7" }}
            >
               <tbody>
                  <tr>
                     <td
                        className="fw-bold"
                        style={getSummaryCellStyle("header")}
                     >
                        Monto de tarifa
                     </td>
                     <td className="text-end">
                        {formatCurrency(montoTarifa)}
                     </td>
                  </tr>
                  <tr>
                     <td
                        className="fw-bold"
                        style={getSummaryCellStyle("header")}
                     >
                        Monto de Remuneraciones
                     </td>
                     <td className="text-end">
                        {montoRemuneraciones ? formatCurrency(montoRemuneraciones) : "-"}
                     </td>
                  </tr>
                  <tr>
                     <td
                        className="fw-bold"
                        style={getSummaryCellStyle("header")}
                     >
                        Subtotal
                     </td>
                     <td className="text-end">
                        {formatCurrency(subtotal)}
                     </td>
                  </tr>
                  <tr>
                     <td
                        className="fw-bold"
                        style={getSummaryCellStyle("header")}
                     >
                        I V A
                     </td>
                     <td className="text-end">
                        {formatCurrency(iva)}
                     </td>
                  </tr>
                  <tr>
                     <td
                        className="fw-bold text-center"
                        colSpan={2}
                        style={getSummaryCellStyle("totalLabel")}
                     >
                        Monto Total
                     </td>
                  </tr>
                  <tr>
                     <td
                        className="fw-bold text-end"
                        colSpan={2}
                        style={getSummaryCellStyle("total")}
                     >
                        {formatCurrency(montoTotal)}
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      );
   }

   // Tabla de resumen de operarios
   const totalOperarios = rows.length;
   const totalSeleccionados = selectedRows ? selectedRows.length : 0;
   return (
      <div style={{ maxWidth: 300 }}>
         <table
            className="table table-bordered"
            style={{ background: "#bcd2f7" }}
         >
            <tbody>
               <tr>
                  <td
                     colSpan={2}
                     className="text-center fw-bold"
                     style={getSummaryCellStyle("header")}
                  >
                     Cantidad de Operarios
                  </td>
               </tr>
               <tr>
                  <td
                     colSpan={2}
                     className="text-center"
                  >
                     {totalOperarios}
                  </td>
               </tr>
               <tr>
                  <td
                     colSpan={2}
                     className="text-center fw-bold"
                     style={getSummaryCellStyle("header")}
                  >
                     Por administración
                  </td>
                  <td
                     colSpan={2}
                     className="text-center"
                  >
                     0
                  </td>
               </tr>
               <tr>
                  <td
                     colSpan={2}
                     className="text-center fw-bold"
                     style={getSummaryCellStyle("header")}
                  >
                     Total de Operarios
                  </td>
               </tr>
               <tr>
                  <td
                     colSpan={2}
                     className="text-center"
                  >
                     {totalSeleccionados}
                  </td>
               </tr>
               <tr>
                  <td
                     className="fw-bold"
                     style={getSummaryCellStyle("header")}
                  >
                     Monto X Operario
                  </td>
                  <td className="text-end fw-bold">
                     <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={montoPorOperario}
                        onChange={(e) => setMontoPorOperario(Number(e.target.value))}
                        className="form-control form-control-sm text-end"
                        style={{ background: "#eaf1fb", fontWeight: "bold" }}
                        aria-label="Monto por operario"
                     />
                  </td>
               </tr>
               <tr>
                  <td
                     className="fw-bold text-center"
                     colSpan={2}
                     style={getSummaryCellStyle("totalLabel")}
                  >
                     Total de Tarifa
                  </td>
               </tr>
               <tr>
                  <td
                     className="fw-bold text-end"
                     colSpan={2}
                     style={getSummaryCellStyle("total")}
                  >
                     {formatCurrency(totalTarifa)}
                  </td>
               </tr>
            </tbody>
         </table>
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
 * Maneja el cambio de input en una fila.
 */
function useHandleInputChange({ startIdx, setRows, setSelectedRows }) {
   return useCallback(
      (e, idx) => {
         const { name, value } = e.target;
         const globalIdx = startIdx + idx;

         // Actualiza el valor en la fila correspondiente
         setRows((prevRows) => {
            const updatedRows = prevRows.map((row, i) => {
               if (i !== globalIdx) return row;
               
               const updatedRow = { ...row, [name]: value };
               
               // Si cambiaron valores que afectan el cálculo de Deposito X Tecurso, actualizar ese valor
               if (["bruta", "fcl", "rebajosCliente", "reintegroCliente"].includes(name)) {
                  const bruta = parseFloat(updatedRow.bruta) || 0;
                  const fcl = parseFloat(updatedRow.fcl) || 0;
                  const rebajosCliente = parseFloat(updatedRow.rebajosCliente) || 0;
                  const reintegroCliente = parseFloat(updatedRow.reintegroCliente) || 0;
                  
                  // Aplicar la fórmula: Bruta + FCL - Rebajos + Reintegro
                  const deposito = Math.abs(bruta) + Math.abs(fcl) - Math.abs(rebajosCliente) + Math.abs(reintegroCliente);
                  updatedRow.deposito = deposito.toFixed(2);
               }
               
               // Si cambiaron valores que afectan el cálculo de Total de Deducciones, actualizar ese valor
               if (["rebajosCliente", "cuota"].includes(name)) {
                  const rebajosCliente = parseFloat(updatedRow.rebajosCliente) || 0;
                  const cuota = parseFloat(updatedRow.cuota) || 0;
                  
                  // Aplicar la fórmula: Rebajos de Cliente + Cuota CC.SS
                  const totalDeducciones = rebajosCliente + cuota;
                  updatedRow.totalDeducciones = totalDeducciones.toFixed(2);
               }
               
               // Si cambió el valor de Reintegro de Cliente, actualizar Total de Reintegros
               if (name === "reintegroCliente") {
                  const reintegroCliente = parseFloat(updatedRow.reintegroCliente) || 0;
                  updatedRow.totalReintegros = reintegroCliente.toFixed(2);
               }
               
               // Si cambiaron valores que afectan la Remuneración Neta, actualizar ese valor
               if (["bruta", "fcl", "rebajosCliente", "reintegroCliente", "cuota"].includes(name)) {
                  const bruta = parseFloat(updatedRow.bruta) || 0;
                  const fcl = parseFloat(updatedRow.fcl) || 0;
                  const rebajosCliente = parseFloat(updatedRow.rebajosCliente) || 0;
                  const reintegroCliente = parseFloat(updatedRow.reintegroCliente) || 0;
                  const cuota = parseFloat(updatedRow.cuota) || 0;
                  
                  // Aplicar la fórmula: Bruta + FCL - RebajosCliente + ReintegroCliente - Cuota
                  const neta = bruta + fcl - rebajosCliente + reintegroCliente - cuota;
                  updatedRow.neta = neta.toFixed(2);
               }
               
               return updatedRow;
            });
            return updatedRows;
         });

         // Si la fila estaba seleccionada, la deselecciona al editarla
         setSelectedRows((prevSelected) =>
            prevSelected.includes(globalIdx)
               ? prevSelected.filter((i) => i !== globalIdx)
               : prevSelected,
         );
      },
      [startIdx, setRows, setSelectedRows],
   );
}

/**
 * PayrollGenerator
 * Componente principal de la vista de generación de planilla.
 */
export const PayrollGenerator = () => {
   // Estados principales
   const [rows, setRows] = useState(MOCK_ROWS);
   const [selectedRows, setSelectedRows] = useState([1]); // Empleado 2 seleccionado por defecto
   const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
   const [currentPage, setCurrentPage] = useState(1);
   const [montoPorOperario, setMontoPorOperario] = useState(5669.23);
   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("1");
   const [planillaSeleccionada, setPlanillaSeleccionada] = useState("1");

   // Obtener el estado de la planilla seleccionada
   const selectedPlanilla = MOCK_PLANILLAS.find(
      (p) => String(p.planilla_id) === String(planillaSeleccionada),
   );
   const planillaEstado = selectedPlanilla?.planilla_estado;

   // Handler para aplicar planilla (solo visual)
   const handleAplicarPlanilla = () => {
      alert("Función de aplicar planilla (solo visual)");
   };

   // Calculamos el índice inicial para la paginación
   const startIdx = (currentPage - 1) * pageSize;
   
   // Derivados de los datos
   const totalPages = Math.ceil(rows.length / pageSize);
   const pageRows = rows.slice(startIdx, startIdx + pageSize);
   const totalTarifa = useMemo(
      () => montoPorOperario * selectedRows.length,
      [montoPorOperario, selectedRows.length],
   );
   const montoTarifa = totalTarifa;
   const montoRemuneraciones = useMemo(() => sumColumn(rows, "deposito"), [rows]);
   const subtotal = montoTarifa + montoRemuneraciones;
   const iva = subtotal * 0.13;
   const montoTotal = subtotal + iva;

   // Handler para gestionar los checkboxes
   const handleCheckbox = useHandleCheckbox({
      rows,
      selectedRows,
      startIdx,
      setSelectedRows,
   });

   // Handler para gestionar los cambios en inputs
   const handleInputChange = useHandleInputChange({
      startIdx,
      setRows,
      setSelectedRows,
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

   // Handler para cargar y procesar Excel de planilla (solo visual)
   const handleFileUpload = (e) => {
      const input = e.target;
      const file = input.files[0];
      if (!file) return;
      
      alert("Archivo cargado (solo visual): " + file.name);
      input.value = '';
   };

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
                `}
         </style>
         <div className="row">
            <div className="col-12">
               <div className="card shadow-sm">
                  <div className="card-body">
                  
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
                        >
                           <option value="">Seleccione un tipo de planilla</option>
                           {MOCK_PLANILLAS.map((planilla) => (
                              <option
                                 key={planilla.planilla_id}
                                 value={planilla.planilla_id}
                              >
                                 {planilla.planilla_codigo}
                              </option>
                           ))}
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
                                       rows={rows}
                                       pageRows={pageRows}
                                       selectedRows={selectedRows}
                                       onCheckboxChange={
                                          planillaEstado === "En Proceso" ||
                                          planillaEstado === "Activa"
                                             ? handleCheckbox
                                             : () => {}
                                       }
                                       onInputChange={
                                          planillaEstado === "En Proceso" ||
                                          planillaEstado === "Activa"
                                             ? handleInputChange
                                             : () => {}
                                       }
                                       startIdx={startIdx}
                                       disabled={false}
                                       planillaEstado={planillaEstado}
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