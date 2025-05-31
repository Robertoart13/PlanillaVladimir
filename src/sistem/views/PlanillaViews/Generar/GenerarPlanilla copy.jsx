import React, { useState } from "react";

/**
 * Componente para generar la planilla de usuarios con paginación y barra de navegación tipo DataTables.
 * La fila de totales siempre permanece visible.
 */
export const GenerarPlanilla = () => {
    // Datos de ejemplo para empresas y planillas
    const empresas = [
        { id: 1, nombre: "Empresa A" },
        { id: 2, nombre: "Empresa B" },
        { id: 3, nombre: "Empresa C" }
    ];

    const planillas = [
        { id: 1, nombre: "Planilla Mensual" },
        { id: 2, nombre: "Planilla Quincenal" }
    ];

    // Estado para las filas de la tabla (simulación de muchos usuarios)
    const [filas, setFilas] = useState(
        Array.from({ length: 120 }, (_, i) => ({
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
        }))
    );

    // Opciones de paginación
    const pageSizes = [10, 30, 60, 80, 100];
    const [pageSize, setPageSize] = useState(pageSizes[0]);
    const [currentPage, setCurrentPage] = useState(1);

    // Calcular el rango de filas a mostrar
    const totalPages = Math.ceil(filas.length / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const filasPagina = filas.slice(startIdx, endIdx);

    // Definición de columnas
    const columnas = [
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

    /**
     * Maneja el cambio de los inputs de la tabla.
     * @param {object} e - Evento del input.
     * @param {number} idx - Índice de la fila en la página actual.
     */
    const handleChange = (e, idx) => {
        const { name, value } = e.target;
        const globalIdx = startIdx + idx;
        setFilas(prev =>
            prev.map((fila, i) =>
                i === globalIdx ? { ...fila, [name]: value } : fila
            )
        );
    };

    /**
     * Suma los valores numéricos de una columna.
     * @param {string} campo - Nombre del campo a sumar.
     * @returns {number}
     */
    const sumarColumna = campo =>
        filas.reduce((acc, fila) => acc + (parseFloat(fila[campo]) || 0), 0);

    // Manejo de paginación
    const handlePageSizeChange = e => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // Renderiza los botones de paginación tipo DataTables
    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <li key={i} className={`dt-paging-button page-item${currentPage === i ? " active" : ""}`}>
                    <button
                        className="page-link"
                        type="button"
                        aria-current={currentPage === i ? "page" : undefined}
                        onClick={() => goToPage(i)}
                    >
                        {i}
                    </button>
                </li>
            );
        }
        return (
            <ul className="pagination justify-content-center my-2">
                <li className={`dt-paging-button page-item${currentPage === 1 ? " disabled" : ""}`}>
                    <button
                        className="page-link"
                        type="button"
                        aria-label="First"
                        onClick={() => goToPage(1)}
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
                        onClick={() => goToPage(currentPage - 1)}
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
                        onClick={() => goToPage(currentPage + 1)}
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
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        »
                    </button>
                </li>
            </ul>
        );
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {/* Select de Empresa */}
                            <div className="mb-3">
                                <label htmlFor="empresaSelect" className="form-label">Empresa</label>
                                <select className="form-select" id="empresaSelect">
                                    <option value="">Seleccione una empresa</option>
                                    {empresas.map(empresa => (
                                        <option key={empresa.id} value={empresa.id}>{empresa.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Select de Planilla */}
                            <div className="mb-3">
                                <label htmlFor="planillaSelect" className="form-label">Tipo de Planilla</label>
                                <select className="form-select" id="planillaSelect">
                                    <option value="">Seleccione un tipo de planilla</option>
                                    {planillas.map(planilla => (
                                        <option key={planilla.id} value={planilla.id}>{planilla.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="table-responsive">
                                <div className="datatable-wrapper datatable-loading no-footer searchable fixed-columns">
                                    <div className="datatable-container">
                                        <table
                                            className="table table-hover datatable-table"
                                            style={{
                                                minWidth: 1200,
                                                fontSize: "0.95rem"
                                            }}
                                        >
                                            <thead className="table-light sticky-top" style={{ zIndex: 2 }}>
                                                <tr>
                                                    {columnas.map(col => (
                                                        <th key={col.key} style={col.style}>{col.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filasPagina.map((fila, idx) => (
                                                    <tr key={startIdx + idx}>
                                                        {columnas.map(col => (
                                                            <td key={col.key} style={col.style}>
                                                                {col.type === "number" ? (
                                                                    <input
                                                                        type="number"
                                                                        name={col.key}
                                                                        value={fila[col.key]}
                                                                        onChange={e => handleChange(e, idx)}
                                                                        className="form-control form-control-sm"
                                                                        style={{ minWidth: col.style?.minWidth || 80 }}
                                                                    />
                                                                ) : (
                                                                    fila[col.key]
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr style={{ background: "#f8f9fa", fontWeight: "bold" }}>
                                                    <td colSpan={6} style={{ textAlign: "right" }}>Totales:</td>
                                                    {columnas.slice(6).map(col => (
                                                        <td key={col.key}>
                                                            {sumarColumna(col.key)}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>





                            {/* Paginación abajo a la derecha */}
                            <div className="d-flex justify-content-end align-items-center mt-2">
                                <label className="me-2 mb-0">Filas por página:</label>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="form-select d-inline-block me-3"
                                    style={{ width: 90 }}
                                >
                                    {pageSizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                {renderPagination()}
                            </div>
                            {/* Botón de agregar fila eliminado para cumplir requerimiento */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
