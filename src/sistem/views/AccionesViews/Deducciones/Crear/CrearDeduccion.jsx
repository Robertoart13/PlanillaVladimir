import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency } from "../../../../../hooks/formatCurrency";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Opciones para los tipos de rebajo según la documentación
const tiposRebajo = [
  { value: "horas_no_laboradas", label: "Horas no laboradas", usaFormula: true, campo: "horas" },
  { value: "ausencias_injustificadas", label: "Ausencias injustificadas", usaFormula: true, campo: "dias" },
  { value: "retardos", label: "Retardos (llegadas tardías)", usaFormula: true, campo: "horas" },
  { value: "permisos_no_remunerados", label: "Permisos no remunerados", usaFormula: true, campo: "dias" },
  { value: "incapacidades_no_autorizadas", label: "Incapacidades no autorizadas", usaFormula: true, campo: "dias" },
  { value: "suspension_disciplinaria", label: "Suspensión disciplinaria", usaFormula: true, campo: "dias" },
  { value: "licencias_sin_goce", label: "Licencias sin goce de salario", usaFormula: true, campo: "dias" },
  { value: "dias_no_trabajados_parcial", label: "Días no trabajados en periodo parcial", usaFormula: true, campo: "dias" },
  { value: "faltas_reiteradas", label: "Faltas reiteradas", usaFormula: true, campo: "dias" },
  { value: "descuentos_judiciales", label: "Descuentos judiciales (embargos)", usaFormula: false, campo: "monto_fijo" },
  { value: "anticipos_prestamos", label: "Anticipos o préstamos", usaFormula: false, campo: "monto_fijo" },
  { value: "devolucion_equipo_materiales", label: "Devolución de equipo o materiales", usaFormula: false, campo: "monto_fijo" },
  { value: "errores_perdidas", label: "Errores o pérdidas ocasionadas", usaFormula: false, campo: "monto_fijo" },
];

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

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
 * Busca un objeto en un array por id.
 * @param {Array} data - Array de objetos.
 * @param {string|number} id - Valor a buscar.
 * @param {string} idKey - Clave del id.
 * @returns {Object|null}
 */
function findById(data, id, idKey) {
   return Array.isArray(data) ? data.find((item) => item[idKey] == id) || null : null;
}

// ============================================================================
// FUNCIONES DE CÁLCULO DE REBAJO
// ============================================================================

/**
 * Calcula el monto del rebajo según el tipo y los datos proporcionados.
 * Aplica las fórmulas estándar según la legislación laboral costarricense.
 * 
 * @param {string} tipoRebajo - Tipo de rebajo.
 * @param {string} tipoJornada - Tipo de jornada laboral (mensual, quincenal, semanal).
 * @param {number} salarioActual - Salario actual del empleado.
 * @param {number} horasRebajadas - Horas rebajadas (si aplica).
 * @param {number} diasRebajados - Días rebajados (si aplica).
 * @param {number} montoFijo - Monto fijo (si aplica).
 * @returns {number} Monto calculado del rebajo.
 */
function calcularMontoRebajo(tipoRebajo, tipoJornada, salarioActual, horasRebajadas, diasRebajados, montoFijo) {
  // Definir divisores según el tipo de jornada laboral
  const divisores = {
    mensual: { horas: 240, dias: 30 },
    quincenal: { horas: 120, dias: 15 },
    semanal: { horas: 48, dias: 6 },
    diario: { horas: 8, dias: 1 }
  };
  
  const divisor = divisores[tipoJornada] || divisores.mensual; // Por defecto mensual
  
  switch (tipoRebajo) {
    case 'horas_no_laboradas':
    case 'retardos':
      // (Salario / horas según jornada) × Horas no trabajadas
      return (salarioActual / divisor.horas) * (horasRebajadas || 0);
    
    case 'ausencias_injustificadas':
    case 'permisos_no_remunerados':
    case 'incapacidades_no_autorizadas':
    case 'suspension_disciplinaria':
    case 'licencias_sin_goce':
    case 'dias_no_trabajados_parcial':
    case 'faltas_reiteradas':
      // (Salario / días según jornada) × Días de ausencia
      return (salarioActual / divisor.dias) * (diasRebajados || 0);
    
    case 'descuentos_judiciales':
    case 'anticipos_prestamos':
    case 'devolucion_equipo_materiales':
    case 'errores_perdidas':
      // Monto fijo
      return montoFijo || 0;
    
    default:
      return 0;
  }
}

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================

