import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { SelectOpcion_Thunks } from "../../../../store/SelectOpcion/SelectOpcion_Thunks";

/**
 * =========================
 * CONSTANTS & CONFIGURATION
 * =========================
 */

/** Payroll table column definitions */
const PAYROLL_COLUMNS = [
    { key: "nombre", label: "Nombre", style: { minWidth: 180 } },
    { key: "cedula", label: "Cédula", style: { minWidth: 100 } },
    { key: "cuenta", label: "# De cuenta", style: { minWidth: 120 } },
    { key: "asegurado", label: "# De Asegurado" },
    { key: "can", label: "CAN" },
    { key: "semana", label: "Semana" },
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
    { key: "neta", label: "Remuneración Neta", type: "number" }
];

const COMPANIES = [
    { id: 1, name: "Empresa A" },
    { id: 2, name: "Empresa B" },
    { id: 3, name: "Empresa C" }
];

const PAYROLL_TYPES = [
    { id: 1, name: "Planilla Mensual" },
    { id: 2, name: "Planilla Quincenal" }
];

const PAGE_SIZES = [10, 30, 60, 80, 100];

/**
 * ================
 * STYLE FUNCTIONS
 * ================
 */

/**
 * Returns the style object for table cells.
 * @param {object} col - Column definition.
 * @param {boolean} isSelected - If the row is selected.
 * @param {number} idx - Row index.
 */
function getTableCellStyle(col, isSelected, idx) {
    return {
        ...col.style,
        borderRight: "1px solid #dee2e6",
        borderLeft: "1px solid #dee2e6",
        background: !isSelected && idx % 2 !== 0 ? "#f8f9fa" : undefined
    };
}

/**
 * Returns the style object for table headers.
 * @param {object} col - Column definition.
 */
function getTableHeaderStyle(col) {
    return {
        ...col.style,
        background: "#e9ecef",
        borderBottom: "2px solid #adb5bd",
        borderTop: "2px solid #adb5bd",
        textAlign: "center"
    };
}

/**
 * Returns the style object for summary table cells.
 * @param {string} type - Type of cell (header, total, etc).
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
 * Generates initial payroll rows for demonstration.
 * @param {number} count - Number of rows to generate.
 * @returns {Array<Object>}
 */
function generateInitialRows(count = 5) {
    return Array.from({ length: count }, (_, i) => ({
        nombre: `Usuario ${i + 1}`,
        cedula: `${10000000 + i}`,
        cuenta: `0001234${i}`,
        asegurado: `${900000 + i}`,
        can: `CAN${(i % 5) + 1}`,
        semana: `${22 + (i % 4)}`,
        bruta: `${500000 + i * 1000}`,
        fcl: `${10000 + i * 10}`,
        rebajosCliente: `${5000 + i * 5}`,
        reintegroCliente: `${2000 + i * 2}`,
        deposito: `${1000 + i * 3}`,
        cuota: `${3000 + i * 4}`,
        rebajosOPU: `${500 + i}`,
        reintegrosOPU: `${200 + i}`,
        totalDeducciones: `${21700 + i * 20}`,
        totalReintegros: `${2200 + i * 2}`,
        neta: `${480500 + i * 900}`
    }));
}

/**
 * Sums a numeric field for all rows.
 * @param {Array<Object>} rows
 * @param {string} field
 * @returns {number}
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
    startIdx
}) {
    return (
        <table
            className="table table-hover table-bordered table-striped datatable-table align-middle"
            style={{
                minWidth: 1200,
                fontSize: "0.95rem",
                borderCollapse: "separate",
                borderSpacing: 0
            }}
        >
            <thead className="table-light sticky-top" style={{ zIndex: 2 }}>
                <tr>
                    <th style={{ width: 40, textAlign: "center" }}></th>
                    {columns.map(col => (
                        <th key={col.key} style={getTableHeaderStyle(col)}>
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {pageRows.map((row, idx) => {
                    const globalIdx = startIdx + idx;
                    const isSelected = selectedRows.includes(globalIdx);
                    return (
                        <tr
                            key={globalIdx}
                            className={isSelected ? "fila-seleccionada" : ""}
                        >
                            <td style={{ textAlign: "center" }}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onCheckboxChange(idx)}
                                    aria-label={`Seleccionar fila ${globalIdx + 1}`}
                                />
                            </td>
                            {columns.map(col => (
                                <td
                                    key={col.key}
                                    style={getTableCellStyle(col, isSelected, idx)}
                                >
                                    {col.type === "number" ? (
                                        <input
                                            type="number"
                                            name={col.key}
                                            value={row[col.key]}
                                            onChange={e => onInputChange(e, idx)}
                                            className="form-control form-control-sm"
                                            style={{ minWidth: col.style?.minWidth || 80, background: "#fdfdfd" }}
                                            aria-label={col.label}
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
                    {columns.map(col =>
                        col.type === "number" ? (
                            <td key={col.key} style={col.key === "neta" ? { color: "#198754", fontWeight: "bold" } : {}}>
                                {sumColumn(rows, col.key)}
                            </td>
                        ) : (
                            <td key={col.key}></td>
                        )
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
    onPageChange
}) {
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
            <label className="me-2 mb-0" htmlFor="pageSizeSelect">Filas por página:</label>
            <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={onPageSizeChange}
                className="form-select d-inline-block me-3"
                style={{ width: 90 }}
            >
                {pageSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
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
}

/**
 * SummaryTable
 * Tabla resumen reutilizable para operarios o datos financieros.
 */
