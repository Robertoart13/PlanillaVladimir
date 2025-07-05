import React, { useState } from "react";

// Opciones para los enums 
const tiposPlanilla = ["Mensual", "Quincenal", "Semanal", "Otro"];
const empleados = [
  "Juan Perez",
  "Maria Lopez",
  "Pedro Gomez",
  "Ana Martinez",
  "Luis Rodriguez",
];

export const CrearHoraExtra = () => {
  const [formData, setFormData] = useState({
    planilla: "",
    empleado: "",
    total_horas_extras: "",
    aplica_aguinaldo: false,
    estado: "Activo",
  });

  // Manejar cambios en los inputs 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
        <h5>Crear Compensacion Extra</h5>
        <p className="text-muted">
          Complete el formulario para crear un nuevo registro de compensacion extra.
        </p>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Estado */}
          <div className="col-md-12 mb-3" style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-end", flexDirection: "column"}}>
            <label className="form-label d-block">
              Estado
            </label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="estado"
                name="estado"
                checked={formData.estado === "Activo"}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    estado: e.target.checked ? "Activo" : "Inactivo"
                  }));
                }}
              />
              <label className="form-check-label" htmlFor="estado">
                {formData.estado === "Activo" ? "Activo" : "Inactivo"}
              </label>
            </div>
          </div>

          <div className="row">
            {/* Planilla */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla">
                Planilla <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="planilla"
                name="planilla"
                value={formData.planilla}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione planilla</option>
                {tiposPlanilla.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Empleado */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="empleado">
                Empleado <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="empleado"
                name="empleado"
                value={formData.empleado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione empleado</option>
                {empleados.map((empleado) => (
                  <option key={empleado} value={empleado}>
                    {empleado}
                  </option>
                ))}
              </select>
            </div>

            {/* Total de Horas Extras */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="compensacion_extra">
                Compensacion Extra <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="compensacion_extra"
                name="compensacion_extra"
                value={formData.compensacion_extra}
                onChange={handleChange}
                placeholder="0"
                step="0.5"
                min="0"
                required
              />
            </div>

            {/* Aplica Aguinaldo */}
            <div className="col-md-6 mb-3 mt-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aplica_aguinaldo"
                  name="aplica_aguinaldo"
                  checked={formData.aplica_aguinaldo}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="aplica_aguinaldo">
                  ¿Aplica a la Compensacion Anual?
                </label>
                <div className="form-text">
                  Marque esta casilla si las compensaciones extra deben aplicarse también al cálculo de la Compensacion Anual
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className="btn btn-primary"
            >
              <i className="fas fa-save me-2"></i>
              Crear Compensacion Extra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};