/**
 * Hook para obtener y manejar las planillas disponibles.
 * @param {Function} dispatch - Función dispatch de Redux.
 * @returns {Object} Objeto con opciones de planillas, estado de carga y función para obtener planillas.
 */
function usePlanillas(dispatch) {
   const [planillaOptions, setPlanillaOptions] = useState([]);
   const [planillaData, setPlanillaData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchPlanillas = useCallback(async () => {
      setIsLoading(true);
      setPlanillaOptions([]);
      setPlanillaData([]);
      
      try {
        const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));
        if (response.success && response.data.array?.length > 0) {
           setPlanillaData(response.data.array);
           setPlanillaOptions(getOptionList(response.data.array, "planilla_id", "planilla_codigo"));
        }
      } catch (error) {
        console.error("Error al cargar planillas:", error);
      } finally {
        setIsLoading(false);
      }
   }, [dispatch]);

   return { planillaOptions, planillaData, isLoading, fetchPlanillas };
}

/**
 * Hook para obtener y manejar los empleados disponibles.
 * @param {Function} dispatch - Función dispatch de Redux.
 * @returns {Object} Objeto con opciones de empleados, datos completos, estado de carga y función para obtener empleados.
 */
function useEmpleados(dispatch) {
   const [empleadoOptions, setEmpleadoOptions] = useState([]);
   const [empleadoData, setEmpleadoData] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const fetchEmpleados = useCallback(async (planillaMoneda) => {
      setIsLoading(true);
      setEmpleadoOptions([]);
      setEmpleadoData([]);
      
      try {
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
                 "nombre_completo_empleado_gestor",
              ),
           );
        }
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      } finally {
        setIsLoading(false);
      }
   }, [dispatch]);

   return { empleadoOptions, empleadoData, isLoading, fetchEmpleados };
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente para crear rebajos a compensación.
 * Permite calcular automáticamente los rebajos según la legislación laboral costarricense.
 */