function SummaryTable({ rows, montoPorOperario, setMontoPorOperario, totalTarifa, financialData }) {
    if (financialData) {
        const { montoTarifa, montoRemuneraciones, subtotal, iva, montoTotal } = financialData;
        return (
            <div style={{ maxWidth: 350 }}>
                <table className="table table-bordered" style={{ background: "#bcd2f7" }}>
                    <tbody>
                        <tr>
                            <td className="fw-bold" style={getSummaryCellStyle("header")}>Monto de tarifa</td>
                            <td className="text-end">₡{montoTarifa.toLocaleString("es-CR", { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="fw-bold" style={getSummaryCellStyle("header")}>Monto de Remuneraciones</td>
                            <td className="text-end">₡{montoRemuneraciones ? montoRemuneraciones.toLocaleString("es-CR", { minimumFractionDigits: 2 }) : '-'}</td>
                        </tr>
                        <tr>
                            <td className="fw-bold" style={getSummaryCellStyle("header")}>Subtotal</td>
                            <td className="text-end">₡{subtotal.toLocaleString("es-CR", { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="fw-bold" style={getSummaryCellStyle("header")}>I V A</td>
                            <td className="text-end">₡{iva.toLocaleString("es-CR", { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                            <td className="fw-bold text-center" colSpan={2} style={getSummaryCellStyle("totalLabel")}>Monto Total</td>
                        </tr>
                        <tr>
                            <td className="fw-bold text-end" colSpan={2} style={getSummaryCellStyle("total")}>
                                ₡{montoTotal.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    // Tabla de resumen de operarios
    const totalOperarios = rows.length;
    return (
        <div style={{ maxWidth: 300 }}>
            <table className="table table-bordered" style={{ background: "#bcd2f7" }}>
                <tbody>
                    <tr>
                        <td colSpan={2} className="text-center fw-bold" style={getSummaryCellStyle("header")}>Cantidad de Operarios</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-center">{totalOperarios}</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-center fw-bold" style={getSummaryCellStyle("header")}>Por administración</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-center">0</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-center fw-bold" style={getSummaryCellStyle("header")}>Total de Operarios</td>
                    </tr>
                    <tr>
                        <td colSpan={2} className="text-center">{totalOperarios}</td>
                    </tr>
                    <tr>
                        <td className="fw-bold" style={getSummaryCellStyle("header")}>Monto X Operario</td>
                        <td className="text-end fw-bold">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={montoPorOperario}
                                onChange={e => setMontoPorOperario(Number(e.target.value))}
                                className="form-control form-control-sm text-end"
                                style={{ background: "#eaf1fb", fontWeight: "bold" }}
                                aria-label="Monto por operario"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-center" colSpan={2} style={getSummaryCellStyle("totalLabel")}>Total de Tarifa</td>
                    </tr>
                    <tr>
                        <td className="fw-bold text-end" colSpan={2} style={getSummaryCellStyle("total")}>
                            ₡{totalTarifa.toLocaleString("es-CR", { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

/**
 * PayrollGenerator
 * Componente principal de la vista de generación de planilla.
 */
export const PayrollGenerator = () => {
    // Estados principales
    const [rows, setRows] = useState(generateInitialRows(5));
    const [selectedRows, setSelectedRows] = useState([]);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [currentPage, setCurrentPage] = useState(1);
    const [montoPorOperario, setMontoPorOperario] = useState(5669.23);

    // Estado para empresas
    const [empresas, setEmpresas] = useState([]);
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(""); // Nuevo estado
    const [planillas, setPlanillas] = useState([]); // Nuevo estado para planillas
    const [planillaSeleccionada, setPlanillaSeleccionada] = useState(""); // Nuevo estado para la planilla seleccionada
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    /**
     * fetchEmpresas
     * Obtiene la lista de empresas desde la API y actualiza el estado.
     * Se ejecuta automáticamente al montar el componente.
     */
    const fetchEmpresas = useCallback(async () => {
        const empresasData = await dispatch(SelectOpcion_Thunks("empresas/select"));
        // Asegúrate de que empresasData.data.array sea el array de empresas
        if (empresasData && empresasData.data) {
            setEmpresas(empresasData.data.array || []);
        }
    }, [dispatch]);

    // Ejecutar fetchEmpresas al cargar el componente
    useEffect(() => {
        fetchEmpresas();
    }, [fetchEmpresas]);

    // Nuevo useEffect para consultar planillas al seleccionar empresa
    useEffect(() => {
        setPlanillas([]); // Limpia el select al cambiar de empresa
        setPlanillaSeleccionada(""); // Limpia la selección
        if (empresaSeleccionada) {
            dispatch(SelectOpcion_Thunks("planilla/select", empresaSeleccionada)).then(res => {
                if (res && res.data && Array.isArray(res.data.array)) {
                    setPlanillas(res.data.array);
                }
            });
        }
    }, [empresaSeleccionada, dispatch]);

    // Handler para seleccionar tipo de planilla y mostrar el preload suavemente
    const handlePlanillaChange = useCallback((e) => {
        const value = e.target.value;
        setLoading(true); // Activa el preload antes de cambiar la selección
        setPlanillaSeleccionada(value);
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

    // Derivados
    const totalPages = Math.ceil(rows.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const pageRows = rows.slice(startIdx, startIdx + pageSize);
    const totalTarifa = useMemo(() => montoPorOperario * rows.length, [montoPorOperario, rows.length]);
    const montoTarifa = totalTarifa;
    const montoRemuneraciones = useMemo(() => sumColumn(rows, "deposito"), [rows]);
    const subtotal = montoTarifa - montoRemuneraciones;
    const iva = subtotal * 0.13;
    const montoTotal = subtotal + iva;

    // Handlers
    const handleCheckbox = useCallback((idx) => {
        const globalIdx = startIdx + idx;
        setSelectedRows(prev =>
            prev.includes(globalIdx)
                ? prev.filter(i => i !== globalIdx)
                : [...prev, globalIdx]
        );
    }, [startIdx]);

    const handleInputChange = useCallback((e, idx) => {
        const { name, value } = e.target;
        const globalIdx = startIdx + idx;
        setRows(prev =>
            prev.map((row, i) =>
                i === globalIdx ? { ...row, [name]: value } : row
            )
        );
    }, [startIdx]);

    const handlePageSizeChange = useCallback(e => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback(page => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    }, [totalPages]);

    // IDs únicos para accesibilidad
    const empresaSelectId = "empresaSelect";
    const planillaSelectId = "planillaSelect";

    return (
        <div className="container-fluid">
            {/* Estilos globales para tablas */}
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
                `}
            </style>
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {/* Select de empresas dinámico */}
                            <div className="mb-3">
                                <label htmlFor={empresaSelectId} className="form-label">Empresa</label>
                                <select
                                    className="form-select"
                                    id={empresaSelectId}
                                    value={empresaSeleccionada}
                                    onChange={e => setEmpresaSeleccionada(e.target.value)}
                                >
                                    <option value="">Seleccione una empresa</option>
                                    {empresas.map(empresa => (
                                        <option
                                            key={empresa.id_empresa}
                                            value={empresa.id_empresa}
                                        >
                                            {empresa.nombre_comercial_empresa}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Payroll type select */}
                            <div className="mb-3">
                                <label htmlFor={planillaSelectId} className="form-label">Tipo de Planilla</label>
                                <select
                                    className="form-select"
                                    id={planillaSelectId}
                                    value={planillaSeleccionada}
                                    onChange={handlePlanillaChange}
                                    disabled={planillas.length === 0}
                                >
                                    <option value="">Seleccione un tipo de planilla</option>
                                    {planillas.map(planilla => (
                                        <option key={planilla.planilla_id} value={planilla.planilla_id}>
                                            {planilla.planilla_codigo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mostrar preload si está cargando */}
                            {loading && (
                                <div className="text-center my-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                    <div>Cargando datos de la planilla...</div>
                                </div>
                            )}

                            {/* Mostrar tablas solo si ambos están seleccionados y no está cargando */}
                            {!loading && empresaSeleccionada && planillaSeleccionada && (
                                <>
                                    {/* Main payroll table */}
                                    <div className="table-responsive" style={{ overflowX: "auto" }}>
                                        <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                                            <div className="datatable-container">
                                                <PayrollTable
                                                    columns={PAYROLL_COLUMNS}
                                                    rows={rows}
                                                    pageRows={pageRows}
                                                    selectedRows={selectedRows}
                                                    onCheckboxChange={handleCheckbox}
                                                    onInputChange={handleInputChange}
                                                    startIdx={startIdx}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Pagination above summary tables */}
                                    <TablePagination
                                        pageSize={pageSize}
                                        pageSizes={PAGE_SIZES}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageSizeChange={handlePageSizeChange}
                                        onPageChange={handlePageChange}
                                    />
                                    {/* Summary tables side by side */}
                                    <div className="d-flex gap-3 mb-3">
                                        <SummaryTable
                                            rows={rows}
                                            montoPorOperario={montoPorOperario}
                                            setMontoPorOperario={setMontoPorOperario}
                                            totalTarifa={totalTarifa}
                                        />
                                        <SummaryTable
                                            financialData={{
                                                montoTarifa,
                                                montoRemuneraciones,
                                                subtotal,
                                                iva,
                                                montoTotal
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
 * Export with the expected name for compatibility.
 */
export const GenerarPlanilla = PayrollGenerator;
