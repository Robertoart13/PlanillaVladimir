import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
   const [isLoading, setIsLoading] = useState(false);

   const fetchPlanillas = useCallback(async () => {
      setIsLoading(true);
      setPlanillaOptions([]);
      const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));
      if (response.success && response.data.array?.length > 0) {
         setPlanillaOptions(getOptionList(response.data.array, "planilla_id", "planilla_codigo"));
      }
      setIsLoading(false);
   }, [dispatch]);

   return { planillaOptions, isLoading, fetchPlanillas };
}

/**
 * Hook para obtener y manejar los empleados.
 */
function useEmpleados(dispatch) {
   const [empleadoOptions, setEmpleadoOptions] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchEmpleados = useCallback(async () => {
      setIsLoading(true);
      setEmpleadoOptions([]);
      const response = await dispatch(fetchData_api(null, "gestor/planillas/empleados/options"));
      if (response.success && response.data.array?.length > 0) {
         setEmpleadoOptions(
            getOptionList(
               response.data.array,
               "id_empleado_gestor",
               "nombre_completo_empleado_gestor",
            ),
         );
      }
      setIsLoading(false);
   }, [dispatch]);

   return { empleadoOptions, isLoading, fetchEmpleados };
}

export const CrearHoraExtra = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Hook para obtener planillas
  const { planillaOptions, isLoading: isLoadingPlanillas, fetchPlanillas } = usePlanillas(dispatch);
  
  // Hook para obtener empleados
  const { empleadoOptions, isLoading: isLoadingEmpleados, fetchEmpleados } = useEmpleados(dispatch);

  const [formData, setFormData] = useState({
    planilla: "",
    empleado: "",
    compensacion_extra: "",
    motivo_compensacion: "-- no es obligatorio",
    aplica_aguinaldo: false,
    estado: "Activo",
  });

  // Cargar planillas al montar el componente
  useEffect(() => {
    fetchPlanillas();
  }, [fetchPlanillas]);

  // Cargar empleados al montar el componente
  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

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
      formData.compensacion_extra &&
      parseFloat(formData.compensacion_extra) > 0
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

    if (!formData.compensacion_extra || parseFloat(formData.compensacion_extra) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La compensación extra debe ser mayor a cero'
      });
      return;
    }

    // Confirmación antes de crear
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea crear la Compensación Extra?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await dispatch(fetchData_api(formData, "gestor/planilla/compensaciones/crear"));

         if (response.success) {
            Swal.fire({
              icon: 'success',
              title: '¡Creado!',
              text: 'La Compensación Extra ha sido creada exitosamente'
            }).then(() => {
              navigate("/acciones/horas-extra/lista");
            });
            
            // Limpiar formulario después de crear
            setFormData({
              planilla: "",
              empleado: "",
              compensacion_extra: "",
              motivo_compensacion: "-- no es obligatorio",
              aplica_aguinaldo: false,
              estado: "Activo",
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
          text: 'Hubo un error al crear la compensación extra'
        });
      }
    }
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
              {isLoadingEmpleados ? (
                <div className="d-flex align-items-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <span>Cargando empleados...</span>
                </div>
              ) : empleadoOptions.length > 0 ? (
                <select
                  className="form-select"
                  id="empleado"
                  name="empleado"
                  value={formData.empleado}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione el Socio</option>
                  {empleadoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="alert alert-warning">
                  No hay empleados disponibles
                </div>
              )}
            </div>

            {/* Compensacion Extra */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="compensacion_extra">
                Compensacion Extra <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${formData.compensacion_extra && parseFloat(formData.compensacion_extra) <= 0 ? 'is-invalid' : ''}`}
                id="compensacion_extra"
                name="compensacion_extra"
                value={formData.compensacion_extra}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
              {formData.compensacion_extra && parseFloat(formData.compensacion_extra) <= 0 && (
                <div className="invalid-feedback">
                  La compensación debe ser mayor a cero
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

          {/* Aplica Aguinaldo */}
          <div className="row">
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
                  Marque esta casilla si las compensaciones extra deben aplicarse también al cálculo de la Compensacion Anual
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
              Crear Compensacion Extra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};