export const CrearDeduccion = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // ============================================================================
  // HOOKS Y ESTADOS
  // ============================================================================
  
  // Hooks para obtener datos
  const { planillaOptions, planillaData, isLoading: isLoadingPlanillas, fetchPlanillas } = usePlanillas(dispatch);
  const { empleadoOptions, empleadoData, isLoading: isLoadingEmpleados, fetchEmpleados } = useEmpleados(dispatch);
  
  const [formData, setFormData] = useState({
    planilla: "",
    empleado: "",
    tipo_rebajo: "",
    horas_rebajadas: "",
    dias_rebajados: "",
    monto_fijo_rebajo: "",
    salario_actual: "",
    tipo_jornada_laboral: "",
    monto_rebajo_calculado: "",
    motivo_rebajo: "",
    fecha_rebajo: new Date().toISOString().split('T')[0],
    aplica_compensacion_anual: false,
    estado: "Activo",
  });

  const [selectedPlanillaData, setSelectedPlanillaData] = useState(null);
  const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);
  const [tipoRebajoSeleccionado, setTipoRebajoSeleccionado] = useState(null);

  // Estado de error y mensaje
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Limpia el mensaje de error al montar el componente
  useEffect(() => {
    setMessage("");
    setError(false);
  }, []);

  // Cargar planillas al montar
  useEffect(() => {
    fetchPlanillas();
  }, [fetchPlanillas]);

  // Cuando cambia la planilla, buscar datos y empleados
  useEffect(() => {
    if (formData.planilla) {
      const planillaObj = findById(planillaData, formData.planilla, "planilla_id");
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

  // Cuando cambia el empleado, buscar datos y actualizar salario
  useEffect(() => {
    if (formData.empleado) {
      const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
      setSelectedEmpleadoData(empleadoObj);
      if (empleadoObj?.salario_base_empleado_gestor) {
        setFormData((prev) => ({
          ...prev,
          salario_actual: empleadoObj.salario_base_empleado_gestor.toString(),
          tipo_jornada_laboral: empleadoObj.tipo_jornada_laboral_empleado_gestor || "mensual",
        }));
      }
    } else {
      setSelectedEmpleadoData(null);
      setFormData((prev) => ({ 
        ...prev, 
        salario_actual: "",
        tipo_jornada_laboral: "",
      }));
    }
  }, [formData.empleado, empleadoData]);

  // Calcular rebajo automáticamente cuando cambien los campos relevantes
  useEffect(() => {
    if (tipoRebajoSeleccionado && formData.salario_actual && formData.tipo_jornada_laboral) {
      const salario = parseFloat(formData.salario_actual);
      const tipoJornada = formData.tipo_jornada_laboral;
      const horas = parseFloat(formData.horas_rebajadas);
      const dias = parseFloat(formData.dias_rebajados);
      const montoFijo = parseFloat(formData.monto_fijo_rebajo);

      // Solo calcular si hay datos válidos según el tipo de rebajo
      if (tipoRebajoSeleccionado.usaFormula) {
        if (tipoRebajoSeleccionado.campo === "horas" && horas > 0) {
          const montoCalculado = calcularMontoRebajo(
            formData.tipo_rebajo,
            tipoJornada,
            salario,
            horas,
            dias,
            montoFijo
          );
          setFormData((prev) => ({
            ...prev,
            monto_rebajo_calculado: montoCalculado.toFixed(2),
          }));
        } else if (tipoRebajoSeleccionado.campo === "dias" && dias > 0) {
          const montoCalculado = calcularMontoRebajo(
            formData.tipo_rebajo,
            tipoJornada,
            salario,
            horas,
            dias,
            montoFijo
          );
          setFormData((prev) => ({
            ...prev,
            monto_rebajo_calculado: montoCalculado.toFixed(2),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            monto_rebajo_calculado: "",
          }));
        }
      } else {
        // Para tipos sin fórmula, usar monto fijo
        if (montoFijo > 0) {
          setFormData((prev) => ({
            ...prev,
            monto_rebajo_calculado: montoFijo.toFixed(2),
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            monto_rebajo_calculado: "",
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        monto_rebajo_calculado: "",
      }));
    }
  }, [formData.salario_actual, formData.tipo_jornada_laboral, formData.horas_rebajadas, formData.dias_rebajados, formData.monto_fijo_rebajo, tipoRebajoSeleccionado]);

  // ============================================================================
  // FUNCIONES DE MANEJO
  // ============================================================================

  /**
   * Maneja el cambio de cualquier input del formulario.
   * @param {Event} e - Evento del input.
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  /**
   * Maneja el cambio de tipo de rebajo.
   * @param {Event} e - Evento del select.
   */
  const handleTipoRebajoChange = (e) => {
    const tipoRebajo = e.target.value;
    const tipoSeleccionado = tiposRebajo.find(t => t.value === tipoRebajo);
    
    setTipoRebajoSeleccionado(tipoSeleccionado);
    setFormData(prev => ({
      ...prev,
      tipo_rebajo: tipoRebajo,
      horas_rebajadas: "",
      dias_rebajados: "",
      monto_fijo_rebajo: "",
      monto_rebajo_calculado: "",
    }));
  };

  /**
   * Valida si el formulario está completo y cumple con las validaciones.
   * @returns {boolean} True si el formulario es válido.
   */
  const isFormValid = () => {
    if (!formData.planilla || !formData.empleado || !formData.tipo_rebajo || !formData.fecha_rebajo) {
      return false;
    }

    if (!formData.salario_actual || parseFloat(formData.salario_actual) <= 0) {
      return false;
    }

    if (tipoRebajoSeleccionado?.usaFormula) {
      if (tipoRebajoSeleccionado.campo === "horas") {
        return parseFloat(formData.horas_rebajadas) > 0;
      } else if (tipoRebajoSeleccionado.campo === "dias") {
        return parseFloat(formData.dias_rebajados) > 0;
      }
    } else {
      return parseFloat(formData.monto_fijo_rebajo) > 0;
    }

    return false;
  };

  /**
   * Maneja el envío del formulario.
   * @param {Event} e - Evento del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ============================================================================
    // VALIDACIONES
    // ============================================================================
    
    if (!formData.planilla) {
      setError(true);
      setMessage("Debe seleccionar una planilla.");
      return;
    }

    if (!formData.empleado) {
      setError(true);
      setMessage("Debe seleccionar un socio.");
      return;
    }

    if (!formData.tipo_rebajo) {
      setError(true);
      setMessage("Debe seleccionar un tipo de rebajo.");
      return;
    }

    if (!formData.salario_actual || parseFloat(formData.salario_actual) <= 0) {
      setError(true);
      setMessage("El salario actual es obligatorio y debe ser mayor a cero.");
      return;
    }

    if (!formData.fecha_rebajo) {
      setError(true);
      setMessage("La fecha del rebajo es obligatoria.");
      return;
    }

    // Validar campos específicos según el tipo de rebajo
    if (tipoRebajoSeleccionado?.usaFormula) {
      if (tipoRebajoSeleccionado.campo === "horas" && (!formData.horas_rebajadas || parseFloat(formData.horas_rebajadas) <= 0)) {
        setError(true);
        setMessage("Las horas rebajadas son obligatorias y deben ser mayor a cero.");
        return;
      }

      if (tipoRebajoSeleccionado.campo === "dias" && (!formData.dias_rebajados || parseFloat(formData.dias_rebajados) <= 0)) {
        setError(true);
        setMessage("Los días rebajados son obligatorios y deben ser mayor a cero.");
        return;
      }
    } else {
      if (!formData.monto_fijo_rebajo || parseFloat(formData.monto_fijo_rebajo) <= 0) {
        setError(true);
        setMessage("El monto fijo es obligatorio y debe ser mayor a cero.");
        return;
      }
    }

    if (!formData.monto_rebajo_calculado || parseFloat(formData.monto_rebajo_calculado) <= 0) {
      setError(true);
      setMessage("El monto calculado debe ser mayor a cero.");
      return;
    }

    // ============================================================================
    // CONFIRMACIÓN
    // ============================================================================
    
    const nombre = selectedEmpleadoData.nombre_completo_empleado_gestor;
    const socio = selectedEmpleadoData.numero_socio_empleado_gestor;
    const tipoRebajo = tipoRebajoSeleccionado?.label || formData.tipo_rebajo;
    const fechaRebajo = formData.fecha_rebajo;
    const montoCalculado = formatCurrency(formData.monto_rebajo_calculado);

    // HTML mejorado y centrado para el swal
    let htmlMsg = `
    <div style="text-align:center;">
      <div style="font-size:1.1em; margin-bottom:6px;">
        <b>Socio:</b> <span style="font-weight:500;">${nombre}</span>
      </div>
      <div style="font-size:1.1em; margin-bottom:6px;">
        <b>Número de Socio:</b> <span style="font-weight:500;">${socio}</span>
      </div>
      <div style="font-size:1.1em; margin-bottom:6px;">
        <b>Tipo de Rebajo:</b> <span style="font-weight:500; color:red;">${tipoRebajo}</span>
      </div>
      <div style="font-size:1.1em; margin-bottom:6px;">
        <b>Monto Calculado:</b> <span style="font-weight:500; color:red;">${montoCalculado}</span>
      </div>
      <div style="font-size:1.1em; margin-bottom:6px;">
        <b>Fecha del Rebajo:</b> <span style="font-weight:500;">${fechaRebajo}</span>
      </div>
    </div>
  `;

    const result = await Swal.fire({
      title: "¿Está seguro de crear este rebajo a compensación?",
      html: htmlMsg,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, crear rebajo",
      cancelButtonText: "Cancelar",
      focusCancel: true,
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-secondary ms-2",
      },
      buttonsStyling: false,
    });
    
    if (result.isConfirmed) {
      try {
        // Mostrar loading
        Swal.fire({
          title: "Creando rebajo a compensación",
          text: "Por favor espere...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Enviar datos al backend
        const response = await dispatch(fetchData_api(formData, "gestor/planilla/deducciones/crear"));

        if (response.success) {
          setError(false);

          Swal.fire({
            title: "Rebajo a compensación creado exitosamente",
            text: "El rebajo ha sido registrado correctamente",
            icon: "success",
            confirmButtonText: "Aceptar",
          }).then(() => {
            navigate("/acciones/rebajo-compensacion/lista");
          });
        } else {
          const errorMessage = response.message || "Error al crear el rebajo a compensación";
          setError(true);
          setMessage(errorMessage);
          Swal.fire({
            title: "Error al crear el rebajo",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "Aceptar",
          });
        }
        
      } catch (error) {
        console.error('Error al crear rebajo a compensación:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al crear el rebajo a compensación'
        });
      }
    }
  };

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  return (
    <div className="card">
      <div className="card-header">
        <h5>Crear Rebajo a Compensación</h5>
        <p className="text-muted">
          Complete el formulario para crear un nuevo registro de Rebajo a Compensación.
          El sistema calculará automáticamente el monto según la legislación laboral costarricense.
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
          
          {/* Mostrar mensaje de error */}
          {error && message && (
            <div
              className="alert alert-danger mt-2"
              role="alert"
            >
              {message}
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
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Rebajo */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="tipo_rebajo">
                Tipo de Rebajo <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="tipo_rebajo"
                name="tipo_rebajo"
                value={formData.tipo_rebajo}
                onChange={handleTipoRebajoChange}
                required
              >
                <option value="">Seleccione tipo de rebajo</option>
                {tiposRebajo.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Salario Actual */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="salario_actual">
                Salario Actual <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="salario_actual"
                  name="salario_actual"
                  value={formatCurrency(formData.salario_actual || 0)}
                  readOnly
                  placeholder="₡0.00"
                />
              </div>
            </div>

            {/* Tipo de Jornada Laboral */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="tipo_jornada_laboral">
                Tipo de Jornada Laboral
              </label>
              <input
                type="text"
                className="form-control"
                id="tipo_jornada_laboral"
                name="tipo_jornada_laboral"
                value={formData.tipo_jornada_laboral || ""}
                readOnly
                placeholder="No disponible"
              />
            </div>

            {/* Horas Rebajadas - Solo visible para ciertos tipos */}
            {tipoRebajoSeleccionado?.campo === "horas" && (
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="horas_rebajadas">
                  Horas Rebajadas <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="horas_rebajadas"
                  name="horas_rebajadas"
                  value={formData.horas_rebajadas}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.5"
                  min="0"
                  required
                />
              </div>
            )}

            {/* Días Rebajados - Solo visible para ciertos tipos */}
            {tipoRebajoSeleccionado?.campo === "dias" && (
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="dias_rebajados">
                  Días Rebajados <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="dias_rebajados"
                  name="dias_rebajados"
                  value={formData.dias_rebajados}
                  onChange={handleChange}
                  placeholder="0"
                  step="0.5"
                  min="0"
                  required
                />
              </div>
            )}

            {/* Monto Fijo - Solo visible para ciertos tipos */}
            {tipoRebajoSeleccionado?.campo === "monto_fijo" && (
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="monto_fijo_rebajo">
                  Monto Fijo <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text">₡</span>
                  <input
                    type="number"
                    className="form-control"
                    id="monto_fijo_rebajo"
                    name="monto_fijo_rebajo"
                    value={formData.monto_fijo_rebajo}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            )}

            {/* Fecha del Rebajo */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="fecha_rebajo">
                Fecha del Rebajo <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="fecha_rebajo"
                name="fecha_rebajo"
                value={formData.fecha_rebajo}
                onChange={handleChange}
                required
              />
            </div>

            {/* Monto Calculado */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="monto_rebajo_calculado">
                Monto Calculado <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="monto_rebajo_calculado"
                  name="monto_rebajo_calculado"
                  value={formatCurrency(formData.monto_rebajo_calculado || 0)}
                  readOnly
                  placeholder="Se calcula automáticamente"
                />
              </div>
              <div className="form-text">
                {tipoRebajoSeleccionado?.usaFormula 
                  ? "Este monto se calcula automáticamente según la fórmula aplicable"
                  : "Este monto corresponde al monto fijo ingresado"
                }
              </div>
            </div>

            {/* Motivo */}
            <div className="col-md-12 mb-3">
              <label className="form-label" htmlFor="motivo_rebajo">
                Motivo (Opcional)
              </label>
              <textarea
                className="form-control"
                id="motivo_rebajo"
                name="motivo_rebajo"
                value={formData.motivo_rebajo}
                onChange={handleChange}
                rows="3"
                placeholder="Descripción del motivo del rebajo..."
              />
            </div>
          </div>

          {/* ========================================================================
               CAMPO DE APLICA COMPENSACIÓN ANUAL
          ======================================================================== */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aplica_compensacion_anual"
                  name="aplica_compensacion_anual"
                  checked={formData.aplica_compensacion_anual}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="aplica_compensacion_anual">
                  ¿Aplica a la Compensación Anual?
                </label>
                <div className="form-text">
                  Marque esta casilla si el rebajo debe aplicarse también al cálculo de la Compensación Anual
                </div>
              </div>
            </div>
          </div>

          {/* Detalle del Cálculo (Solo se muestra cuando hay monto calculado) */}
          {formData.monto_rebajo_calculado && parseFloat(formData.monto_rebajo_calculado) > 0 && tipoRebajoSeleccionado?.usaFormula && (
            <div className="alert alert-info mb-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="fas fa-calculator me-2"></i>
                <div>
                  <strong>Detalle del Cálculo:</strong>
                  <div className="mt-1">
                    {(() => {
                      try {
                        const salario = parseFloat(formData.salario_actual);
                        const tipoJornada = formData.tipo_jornada_laboral;
                        const divisores = {
                          mensual: { horas: 240, dias: 30 },
                          quincenal: { horas: 120, dias: 15 },
                          semanal: { horas: 48, dias: 6 },
                        };
                        const divisor = divisores[tipoJornada] || divisores.mensual;
                        
                        if (tipoRebajoSeleccionado.campo === "horas") {
                          const horas = parseFloat(formData.horas_rebajadas);
                          const salarioHora = salario / divisor.horas;
                          return (
                            <>
                              <div>• Salario por hora: {formatCurrency(salarioHora)}</div>
                              <div>• Horas rebajadas: {horas} horas</div>
                              <div>• Cálculo: {formatCurrency(salarioHora)} × {horas} = {formatCurrency(formData.monto_rebajo_calculado)}</div>
                            </>
                          );
                        } else if (tipoRebajoSeleccionado.campo === "dias") {
                          const dias = parseFloat(formData.dias_rebajados);
                          const salarioDia = salario / divisor.dias;
                          return (
                            <>
                              <div>• Salario por día: {formatCurrency(salarioDia)}</div>
                              <div>• Días rebajados: {dias} días</div>
                              <div>• Cálculo: {formatCurrency(salarioDia)} × {dias} = {formatCurrency(formData.monto_rebajo_calculado)}</div>
                            </>
                          );
                        }
                      } catch (error) {
                        return <div>Error en el cálculo</div>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className={`btn ${isFormValid() ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!isFormValid()}
              title={!isFormValid() ? 'Complete todos los campos obligatorios' : ''}
            >
              <i className="fas fa-save me-2"></i>
              Crear Rebajo a Compensación
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/acciones/rebajo-compensacion/lista')}
            >
              <i className="fas fa-times me-2"></i>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};