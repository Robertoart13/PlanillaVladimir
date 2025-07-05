import React, { useState } from "react";

// Opciones para los enums 
const tiposPlanilla = ["Mensual", "Quincenal", "Semanal", "Otro"];
const estadosPlanilla = [
  "En Proceso",
  "Activa",
  "Cerrada",
  "Cancelada",
  "Procesada",
];

export const CrearPlanilla = () => {
  const [formData, setFormData] = useState({
    planilla_codigo: "PL-EMP-Mens-20241201-0001",
    empresa_id: "",
    planilla_tipo: "",
    planilla_descripcion: "--",
    planilla_estado: "En Proceso",
    planilla_fecha_inicio: "",
    planilla_fecha_fin: "",
    planilla_creado_por: "",
  });

  // Manejar cambios en los inputs 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formData);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Crear Planilla</h5>
        <p className="text-muted">
          Complete el formulario para crear una nueva planilla.
        </p>
      </div>
      <div className="card-header">
        <h5>Consecutivo: {formData.planilla_codigo}</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Consecutivo y Empresa */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_codigo">
                Consecutivo
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="planilla_codigo"
                  name="planilla_codigo"
                  value={formData.planilla_codigo}
                  readOnly
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  title="Generar nuevo consecutivo"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            </div>
          

            {/* Tipo de Planilla y Estado */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_tipo">
                Tipo de Planilla
              </label>
              <select
                className="form-select"
                id="planilla_tipo"
                name="planilla_tipo"
                value={formData.planilla_tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                {tiposPlanilla.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_estado">
                Estado
              </label>
              <select
                className="form-select"
                id="planilla_estado"
                name="planilla_estado"
                value={formData.planilla_estado}
                onChange={handleChange}
                required
              >
                {estadosPlanilla.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Inicio y Fecha Fin */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_fecha_inicio">
                Fecha de Inicio
              </label>
              <input
                type="date"
                className="form-control"
                id="planilla_fecha_inicio"
                name="planilla_fecha_inicio"
                value={formData.planilla_fecha_inicio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_fecha_fin">
                Fecha de Fin
              </label>
              <input
                type="date"
                className="form-control"
                id="planilla_fecha_fin"
                name="planilla_fecha_fin"
                value={formData.planilla_fecha_fin}
                onChange={handleChange}
                required
              />
            </div>

            {/* Descripción (ocupa todo el ancho) */}
            <div className="col-md-12 mb-3">
              <label className="form-label" htmlFor="planilla_descripcion">
                Descripción
              </label>
              <textarea
                className="form-control"
                id="planilla_descripcion"
                name="planilla_descripcion"
                value={formData.planilla_descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Descripción opcional de la planilla"
              ></textarea>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Crear Planilla
          </button>
        </form>
      </div>
    </div>
  );
};