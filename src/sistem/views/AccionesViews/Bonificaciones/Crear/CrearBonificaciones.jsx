import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

/**
 * Obtiene el símbolo de moneda basado en la moneda de la planilla
 * @param {string} moneda - Moneda de la planilla ('colones', 'dolares', etc.)
 * @returns {string} Símbolo de moneda
 */
function getMonedaSymbol(moneda) {
   switch (moneda?.toLowerCase()) {
      case 'dolares':
      case 'dólares':
         return '$';
      case 'colones':
      default:
         return '₡';
   }
}

/**
 * Mapea un array de objetos a un array de opciones para un select.
 * @param {Array} data - Array de objetos originales.
 * @param {string} valueKey - Clave para el value.
 * @param {string} labelKey - Clave para el label.
 * @returns {Array<{value: string|number, label: string}>}
 */
function getOptionList(data, valueKey, labelKey) {
   return Array.isArray(data)
      ? data.map((item) => ({ value: item[valueKey], label: item[labelKey] }))
      : [];
}

/**
 * Hook para obtener y manejar las planillas.
 */
function usePlanillas(dispatch) {
   const [planillaOptions, setPlanillaOptions] = useState([]);
   const [planillaData, setPlanillaData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchPlanillas = useCallback(async () => {
      setIsLoading(true);
      setPlanillaOptions([]);
      setPlanillaData([]);
      const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));
      if (response.success && response.data.array?.length > 0) {
         setPlanillaData(response.data.array);
         setPlanillaOptions(getOptionList(response.data.array, "planilla_id", "planilla_codigo"));
      }
      setIsLoading(false);
   }, [dispatch]);

   return { planillaOptions, planillaData, isLoading, fetchPlanillas };
}

/**
 * Hook para obtener y manejar los empleados.
 */
