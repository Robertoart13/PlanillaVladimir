import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";
import { Planilla_Lista_Empleado_Thunks } from "../../../../store/Planilla/Planilla_Lista_Empleado_Thunks";
import { Planilla_Insertar_Empleado_Planilla_Thunks } from "../../../../store/Planilla/Planilla_Insertar_Empleado_Planilla_Thunks";
import { Planilla_Aplicar_Thunks } from "../../../../store/Planilla/Planilla_Aplicar_Thunks";
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
 * Formatea un valor numérico como moneda en formato costarricense con coma para miles y punto para decimales, siempre dos decimales.
 * @param {number} value - El valor numérico a formatear
 * @returns {string} - Valor formateado como moneda
 */
function formatCurrency(value) {
   if (value === null || value === undefined || isNaN(value)) return "₡0.00";
   return (
      "₡" +
      Number(value)
         .toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
         })
   );
}

/**
 * Suma un campo numérico solo para las filas seleccionadas.
 * @param {Array<Object>} rows - Arreglo de filas con datos
 * @param {string} field - Nombre del campo a sumar
 * @param {Array<number>} selectedRows - Índices de las filas seleccionadas
 * @returns {number} - Suma total del campo especificado
 */
function sumColumn(rows, field, selectedRows) {
   if (field === "semana") return 0; // No sumar semanas
   return selectedRows.reduce((acc, rowIdx) => {
      const row = rows[rowIdx];
      // Convertir el valor a número, eliminando cualquier formato
      const value = row[field];
      const numericValue = typeof value === 'string' 
         ? parseFloat(value.replace(/[^\d.-]/g, '')) || 0 
         : parseFloat(value) || 0;
      return acc + numericValue;
   }, 0);
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
   onBlur,
   startIdx,
   disabled,
   planillaEstado,
   empleadosRaw,
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
               const isSelected = selectedRows.includes(globalIdx); // Lógica de deshabilitado por fila usando nuestra función de utilidad
               const rowDisabled =
                  esFilaDeshabilitada(planillaEstado, empleadosRaw, globalIdx) || disabled;
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
                           onChange={() => {
                              console.log(`Checkbox clicked for row ${globalIdx}, current state: ${isSelected}`);
                              onCheckboxChange(idx);
                           }}
                           aria-label={`Seleccionar fila ${globalIdx + 1}`}
                           disabled={rowDisabled}
                        />
                     </td>
                     {columns.map((col) => (
                        <td
                           key={col.key}
                           style={getTableCellStyle(col, isSelected, idx)}
                        >
                           {col.type === "number" && !["neta", "totalReintegros", "totalDeducciones"].includes(col.key) ? (
                              <input
                                 type="text"
                                 name={col.key}
                                 value={row[col.key]}
                                 onChange={(e) => onInputChange(e, idx)}
                                 onBlur={(e) => onBlur(e, idx)}
                                 className="form-control form-control-sm"
                                 style={{
                                    minWidth: col.style?.minWidth || 80,
                                    background: "#fdfdfd",
                                 }}
                                 aria-label={col.label}
                                 disabled={rowDisabled}
                              />
                           ) : col.type === "number" ? (
                              formatCurrency(row[col.key])
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
               <td></td>               {columns.map((col) =>
                  col.type === "number" ? (
                     <td
                        key={col.key}
                        style={col.key === "neta" ? { color: "#198754", fontWeight: "bold" } : {}}
                     >
                        {formatCurrency(sumColumn(rows, col.key, selectedRows))}
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
      const { montoTarifa, montoRemuneraciones, iva, montoTotal } = financialData;
      // Subtotal es la suma de montoTarifa y montoRemuneraciones
      const subtotal = montoTarifa + montoRemuneraciones;

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
                        {formatCurrency(montoRemuneraciones)}
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
                        {formatCurrency(iva, 2)}
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
                     {formatCurrency(montoPorOperario * selectedRows.length)}
                  </td>
               </tr>
            </tbody>
         </table>
      </div>
   );
}

/**
 * =========================
 * HELPERS & MAPPERS
 * =========================
 */

/**
 * Mapea un objeto de empleado de la API al formato de la tabla.
 * @param {object} emp - Objeto de empleado de la API
 * @param {number} i - Índice del empleado
 * @returns {object}
 */
function mapEmpleadoToRow(emp, i, semanaActual) {
   // Calcular valores numéricos base
   const bruta = parseFloat(emp.remuneracion_bruta_epd_tbl) || 0;
   const fcl = parseFloat(emp.fcl_1_5_epd_tbl) || 0;
   const rebajosCliente = parseFloat(emp.rebajos_cliente_epd_tbl) || 0;
   const reintegroCliente = parseFloat(emp.reintegro_cliente_epd_tbl) || 0;
   const cuota = parseFloat(emp.cuota_ccss_epd_tbl) || 0;
   
   // Calcular deposito según la fórmula: Bruta + FCL - Rebajos + Reintegro
   // Asegurar que todos los valores son positivos para la fórmula
   const deposito = bruta + fcl - rebajosCliente + reintegroCliente;
   
   // Calcular total deducciones según la fórmula: Rebajos de Cliente + Cuota CC.SS
   const totalDeducciones = rebajosCliente + cuota;
   
   // Total de Reintegros es igual a Reintegro de Cliente
   const totalReintegros = reintegroCliente;
   
   // Calcular Remuneración Neta según la fórmula: Bruta + FCL - RebajosCliente + ReintegroCliente - Cuota
   const neta = bruta + fcl - rebajosCliente + reintegroCliente - cuota;
   
   return {
      nombre: `${emp.nombre_empleado_emp_tbl || emp.nombre_empleado || ""} ${
         emp.apellidos_empleado_emp_tbl || emp.apellidos_empleado || ""
      }`.trim(),
      cedula: emp.cedula_empleado_emp_tbl || emp.cedula_empleado || "",
      asegurado: emp.asegurado_empleado || 0,
      semana:
         emp.semana_epd_tbl == null || emp.semana_epd_tbl === ""
            ? semanaActual.toString()
            : emp.semana_epd_tbl,
      bruta: emp.remuneracion_bruta_epd_tbl ?? bruta.toString(),
      fcl: emp.fcl_1_5_epd_tbl ?? fcl.toString(),
      rebajosCliente: emp.rebajos_cliente_epd_tbl ?? rebajosCliente.toString(),
      reintegroCliente: emp.reintegro_cliente_epd_tbl ?? reintegroCliente.toString(),
      deposito: emp.deposito_x_tecurso_epd_tbl ?? deposito.toString(),
      cuota: emp.cuota_ccss_epd_tbl ?? cuota.toString(),
      rebajosOPU: emp.rebajos_opu_epd_tbl ?? "0",
      reintegrosOPU: emp.reintegro_opu_epd_tbl ?? "0",
      totalDeducciones: emp.total_deducciones_epd_tbl ?? totalDeducciones.toString(),
      totalReintegros: emp.total_reintegros_epd_tbl ?? totalReintegros.toString(),
      neta: emp.remuneracion_neta_epd_tbl ?? neta.toString(),
      marca_epd: emp.marca_epd ?? 0,
   };
}

/**
 * Calcula el número de semana actual del año
 */
function getCurrentWeekNumber() {
   const now = new Date();
   const startOfYear = new Date(now.getFullYear(), 0, 1);
   const dayOfWeek = startOfYear.getDay() || 7; // 1 (lunes) ... 7 (domingo)
   const firstMonday = new Date(startOfYear);
   if (dayOfWeek !== 1) {
      firstMonday.setDate(startOfYear.getDate() + (8 - dayOfWeek));
   }
   const diff = now - firstMonday;
   const oneWeek = 1000 * 60 * 60 * 24 * 7;
   return diff >= 0 ? Math.ceil(diff / oneWeek) + 1 : 1;
}

/**
 * Obtiene empleados desde la API y actualiza los estados.
 */
/**
 * Obtiene empleados desde la API y actualiza los estados.
 * @param {Object} params - Parámetros de la función
 * @param {Function} params.dispatch - Función dispatch de Redux
 * @param {string} params.planillaSeleccionada - ID de la planilla seleccionada
 * @param {string} params.empresaSeleccionada - ID de la empresa seleccionada
 * @param {Function} params.setRows - Setter para filas de la tabla
 * @param {Function} params.setEmpleadosRaw - Setter para datos crudos de empleados
 * @param {Function} params.setSelectedRows - Setter para filas seleccionadas
 * @param {Function} params.setLoading - Setter para estado de carga
 */
async function fetchAndSetEmpleados({
   dispatch,
   planillaSeleccionada,
   empresaSeleccionada,
   setRows,
   setEmpleadosRaw,
   setSelectedRows,
   setLoading,
}) {
   setLoading(true);
   try {
      const empleadosRow = await dispatch(
         Planilla_Lista_Empleado_Thunks(planillaSeleccionada, empresaSeleccionada),
      );
      if (empleadosRow?.data?.array) {
         const semanaActual = getCurrentWeekNumber();
         const empleados = empleadosRow.data.array.map((emp, i) =>
            mapEmpleadoToRow(emp, i, semanaActual),
         );
         setRows(empleados);
         setEmpleadosRaw(empleadosRow.data.array);
         const seleccionados = empleadosRow.data.array
            .map((emp, i) => (emp.marca_epd === 1 ? i : null))
            .filter((i) => i !== null);
         setSelectedRows(seleccionados);
      }
   } catch (error) {
      console.error("Error al obtener empleados:", error);
   } finally {
      setLoading(false);
   }
}

/**
 * Inserta un empleado en la planilla seleccionada.
 * @param {Object} params - Parámetros de la función
 * @param {Function} params.dispatch - Función dispatch de Redux
 * @param {string} params.planillaSeleccionada - ID de la planilla seleccionada
 * @param {string} params.empresaSeleccionada - ID de la empresa seleccionada
 * @param {Object} params.datos - Datos del empleado a insertar
 * @returns {Promise<void>}
 */
async function insertartEmpleadoPlanilla({
   dispatch,
   planillaSeleccionada,
   empresaSeleccionada,
   datos,
   isSelected,
}) {
   try {
      await dispatch(
         Planilla_Insertar_Empleado_Planilla_Thunks(
            planillaSeleccionada,
            empresaSeleccionada,
            datos,
            isSelected,
         ),
      );
   } catch (error) {
      console.error("Error al insertar empleado en planilla:", error);
   }
}
/**
 * Maneja el cambio de selección de una fila (checkbox).
 */
function useHandleCheckbox({
   rows,
   empleadosRaw,
   selectedRows,
   startIdx,
   planillaSeleccionada,
   empresaSeleccionada,
   dispatch,
   setEmpleadosRaw,
   setSelectedRows,
}) {
   return useCallback(
      async (idx) => {
         const globalIdx = startIdx + idx;
         const isCurrentlySelected = selectedRows.includes(globalIdx);
         const shouldSelect = !isCurrentlySelected;

         try {
            // Llamar al thunk para actualizar selección en backend
            await insertartEmpleadoPlanilla({
               dispatch,
               planillaSeleccionada,
               empresaSeleccionada,
               datos: {
                  ...rows[globalIdx],
                  id_empleado_emp_tbl: empleadosRaw[globalIdx]?.id_empleado || empleadosRaw[globalIdx]?.id_empleado_emp_tbl,
               },
               isSelected: shouldSelect,
            });

            // Actualizar marca_epd localmente en empleadosRaw
            setEmpleadosRaw((prev) => {
               const updated = [...prev];
               const raw = updated[globalIdx] || {};
               updated[globalIdx] = { ...raw, marca_epd: shouldSelect ? 1 : 0 };
               return updated;
            });
            
            // Actualizar selectedRows localmente
            setSelectedRows((prev) => {
               if (shouldSelect) {
                  return [...prev, globalIdx];
               } else {
                  return prev.filter((i) => i !== globalIdx);
               }
            });
         } catch (error) {
            console.error("Error al actualizar selección:", error);
         }
      },
      [
         rows,
         empleadosRaw,
         selectedRows,
         startIdx,
         planillaSeleccionada,
         empresaSeleccionada,
         dispatch,
         setEmpleadosRaw,
         setSelectedRows,
      ],
   );
}

/**
 * Maneja el cambio de input en una fila.
 * @param {Object} params - Parámetros para el hook
 * @param {number} params.startIdx - Índice inicial para la paginación
 * @param {Function} params.setRows - Función para actualizar las filas
 * @param {Function} params.setSelectedRows - Función para actualizar las filas seleccionadas
 * @returns {Function} Función callback para manejar cambios en los inputs
 */
function useHandleInputChange({ startIdx, setRows, setSelectedRows }) {
   return useCallback(
      (e, idx) => {
         const { name, value } = e.target;
         const globalIdx = startIdx + idx;

         // Solo permitir dígitos, punto decimal y guión (para negativos)
         const numericValue = value.replace(/[^\d.-]/g, '');

         setRows((prevRows) => {
            const updatedRows = prevRows.map((row, i) => {
               if (i !== globalIdx) return row;

               // Usar los valores más recientes para todos los cálculos
               const nextRow = { ...row, [name]: numericValue };

               // Calcular deposito
               const bruta = parseFloat(nextRow.bruta) || 0;
               const fcl = parseFloat(nextRow.fcl) || 0;
               const rebajosCliente = parseFloat(nextRow.rebajosCliente) || 0;
               const reintegroCliente = parseFloat(nextRow.reintegroCliente) || 0;
               nextRow.deposito = (bruta + fcl - rebajosCliente + reintegroCliente).toString();

               // Calcular totalDeducciones
               const cuota = parseFloat(nextRow.cuota) || 0;
               const rebajosOPU = parseFloat(nextRow.rebajosOPU) || 0;
               nextRow.totalDeducciones = (rebajosCliente + cuota + rebajosOPU).toString();

               // Calcular totalReintegros
               const reintegrosOPU = parseFloat(nextRow.reintegrosOPU) || 0;
               nextRow.totalReintegros = (reintegroCliente + reintegrosOPU).toString();

               // Calcular neta
               nextRow.neta = (parseFloat(nextRow.deposito) - cuota - rebajosOPU + reintegrosOPU).toString();

               return nextRow;
            });
            return updatedRows;
         });
      },
      [startIdx, setRows, setSelectedRows],
   );
}

// Agregar un nuevo handler para onBlur que formatee el valor correctamente
function useHandleBlur({ startIdx, setRows }) {
   return useCallback(
      (e, idx) => {
         const { name, value } = e.target;
         const globalIdx = startIdx + idx;

         // Mantener el valor tal como se ingresó, solo asegurando que sea numérico
         const numericValue = value.replace(/[^\d.-]/g, '');
         
         setRows((prevRows) => {
            const updatedRows = prevRows.map((row, i) => {
               if (i !== globalIdx) return row;
               
               // Crear una copia de la fila con el valor actualizado
               const updatedRow = { ...row, [name]: numericValue };
               
               // Si se modificó uno de los campos que afectan al depósito, recalcular depósito
               if (['bruta', 'fcl', 'rebajosCliente', 'reintegroCliente'].includes(name)) {
                  const bruta = parseFloat(name === 'bruta' ? numericValue : row.bruta) || 0;
                  const fcl = parseFloat(name === 'fcl' ? numericValue : row.fcl) || 0;
                  const rebajosCliente = parseFloat(name === 'rebajosCliente' ? numericValue : row.rebajosCliente) || 0;
                  const reintegroCliente = parseFloat(name === 'reintegroCliente' ? numericValue : row.reintegroCliente) || 0;
                  
                  // Calcular el depósito según la fórmula
                  const deposito = bruta + fcl - rebajosCliente + reintegroCliente;
                  updatedRow.deposito = deposito.toString();
               }
               
               return updatedRow;
            });
            return updatedRows;
         });
      },
      [startIdx, setRows],
   );
}

/**
 * Hook personalizado para formatear valores de input numéricos con debounce
 * @param {Object} params - Parámetros para el hook
 * @param {React.MutableRefObject} params.inputRef - Referencia al input
 * @param {number} params.delay - Tiempo de espera en ms
 * @returns {Function} Función para manejar el cambio de valor
 */
function useDebounceFormatting({ inputRef, delay = 1000 }) {
  return useCallback((value) => {
    if (inputRef.current) {
      // Limpia cualquier temporizador anterior
      if (inputRef.current.formatTimer) {
        clearTimeout(inputRef.current.formatTimer);
      }
      
      // Configura un nuevo temporizador
      inputRef.current.formatTimer = setTimeout(() => {
        // Convierte a número y formatea con dos decimales
        if (inputRef.current && !isNaN(parseFloat(value))) {
          const numericValue = parseFloat(value);
          inputRef.current.value = numericValue.toFixed(2);
        }
      }, delay);
    }
  }, [inputRef, delay]);
}

/**
 * PayrollGenerator
 * Componente principal de la vista de generación de planilla.
 */
export const PayrollGenerator = () => {
   // Estados principales
   const [rows, setRows] = useState([]);
   const [empleadosRaw, setEmpleadosRaw] = useState([]);
   const [selectedRows, setSelectedRows] = useState([]);
   const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
   const [currentPage, setCurrentPage] = useState(1);
   const [montoPorOperario, setMontoPorOperario] = useState(5669.23);
   const [empresas, setEmpresas] = useState([]);
   const [empresaSeleccionada, setEmpresaSeleccionada] = useState("");
   const [planillas, setPlanillas] = useState([]);
   const [planillaSeleccionada, setPlanillaSeleccionada] = useState("");
   const [loading, setLoading] = useState(false);
   const dispatch = useDispatch();

   // Fetch empresas solo una vez
   useEffect(() => {
      (async () => {
         const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
         const empresasFiltradas = empresasData.data.array.filter(empresa => empresa.id_empresa === 13);
         if (empresasFiltradas && empresasFiltradas) setEmpresas(empresasFiltradas || []);
      })();
   }, [dispatch]);

   // Fetch planillas al cambiar empresa
   useEffect(() => {
      setPlanillas([]);
      setPlanillaSeleccionada("");
      if (empresaSeleccionada) {
         dispatch(SelectOpcion_Thunks("planilla/select", empresaSeleccionada)).then((res) => {
            if (res && res.data && Array.isArray(res.data.array)) setPlanillas(res.data.array);
         });
      }
   }, [empresaSeleccionada, dispatch]);

   // Fetch empleados al cambiar empresa o planilla
   useEffect(() => {
      if (empresaSeleccionada && planillaSeleccionada) {
         fetchAndSetEmpleados({
            dispatch,
            planillaSeleccionada,
            empresaSeleccionada,
            setRows,
            setEmpleadosRaw,
            setSelectedRows,
            setLoading,
         });
      }
   }, [empresaSeleccionada, planillaSeleccionada, dispatch]);

   // Obtener el estado de la planilla seleccionada
   const selectedPlanilla = planillas.find(
      (p) => String(p.planilla_id) === String(planillaSeleccionada),
   );
   const planillaEstado = selectedPlanilla?.planilla_estado; // Handler para aplicar planilla
   const handleAplicarPlanilla = async () => {
      // Mostrar diálogo de confirmación con SweetAlert
      const result = await Swal.fire({
         title: "¿Aplicar planilla?",
         html: `¿Está seguro que desea aplicar la planilla actual?<br>
                   <small class="text-danger fw-bold">IMPORTANTE: Una vez aplicada la planilla, no se podrán editar 
                   los empleados ni realizar otras acciones adicionales sin permisos especiales.</small>`,
         icon: "warning",
         showCancelButton: true,
         confirmButtonColor: "#3085d6",
         cancelButtonColor: "#d33",
         confirmButtonText: "Sí, aplicar",
         cancelButtonText: "Cancelar",
         allowOutsideClick: false,
      });

      // Si el usuario confirma, aplicar la planilla
      if (result.isConfirmed) {
         // Mostrar indicador de carga
         Swal.fire({
            title: "Aplicando planilla",
            html: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading();
            },
         });
         try {
            // Aplicar la planilla
            await dispatch(
               Planilla_Aplicar_Thunks(planillaSeleccionada, empresaSeleccionada, "Activa"),
            );

            // Notificar éxito
            await Swal.fire({
               title: "Completado",
               text: "La planilla ha sido aplicada exitosamente",
               icon: "success",
               confirmButtonColor: "#3085d6",
            });

            // Recargamos la información de la planilla para obtener su nuevo estado
            const planillasActualizadas = await dispatch(
               SelectOpcion_Thunks("planilla/select", empresaSeleccionada),
            );
            if (
               planillasActualizadas &&
               planillasActualizadas.data &&
               Array.isArray(planillasActualizadas.data.array)
            ) {
               setPlanillas(planillasActualizadas.data.array);
            }

            // Recargar datos de empleados
            await fetchAndSetEmpleados({
               dispatch,
               planillaSeleccionada,
               empresaSeleccionada,
               setRows,
               setEmpleadosRaw,
               setSelectedRows,
               setLoading,
            });
         } catch (error) {
            // Notificar error
            Swal.fire({
               title: "Error",
               text: "Ocurrió un error al aplicar la planilla",
               icon: "error",
               confirmButtonColor: "#3085d6",
            });
            console.error("Error al aplicar planilla:", error);
         }
      }
   };

   // Calculamos el índice inicial para la paginación
   const startIdx = (currentPage - 1) * pageSize;   // Derivados de los datos
   const totalPages = Math.ceil(rows.length / pageSize);
   const pageRows = rows.slice(startIdx, startIdx + pageSize);
   const totalTarifa = useMemo(() => {
      const empleadosConDatos = rows.filter(row => 
         parseFloat(row.bruta) > 0 || 
         parseFloat(row.fcl) > 0 || 
         parseFloat(row.rebajosCliente) > 0
      );
      return montoPorOperario * empleadosConDatos.length;
   }, [montoPorOperario, rows]);
   const montoTarifa = totalTarifa;
   const montoRemuneraciones = useMemo(() => {
      return sumColumn(rows, "deposito", selectedRows);
   }, [rows, selectedRows]);
   const subtotal = useMemo(() => {
      // El subtotal es la suma del monto de tarifa y el monto de remuneraciones
      const tarifaTotal = montoPorOperario * selectedRows.length;
      const remuneracionesTotal = sumColumn(rows, "deposito", selectedRows);
      return tarifaTotal + remuneracionesTotal;
   }, [rows, selectedRows, montoPorOperario]);
   const iva = useMemo(() => {
      return Math.round(subtotal * 0.13 * 100) / 100;
   }, [subtotal]);
   const montoTotal = subtotal + iva;

   // Handler para gestionar los checkboxes
   const handleCheckbox = useHandleCheckbox({
      rows,
      empleadosRaw,
      selectedRows,
      startIdx,
      planillaSeleccionada,
      empresaSeleccionada,
      dispatch,
      setEmpleadosRaw,
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
      setCurrentPage(1); // Reinicia a la primera página al cambiar el tamaño
   }, []);

   // Handler para cambio de página
   const handlePageChange = useCallback(
      (page) => {
         if (page >= 1 && page <= Math.ceil(rows.length / pageSize)) {
            setCurrentPage(page);
         }
      },
      [rows.length, pageSize],
   ); // Handler para cambio de planilla
   const handlePlanillaChange = useCallback((e) => {
      setLoading(true);
      setPlanillaSeleccionada(e.target.value);

      // Al seleccionar una planilla, se inicia un proceso de carga y los datos
      // se obtienen automáticamente mediante efectos
   }, []);

   // Cuando se selecciona tipo de planilla, simula carga de datos
   useEffect(() => {
      if (planillaSeleccionada) {
         // Ya está en loading, solo espera y luego lo quita
         const timeout = setTimeout(() => {
            setLoading(false);
         }, 1000);
         return () => clearTimeout(timeout);
      } else {
         setLoading(false); // Si se deselecciona, quita el loading
      }
   }, [planillaSeleccionada]);

   // Handler para cargar y procesar Excel de planilla
   const handleFileUpload = (e) => {
      const input = e.target;
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
         const data = new Uint8Array(evt.target.result);
         const workbook = XLSX.read(data, { type: 'array' });
         const worksheet = workbook.Sheets[workbook.SheetNames[0]];
         const excelRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
         const headerKeyMap = {
            'Semana': 'semana',
            'Remuneración Bruta': 'bruta',
            'FCL 1,5% ROB 3,25%': 'fcl',
            'Rebajos de Cliente': 'rebajosCliente',
            'Reintegro de Cliente': 'reintegroCliente',
            'Deposito X Tecurso': 'deposito',
            'Cuota CC.SS': 'cuota',
            'Rebajos OPU': 'rebajosOPU',
            'Reintegros OPU': 'reintegrosOPU',
            'Total de Deducciones': 'totalDeducciones',
            'Total de Reintegros': 'totalReintegros',
            'Remuneración Neta': 'neta'
         };
         const updatedRows = [...rows];
         excelRows.forEach((row) => {
            const cedulaValue = String(row['Cédula']).trim();
            const idx = updatedRows.findIndex(r => String(r.cedula) === cedulaValue);
            // Only update unmarked employees
            if (idx !== -1 && !selectedRows.includes(idx)) {
               Object.entries(headerKeyMap).forEach(([header, key]) => {
                  if (key === 'cedula') return;
                  const cell = row[header];
                  updatedRows[idx][key] = key === 'nombre' ? cell : (cell !== undefined && cell !== null) ? String(cell) : "0";
               });
            }
         });
         setRows(updatedRows);
         // Clear input to allow re-upload
         input.value = '';
      };
      reader.readAsArrayBuffer(file);
   };

   // Handler para gestionar el evento onBlur en los inputs
   const handleBlur = useHandleBlur({
      startIdx,
      setRows,
   });

   // IDs únicos para accesibilidad
   const empresaSelectId = "empresaSelect";
   const planillaSelectId = "planillaSelect"; // Renderizamos la interfaz de usuario
   return (
      <div className="container-fluid">
         {/* Estilos globales para tablas - Definidos en línea para asegurar que se apliquen */}
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
                     {/* Select de empresas dinámico */}
                     <div className="mb-3">
                        <label
                           htmlFor={empresaSelectId}
                           className="form-label"
                        >
                           Empresa
                        </label>
                        <select
                           className="form-select"
                           id={empresaSelectId}
                           value={empresaSeleccionada}
                           onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                        >
                           <option value="">Seleccione una empresa</option>
                           {empresas.map((empresa) => (
                              <option
                                 key={empresa.id_empresa}
                                 value={empresa.id_empresa}
                              >
                                 {empresa.nombre_comercial_empresa}
                              </option>
                           ))}
                        </select>
                     </div>{" "}
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
                           disabled={planillas.length === 0}
                        >
                           <option value="">Seleccione un tipo de planilla</option>
                           {planillas.map((planilla) => (
                              <option
                                 key={planilla.planilla_id}
                                 value={planilla.planilla_id}
                              >
                                 {planilla.planilla_codigo}
                              </option>
                           ))}
                        </select>
                     </div>
                     {/* Espacio para cargar archivo Excel con datos de planilla */}
                     <div className="mb-3">
                        <label htmlFor="excelUpload" className="form-label">Cargar Excel de Planilla</label>
                        <input
                           type="file"
                           id="excelUpload"
                           accept=".xlsx, .xls"
                           className="form-control"
                           disabled={!planillaSeleccionada}
                           onChange={handleFileUpload}
                        />
                     </div>
                     {/* Botón o alerta debajo del select de tipo de planilla */}
                     {planillaSeleccionada &&
                        (planillaEstado === "En Proceso" ? (
                           <div className="mb-3">
                              <button
                                 className="btn btn-success"
                                 onClick={handleAplicarPlanilla}
                              >
                                 Aplicar Planilla
                              </button>
                              <div className="alert alert-dark mt-2">
                                 <strong>Estado: En Proceso</strong> - La edición es libre.
                                 Modifique los campos de los empleados según se requiera. Al
                                 finalizar, presione "Aplicar Planilla". Una vez aplicada, no se
                                 podrán editar empleados sin permisos adicionales.
                              </div>
                           </div>
                        ) : planillaEstado === "Activa" ? (
                           <div className="mb-3">
                              <div className="alert alert-danger">
                                 <strong>Estado: Activa</strong> - La planilla ya ha sido aplicada y
                                 está disponible para el administrador. Solo puede modificar los
                                 empleados <u>no marcados</u>. Si necesita editar empleados
                                 marcados, contacte al administrador para obtener permisos. Nota:
                                 Cuando la planilla pase a estado "Cerrada", no se podrá modificar
                                 sin permisos especiales.
                              </div>
                           </div>
                        ) : planillaEstado === "Procesada" ? (
                           <div className="alert alert-success mb-3">
                              Esta planilla ya fue aplicada.
                           </div>
                        ) : null)}
                     {/* Mostrar preload si está cargando */}
                     {loading && (
                        <div className="text-center my-5">
                           <div
                              className="spinner-border text-primary"
                              role="status"
                           >
                              <span className="visually-hidden">Cargando...</span>
                           </div>
                           <div>Cargando datos de la planilla...</div>
                        </div>
                     )}
                     {/* Mostrar tablas solo si ambos están seleccionados y no está cargando */}
                     {!loading && empresaSeleccionada && planillaSeleccionada && (
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
                                       onBlur={
                                          planillaEstado === "En Proceso" ||
                                          planillaEstado === "Activa"
                                             ? handleBlur
                                             : () => {}
                                       }
                                       startIdx={startIdx}
                                       disabled={false}
                                       planillaEstado={planillaEstado}
                                       empleadosRaw={empleadosRaw}
                                    />
                                 </div>
                              </div>
                           </div>
                           {/* Paginación encima de las tablas de resumen */}
                           <TablePagination
                              pageSize={pageSize}
                              pageSizes={PAGE_SIZES}
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageSizeChange={handlePageSizeChange}
                              onPageChange={handlePageChange}
                           />
                           {/* Tablas de resumen lado a lado */}
                           <div className="d-flex gap-3 mb-3">
                              <SummaryTable
                                 rows={rows}
                                 selectedRows={selectedRows}
                                 montoPorOperario={montoPorOperario}
                                 setMontoPorOperario={setMontoPorOperario}
                                 totalTarifa={montoPorOperario * selectedRows.length}
                              />
                              <SummaryTable
                                 financialData={{
                                    montoTarifa: montoPorOperario * selectedRows.length,
                                    montoRemuneraciones,
                                    iva,
                                    montoTotal,
                                 }}
                              />
                           </div>
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
 * con otros componentes del sistema que esperen este nombre.
 */
export const GenerarPlanilla = PayrollGenerator;

/**
 * Determina si una fila debe estar deshabilitada basado en el estado de la planilla y datos del empleado
 * @param {string} planillaEstado - Estado de la planilla seleccionada ('En Proceso', 'Activa', 'Procesada')
 * @param {Array} empleadosRaw - Datos crudos de empleados
 * @param {number} index - Índice global del empleado
 * @returns {boolean} - True si la fila debe estar deshabilitada
 */
function esFilaDeshabilitada(planillaEstado, empleadosRaw, index) {
   // Si la planilla está en estado "Procesada", todas las filas están deshabilitadas
   if (planillaEstado === "Procesada") {
      return true;
   }

   // Si la planilla está "Activa", solo se deshabilitan las filas con marca_epd = 1 (con check)
   if (planillaEstado === "Activa" && empleadosRaw && empleadosRaw[index]) {
      return empleadosRaw[index].marca_epd === 1;
   }

   // Para estado "En Proceso" o cualquier otro estado, no se deshabilitan las filas
   return false;
}
