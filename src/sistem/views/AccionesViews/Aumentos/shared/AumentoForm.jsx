import React from "react";
import {
   handleFormChange,
   handleEstadoChange,
   formatRemuneracionValue,
} from "../../../../../hooks/useAumentoUtils";

/**
 * Componente compartido para el formulario de aumento.
 * Puede ser usado tanto para crear como para editar aumentos.
 */
export const AumentoForm = ({
   formData,
   setFormData,
   selectedPlanillaData,
   selectedEmpleadoData,
   error,
   message,
   planillaOptions,
   empleadoOptions,
   isLoadingPlanillas,
   isLoadingEmpleados,
   onSubmit,
   submitButtonText = "Guardar Aumento",
   submitButtonIcon = "fas fa-save",
}) => {
   return (
      <form onSubmit={onSubmit}>
         {/* Alert for Planilla Status */}
         {selectedPlanillaData && (
            <div
               className="alert alert-info mb-3"
               role="alert"
            >
               <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i>
                  <div>
                     <strong>Estado de la Planilla:</strong>{" "}
                     {selectedPlanillaData.planilla_estado || "No disponible"}
                     {selectedPlanillaData.planilla_codigo && (
                        <span className="ms-2">
                           <strong>Código:</strong> {selectedPlanillaData.planilla_codigo}
                        </span>
                     )}
                  </div>
               </div>
            </div>
         )}
         
         {/* Alert for Empleado Seleccionado */}
         {selectedEmpleadoData && (
            <div
               className="alert alert-success mb-3"
               role="alert"
               style={{ background: "#c6fcf5" }}
            >
               <div className="d-flex align-items-center">
                  <i className="fas fa-user-edit me-2"></i>
                  <div>
                     <strong>Socio:</strong>{" "}
                     {selectedEmpleadoData.nombre_completo_empleado_gestor} |
                     <strong> Cédula:</strong> {selectedEmpleadoData.cedula_empleado_gestor} |
                     <strong> Número de Socio:</strong>{" "}
                     {selectedEmpleadoData.numero_socio_empleado_gestor}
                  </div>
               </div>
            </div>
         )}
         
         {/* Mostrar mensaje de error debajo del socio */}
         {error && message && (
            <div
               className="alert alert-danger mt-2"
               role="alert"
            >
               {message}
            </div>
         )}
         
         {/* Estado */}
         <div
            className="col-md-12 mb-3"
            style={{
               display: "flex",
               justifyContent: "flex-end",
               alignItems: "flex-end",
               flexDirection: "column",
            }}
         >
            <label className="form-label d-block">Estado</label>
            <div className="form-check form-switch">
               <input
                  className="form-check-input"
                  type="checkbox"
                  id="estado"
                  name="estado"
                  checked={formData.estado === "Activo"}
                  onChange={(e) => handleEstadoChange(e, setFormData)}
               />
               <label
                  className="form-check-label"
                  htmlFor="estado"
               >
                  {formData.estado === "Activo" ? "Activo" : "Inactivo"}
               </label>
            </div>
         </div>
         
         <div className="row">
            {/* Planilla */}
            <div className="col-md-6 mb-3">
               <label
                  className="form-label"
                  htmlFor="planilla"
               >
                  Planilla <span className="text-danger">*</span>
               </label>
               <select
                  className="form-select"
                  id="planilla"
                  name="planilla"
                  value={formData.planilla}
                  onChange={(e) => handleFormChange(e, setFormData)}
                  required
                  disabled={isLoadingPlanillas}
               >
                  <option value="">
                     {isLoadingPlanillas ? "Cargando planillas..." : "Seleccione planilla"}
                  </option>
                  {planillaOptions.map((option) => (
                     <option
                        key={option.value}
                        value={option.value}
                     >
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
            
            {/* Empleado */}
            <div className="col-md-6 mb-3">
               <label
                  className="form-label"
                  htmlFor="empleado"
               >
                  Socio <span className="text-danger">*</span>
               </label>
               <select
                  className="form-select"
                  id="empleado"
                  name="empleado"
                  value={formData.empleado}
                  onChange={(e) => handleFormChange(e, setFormData)}
                  required
                  disabled={!formData.planilla || isLoadingEmpleados}
               >
                  <option value="">
                     {!formData.planilla
                        ? "Seleccione primero una planilla"
                        : isLoadingEmpleados
                        ? "Cargando empleados..."
                        : "Seleccione el Socio"}
                  </option>
                  {empleadoOptions.map((option) => (
                     <option
                        key={option.value}
                        value={option.value}
                     >
                        {option.label}
                     </option>
                  ))}
               </select>
            </div>
            
            {/* Remuneracion Actual */}
            <div className="col-md-4 mb-3">
               <label
                  className="form-label"
                  htmlFor="Remuneracion_Actual"
               >
                  Remuneracion Actual
               </label>
               <div className="input-group">
                  <span className="input-group-text">₡</span>
                  <input
                     type="text"
                     className="form-control"
                     id="Remuneracion_Actual"
                     name="Remuneracion_Actual"
                     value={formatRemuneracionValue(formData.Remuneracion_Actual)}
                     readOnly
                     placeholder="₡0.00"
                  />
               </div>
            </div>
            
            {/* Monto del Aumento */}
            <div className="col-md-4 mb-3">
               <label
                  className="form-label"
                  htmlFor="monto_aumento"
               >
                  Monto del Aumento <span className="text-danger">*</span>
               </label>
               <div className="input-group">
                  <span className="input-group-text">₡</span>
                  <input
                     type="number"
                     className="form-control"
                     id="monto_aumento"
                     name="monto_aumento"
                     value={formData.monto_aumento}
                     onChange={(e) => handleFormChange(e, setFormData)}
                     placeholder="0.00"
                     step="0.01"
                     min="0"
                  />
               </div>
            </div>
            
            {/* Remuneracion Nueva */}
            <div className="col-md-4 mb-3">
               <label
                  className="form-label"
                  htmlFor="Remuneracion_Nueva"
               >
                  Remuneracion Nueva
               </label>
               <div className="input-group">
                  <span className="input-group-text">₡</span>
                  <input
                     type="text"
                     className="form-control"
                     id="Remuneracion_Nueva"
                     name="Remuneracion_Nueva"
                     value={formatRemuneracionValue(formData.Remuneracion_Nueva)}
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
                     onChange={(e) => handleFormChange(e, setFormData)}
                  />
                  <label
                     className="form-check-label"
                     htmlFor="aplica_aguinaldo"
                  >
                     ¿Aplica a la Compensacion Anual?
                  </label>
                  <div className="form-text">
                     Marque esta casilla si el aumento debe aplicarse también al cálculo de la
                     Compensacion Anual
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
               <i className={`${submitButtonIcon} me-2`}></i>
               {submitButtonText}
            </button>
         </div>
      </form>
   );
}; 