function useEmpleados(dispatch) {
   const [empleadoOptions, setEmpleadoOptions] = useState([]);
   const [empleadoData, setEmpleadoData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchEmpleados = useCallback(async (planillaMoneda) => {
      setIsLoading(true);
      setEmpleadoOptions([]);
      setEmpleadoData([]);
      
      const response = await dispatch(fetchData_api(null, "gestor/planillas/empleados/options"));
      
      if (response.success && response.data.array?.length > 0) {
         let empleadosFiltrados = response.data.array;
         
         // Filtrar empleados según la moneda de la planilla
         if (planillaMoneda) {
            empleadosFiltrados = response.data.array.filter(empleado => {
               // Empleados con colones_y_dolares aparecen siempre
               if (empleado.moneda_pago_empleado_gestor === "colones_y_dolares") {
                  return true;
               }
               // Para otros empleados, mostrar solo los que coinciden con la moneda de la planilla
               return empleado.moneda_pago_empleado_gestor === planillaMoneda;
            });
         }
         
         setEmpleadoData(empleadosFiltrados);
         setEmpleadoOptions(
            getOptionList(
               empleadosFiltrados,
               "id_empleado_gestor",
               (empleado) => `${empleado.nombre_completo_empleado_gestor} ${getMonedaSymbol(empleado.moneda_pago_empleado_gestor)}`
            ),
         );
      }
      setIsLoading(false);
   }, [dispatch]);

   return { empleadoOptions, empleadoData, isLoading, fetchEmpleados };
}

export const CrearBonificaciones = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Hook para obtener planillas
  const { planillaOptions, planillaData, isLoading: isLoadingPlanillas, fetchPlanillas } = usePlanillas(dispatch);
  
  // Hook para obtener empleados
  const { empleadoOptions, empleadoData, isLoading: isLoadingEmpleados, fetchEmpleados } = useEmpleados(dispatch);

  // Estados de selección
  const [selectedPlanillaData, setSelectedPlanillaData] = useState(null);
  const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

  const [formData, setFormData] = useState({
    planilla: "",
    empleado: "",
    tipo_compensacion_metrica: "productividad",
    monto_bonificacion: "",
    motivo_compensacion: "-- no es obligatorio",
    fecha_compensacion: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    aplica_Compensacion_Anual: false,
    estado: "Pendiente",
  });

  // Cargar planillas al montar el componente
  useEffect(() => {
    fetchPlanillas();
  }, [fetchPlanillas]);

  // Cuando cambia la planilla, buscar datos y empleados
  useEffect(() => {
    if (formData.planilla) {
      const planillaObj = planillaData.find(item => item.planilla_id == formData.planilla);
      setSelectedPlanillaData(planillaObj);
      
      // Cargar empleados filtrados según la moneda de la planilla
      if (planillaObj?.planilla_moneda) {
        fetchEmpleados(planillaObj.planilla_moneda);
      }
      
      setFormData((prev) => ({ ...prev, empleado: "" })); // Limpiar selección de empleado
    } else {
      setSelectedPlanillaData(null);
      setFormData((prev) => ({ ...prev, empleado: "" }));
    }
  }, [formData.planilla, planillaData, fetchEmpleados]);

  // Cuando cambia el empleado, buscar datos
  useEffect(() => {
    if (formData.empleado) {
      const empleadoObj = empleadoData.find(item => item.id_empleado_gestor == formData.empleado);
      setSelectedEmpleadoData(empleadoObj);
    } else {
      setSelectedEmpleadoData(null);
    }
  }, [formData.empleado, empleadoData]);

  // Manejar cambios en los inputs   
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Validar si el formulario está completo
  const isFormValid = () => {
    return (
      formData.planilla &&
      formData.empleado &&
      formData.tipo_compensacion_metrica &&
      formData.monto_bonificacion &&
      formData.fecha_compensacion &&
      parseFloat(formData.monto_bonificacion) > 0
    );
  };

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.planilla) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una planilla'
      });
      return;
    }

    if (!formData.empleado) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar un socio'
      });
      return;
    }

    if (!formData.tipo_compensacion_metrica) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar el tipo de compensación por métrica'
      });
      return;
    }

    if (!formData.monto_bonificacion || parseFloat(formData.monto_bonificacion) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto de compensación debe ser mayor a cero'
      });
      return;
    }

    if (!formData.fecha_compensacion) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar la fecha de compensación'
      });
      return;
    }

    // Confirmación antes de crear
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea crear la Compensación por Métrica?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await dispatch(fetchData_api(formData, "gestor/planilla/compensaciones-metrica/crear"));

         if (response.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Creado!',
              text: 'La Compensación por Métrica ha sido creada exitosamente'
            }).then(() => {
              navigate("/acciones/compensacion-metrica/lista");
            });
            
            // Limpiar formulario después de crear
            setFormData({
              planilla: "",
              empleado: "",
              tipo_compensacion_metrica: "productividad",
              monto_bonificacion: "",
              motivo_compensacion: "-- no es obligatorio",
              fecha_compensacion: new Date().toISOString().split('T')[0],
              aplica_Compensacion_Anual: false,
              estado: "Pendiente",
            });
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message
            });
         }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al crear la compensación'
        });
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>Crear Compensacion por Metrica</h5>
        <p className="text-muted">
          Complete el formulario para crear un nuevo registro de Compensacion por Metrica.
        </p>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit}>
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
                  {selectedPlanillaData.planilla_moneda && (
                    <span className="ms-2">
                      <strong>Moneda:</strong> {selectedPlanillaData.planilla_moneda}
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
                checked={formData.estado === "Pendiente"}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    estado: e.target.checked ? "Pendiente" : "Cancelada"
                  }));
                }}
              />
              <label className="form-check-label" htmlFor="estado">
                {formData.estado === "Pendiente" ? "Pendiente" : "Cancelada"}
              </label>
            </div>
          </div>

          <div className="row">
            {/* Planilla */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla">
                Planilla <span className="text-danger">*</span>
              </label>
              {isLoadingPlanillas ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <span>Cargando planillas...</span>
                </div>
              ) : planillaOptions.length > 0 ? (
                <select
                  className="form-select"
                  id="planilla"
                  name="planilla"
                  value={formData.planilla}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione planilla</option>
                  {planillaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="alert alert-warning">
                  No hay planillas disponibles
                </div>
              )}
            </div>

            {/* Empleado */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="empleado">
                Socio <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="empleado"
                name="empleado"
                value={formData.empleado}
                onChange={handleChange}
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
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Compensación por Métrica */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="tipo_compensacion_metrica">
                Tipo de Compensación por Métrica <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="tipo_compensacion_metrica"
                name="tipo_compensacion_metrica"
                value={formData.tipo_compensacion_metrica}
                onChange={handleChange}
                required
              >
                <option value="productividad">Compensación por productividad</option>
                <option value="cumplimiento_metas">Cumplimiento de metas o KPIs</option>
                <option value="puntualidad">Bono por puntualidad</option>
                <option value="asistencia_perfecta">Bono por asistencia perfecta</option>
                <option value="antiguedad">Bonificación por antigüedad</option>
                <option value="evaluacion_desempeno">Bonificación por evaluación de desempeño</option>
                <option value="cero_accidentes">Bono por cero accidentes</option>
                <option value="ventas">Bonificación por ventas</option>
                <option value="capacitacion">Bono por capacitación</option>
                <option value="permanencia">Bonificación por permanencia</option>
                <option value="innovacion">Bonificación por innovación</option>
              </select>
            </div>

            {/* Fecha de Compensación */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="fecha_compensacion">
                Fecha de Compensación <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="fecha_compensacion"
                name="fecha_compensacion"
                value={formData.fecha_compensacion}
                onChange={handleChange}
                required
              />
              <div className="form-text">
                Fecha en que se registra o aplica la compensación
              </div>
            </div>

            {/* Monto de Compensacion por Metrica */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="monto_bonificacion">
                Monto de Compensacion por Metrica <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">{getMonedaSymbol(selectedPlanillaData?.planilla_moneda)}</span>
                <input
                  type="number"
                  className={`form-control ${formData.monto_bonificacion && parseFloat(formData.monto_bonificacion) <= 0 ? 'is-invalid' : ''}`}
                  id="monto_bonificacion"
                  name="monto_bonificacion"
                  value={formData.monto_bonificacion}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
              {formData.monto_bonificacion && parseFloat(formData.monto_bonificacion) <= 0 && (
                <div className="invalid-feedback">
                  El monto debe ser mayor a cero
                </div>
              )}
            </div>

            {/* Motivo de la Compensación */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="motivo_compensacion">
                Motivo de la Compensación
              </label>
              <textarea
                className="form-control"
                id="motivo_compensacion"
                name="motivo_compensacion"
                value={formData.motivo_compensacion}
                onChange={handleChange}
                rows="3"
                placeholder="Describa el motivo de la compensación..."
              />
              <div className="form-text">
                Campo opcional para describir el motivo de la compensación
              </div>
            </div>
          </div>

          {/* Aplica Compensacion Anual */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aplica_Compensacion_Anual"
                  name="aplica_Compensacion_Anual"
                  checked={formData.aplica_Compensacion_Anual}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="aplica_Compensacion_Anual">
                  ¿Aplica a la Compensacion Anual?
                </label>
                <div className="form-text">
                  Marque esta casilla si la compensación por métrica debe aplicarse también al cálculo de la
                  Compensacion Anual
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className={`btn ${isFormValid() ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!isFormValid()}
              title={!isFormValid() ? 'Complete todos los campos obligatorios' : ''}
            >
              <i className="fas fa-save me-2"></i>
              Crear Compensacion por Metrica
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};