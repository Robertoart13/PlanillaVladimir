import React, { useState, useEffect } from "react";

// Opciones para los enums 
const tiposPlanilla = ["Mensual", "Quincenal", "Semanal", "Otro"];
const empleados = [
  "Juan Perez",
  "Maria Lopez",
  "Pedro Gomez",
  "Ana Martinez",
  "Luis Rodriguez",
];

export const CrearAumento = () => {
  const [formData, setFormData] = useState({
    planilla: "",
    empleado: "",
    monto_aumento: "",
    aplica_aguinaldo: false,
    estado: "Activo",
    Remuneracion_actual: "",
    Remuneracion_nuevo: "",
  });

  // Calcular Remuneracion nuevo cuando cambie el monto de aumento o Remuneracion actual
  useEffect(() => {
    if (formData.Remuneracion_actual && formData.monto_aumento) {
      const RemuneracionActual = parseFloat(formData.Remuneracion_actual);
      const porcentajeAumento = parseFloat(formData.monto_aumento);
      
      if (!isNaN(RemuneracionActual) && !isNaN(porcentajeAumento)) {
        const RemuneracionNuevo = RemuneracionActual * (1 + porcentajeAumento / 100);
        setFormData(prev => ({
          ...prev,
          Remuneracion_nuevo: RemuneracionNuevo.toFixed(2)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        Remuneracion_nuevo: ""
      }));
    }
  }, [formData.Remuneracion_actual, formData.monto_aumento]);

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
        <h5>Crear Aumento de Remuneracion</h5>
        <p className="text-muted">
          Complete el formulario para crear un nuevo aumento de remuneracion.
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
              <label className="form-label" htmlFor="socio">
                Socio <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="empleado"
                name="empleado"
                value={formData.empleado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione el Socio</option>
                {empleados.map((empleado) => (
                  <option key={empleado} value={empleado}>
                    {empleado}
                  </option>
                ))}
              </select>
            </div>

            {/* Remuneracion Actual */}
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="Remuneracion_actual">
                Remuneracion Actual 
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="number"
                  className="form-control"
                  id="Remuneracion_actual"
                  name="Remuneracion_actual"
                  value={formData.Remuneracion_actual}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  readOnly
                />
              </div>
            </div>

              {/* Remuneracion Nuevo (Calculado automáticamente) */}
              <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="monto_aumento">
                Monto del Aumento <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="monto_aumento"
                  name="monto_aumento"
                  value={formData.monto_aumento}
                  
                />
              </div>
            </div>

            {/* Remuneracion Nuevo (Calculado automáticamente) */}
            <div className="col-md-4 mb-3">
              <label className="form-label" htmlFor="Remuneracion_nuevo">
                Remuneracion Nueva
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="Remuneracion_nuevo"
                  name="Remuneracion_nuevo"
                  value={formData.Remuneracion_nuevo}
                  readOnly
                  placeholder="Se calcula automáticamente"
                />
              </div>
            </div>

            {/* Aplica Aguinaldo */}
            <div className="col-md-6 mb-3">
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
                  Marque esta casilla si el aumento debe aplicarse también al cálculo de la Compensacion Anual
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
              Crear Aumento
            </button>
        
          </div>
        </form>
      </div>
    </div>
  );
};