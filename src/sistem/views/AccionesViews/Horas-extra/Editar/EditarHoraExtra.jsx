import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency } from "../../../../../hooks/formatCurrency";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
// FUNCIONES DE CÁLCULO DE COMPENSACIÓN
// ============================================================================

/**
 * Calcula el salario por hora basado en el salario y tipo de jornada.
 * Convierte diferentes tipos de salario (quincenal, semanal) a mensual y luego a por hora.
 * 
 * @param {number} salario - Salario del empleado.
 * @param {string} tipoJornada - Tipo de jornada (mensual, quincenal, semanal).
 * @returns {number} Salario por hora calculado.
 * @throws {Error} Si el tipo de jornada no es válido.
 */
function calcularSalarioPorHora(salario, tipoJornada) {
  let salarioMensual = 0;
  
  switch (tipoJornada.toLowerCase()) {
    case 'mensual':
      salarioMensual = salario;
      break;
    case 'quincenal':
      salarioMensual = salario * 2; // 2 quincenas = 1 mes
      break;
    case 'semanal':
      salarioMensual = salario * 4.333; // Promedio de semanas por mes
      break;
    default:
      throw new Error(`Tipo de jornada inválido: ${tipoJornada}`);
  }
  
  // Salario por hora = Salario mensual / 30 días / 8 horas diarias
  return salarioMensual / 30 / 8;
}

/**
 * Calcula la compensación extra basada en el salario, tipo de jornada, tipo de compensación y horas.
 * Aplica los multiplicadores según la legislación laboral costarricense.
 * 
 * @param {number} salario - Salario del empleado.
 * @param {string} tipoJornada - Tipo de jornada (mensual, quincenal, semanal).
 * @param {string} tipoCompensacion - Tipo de compensación extra.
 * @param {number} horas - Cantidad de horas trabajadas.
 * @returns {number} Monto de la compensación extra calculada.
 */
function calcularCompensacionExtra(salario, tipoJornada, tipoCompensacion, horas) {
  // Obtener salario por hora
  const salarioHora = calcularSalarioPorHora(salario, tipoJornada);
  
  // Multiplicadores según legislación costarricense
  const multiplicadores = {
    'diurna (50%)': 1.5,                    // 50% adicional
    'nocturna (25%)': 1.25,                 // 25% adicional
    'feriado (100%)': 2.0,                  // 100% adicional (doble)
    'extraordinaria nocturna (75%)': 1.75,  // 75% adicional
    'extraordinaria feriado (100%)': 2.0,   // 100% adicional (doble)
  };

  const multiplicador = multiplicadores[tipoCompensacion.toLowerCase()] || 1;
  
  // Cálculo final: Salario por hora × Multiplicador × Horas trabajadas
  return salarioHora * horas * multiplicador;
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
   const [isLoading, setIsLoading] = useState(false);

   const fetchPlanillas = useCallback(async () => {
      setIsLoading(true);
      setPlanillaOptions([]);
      
      try {
        const response = await dispatch(fetchData_api(null, "gestor/planillas/listas"));
        if (response.success && response.data.array?.length > 0) {
           setPlanillaOptions(getOptionList(response.data.array, "planilla_id", "planilla_codigo"));
        }
      } catch (error) {
        console.error("Error al cargar planillas:", error);
      } finally {
        setIsLoading(false);
      }
   }, [dispatch]);

   return { planillaOptions, isLoading, fetchPlanillas };
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

   const fetchEmpleados = useCallback(async () => {
      setIsLoading(true);
      setEmpleadoOptions([]);
      setEmpleadoData([]);
      
      try {
        const response = await dispatch(fetchData_api(null, "gestor/planillas/empleados/options"));
        if (response.success && response.data.array?.length > 0) {
           setEmpleadoData(response.data.array);
           setEmpleadoOptions(
              getOptionList(
                 response.data.array,
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
 * Componente para editar compensaciones extra (horas extra).
 * Permite modificar compensaciones existentes y recalcular automáticamente según la legislación laboral costarricense.
 */
export const EditarHoraExtra = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================================================
  // HOOKS Y ESTADOS
  // ============================================================================
  
  // Hooks para obtener datos
  const { planillaOptions, isLoading: isLoadingPlanillas, fetchPlanillas } = usePlanillas(dispatch);
  const { empleadoOptions, empleadoData, isLoading: isLoadingEmpleados, fetchEmpleados } = useEmpleados(dispatch);

  // Estado del formulario
  const [formData, setFormData] = useState({
    id_compensacion_extra_gestor: "",
    planilla_id_compensacion_extra_gestor: "",
    empleado_id_compensacion_extra_gestor: "",
    remuneracion_actual_gestor: "",
    tipo_jornada_gestor: "",
    tipo_compensacion_extra_gestor: "",
    cantidad_horas_gestor: "",
    fecha_compensacion_gestor: "",
    monto_compensacion_calculado_gestor: "",
    motivo_compensacion_gestor: "",
    aplica_en_compensacion_anual_gestor: false,
    estado_compensacion_extra_gestor: "Pendiente",
  });

  // Estado del empleado seleccionado
  const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cargar datos del registro a editar al montar el componente
  useEffect(() => {
    const datosGuardados = localStorage.getItem("selectedHorasExtra");
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados);
        
        // Función para formatear la fecha al formato YYYY-MM-DD requerido por input type="date"
        const formatearFecha = (fecha) => {
          if (!fecha) return "";
          try {
            const fechaObj = new Date(fecha);
            if (isNaN(fechaObj.getTime())) return "";
            return fechaObj.toISOString().split('T')[0];
          } catch (error) {
            console.error("Error al formatear fecha:", error);
            return "";
          }
        };

        setFormData({
          id_compensacion_extra_gestor: datos.id_compensacion_extra_gestor || "",
          planilla_id_compensacion_extra_gestor: datos.planilla_id_compensacion_extra_gestor || "",
          empleado_id_compensacion_extra_gestor: datos.empleado_id_compensacion_extra_gestor || "",
          remuneracion_actual_gestor: datos.remuneracion_actual_gestor || "",
          tipo_jornada_gestor: datos.tipo_jornada_gestor || "",
          tipo_compensacion_extra_gestor: datos.tipo_compensacion_extra_gestor || "",
          cantidad_horas_gestor: datos.cantidad_horas_gestor || "",
          fecha_compensacion_gestor: formatearFecha(datos.fecha_compensacion_gestor),
          monto_compensacion_calculado_gestor: datos.monto_compensacion_calculado_gestor || "",
          motivo_compensacion_gestor: datos.motivo_compensacion_gestor || "",
          aplica_en_compensacion_anual_gestor: datos.aplica_en_compensacion_anual_gestor === 1,
          estado_compensacion_extra_gestor: datos.estado_compensacion_extra_gestor || "Pendiente",
        });
      } catch (error) {
        console.error("Error al cargar datos del registro:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del registro a editar'
        }).then(() => {
          navigate("/acciones/compensacion-extra/lista");
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontraron datos para editar'
      }).then(() => {
        navigate("/acciones/compensacion-extra/lista");
      });
    }
  }, [navigate]);

  // Cargar planillas al montar el componente
  useEffect(() => {
    fetchPlanillas();
  }, [fetchPlanillas]);

  // Cargar empleados al montar el componente
  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Actualizar datos del empleado cuando se selecciona uno
  useEffect(() => {
    if (formData.empleado_id_compensacion_extra_gestor) {
      const empleadoObj = findById(empleadoData, formData.empleado_id_compensacion_extra_gestor, "id_empleado_gestor");
      setSelectedEmpleadoData(empleadoObj);
      
      if (empleadoObj?.salario_base_empleado_gestor && !formData.remuneracion_actual_gestor) {
        setFormData((prev) => ({
          ...prev,
          remuneracion_actual_gestor: empleadoObj.salario_base_empleado_gestor.toString(),
          tipo_jornada_gestor: empleadoObj.tipo_planilla_empleado_gestor,
        }));
      }
    } else {
      setSelectedEmpleadoData(null);
    }
  }, [formData.empleado_id_compensacion_extra_gestor, empleadoData, formData.remuneracion_actual_gestor]);

  // Calcular compensación extra automáticamente cuando cambien los campos relevantes
  useEffect(() => {
    const salario = parseFloat(formData.remuneracion_actual_gestor);
    const tipoJornada = formData.tipo_jornada_gestor;
    const tipoCompensacion = formData.tipo_compensacion_extra_gestor;
    const horas = parseFloat(formData.cantidad_horas_gestor);

    // Solo calcular si todos los campos necesarios están completos
    if (salario && tipoJornada && tipoCompensacion && horas && horas > 0) {
      try {
        const compensacionCalculada = calcularCompensacionExtra(
          salario,
          tipoJornada,
          tipoCompensacion,
          horas
        );
        setFormData((prev) => ({
          ...prev,
          monto_compensacion_calculado_gestor: compensacionCalculada.toFixed(2),
        }));
      } catch (error) {
        console.error("Error al calcular compensación extra:", error);
        setFormData((prev) => ({
          ...prev,
          monto_compensacion_calculado_gestor: "",
        }));
      }
    } else {
      // Limpiar compensación si faltan datos
      setFormData((prev) => ({
        ...prev,
        monto_compensacion_calculado_gestor: "",
      }));
    }
  }, [formData.remuneracion_actual_gestor, formData.tipo_jornada_gestor, formData.tipo_compensacion_extra_gestor, formData.cantidad_horas_gestor]);

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
   * Valida si el formulario está completo y cumple con las validaciones.
   * @returns {boolean} True si el formulario es válido.
   */
  const isFormValid = () => {
    const horas = parseFloat(formData.cantidad_horas_gestor);
    const compensacion = parseFloat(formData.monto_compensacion_calculado_gestor);
    
    return (
      formData.planilla_id_compensacion_extra_gestor &&
      formData.empleado_id_compensacion_extra_gestor &&
      formData.tipo_compensacion_extra_gestor &&
      formData.cantidad_horas_gestor &&
      formData.fecha_compensacion_gestor &&
      horas >= 0.5 &&
      horas <= 12.0 &&
      compensacion > 0
    );
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
    
    if (!formData.planilla_id_compensacion_extra_gestor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar una planilla'
      });
      return;
    }

    if (!formData.empleado_id_compensacion_extra_gestor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar un socio'
      });
      return;
    }

    if (!formData.tipo_compensacion_extra_gestor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar el tipo de compensación extra'
      });
      return;
    }

    if (!formData.cantidad_horas_gestor || parseFloat(formData.cantidad_horas_gestor) < 0.5) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La cantidad de horas debe ser al menos 0.5 horas'
      });
      return;
    }

    const horas = parseFloat(formData.cantidad_horas_gestor);
    if (horas > 12.0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La cantidad de horas no puede exceder 12 horas por día'
      });
      return;
    }

    if (!formData.fecha_compensacion_gestor) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debe seleccionar la fecha de la compensación'
      });
      return;
    }

    if (!formData.monto_compensacion_calculado_gestor || parseFloat(formData.monto_compensacion_calculado_gestor) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La compensación extra debe ser mayor a cero'
      });
      return;
    }

    // ============================================================================
    // CONFIRMACIÓN
    // ============================================================================
    
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea actualizar la Compensación Extra?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Actualizando compensación extra',
          text: 'Por favor espere...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Enviar datos al backend
        const response = await dispatch(fetchData_api(formData, "gestor/planilla/compensaciones/editar"));

        if (response.success) {
          // Éxito
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'La Compensación Extra ha sido actualizada exitosamente'
          }).then(() => {
            navigate("/acciones/horas-extra/lista");
          });
          
          // Limpiar localStorage
          localStorage.removeItem("selectedHorasExtra");
        } else {
          // Error del backend
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Error al actualizar la compensación extra'
          });
        }
        
      } catch (error) {
        // Error de red o sistema
        console.error('Error al actualizar compensación extra:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al actualizar la compensación extra'
        });
      }
    }
  };

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  return (
    <div className="card">
      {/* Header del formulario */}
      <div className="card-header">
        <h5>Editar Compensacion Extra</h5>
        <p className="text-muted">
          Modifique los campos necesarios para actualizar la compensación extra.
          El sistema recalculará automáticamente el monto según la legislación laboral costarricense.
        </p>
      </div>
      
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* ========================================================================
               ALERTA INFORMATIVA DEL EMPLEADO SELECCIONADO
          ======================================================================== */}
          {selectedEmpleadoData && (
            <div
              className="alert alert-success mb-3"
              role="alert"
              style={{ background: "#c6fcf5" }}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-user-edit me-2"></i>
                <div>
                  <strong>Socio seleccionado:</strong>{" "}
                  {selectedEmpleadoData.nombre_completo_empleado_gestor} |
                  <strong> Cédula:</strong> {selectedEmpleadoData.cedula_empleado_gestor} |
                  <strong> Número de Socio:</strong>{" "}
                  {selectedEmpleadoData.numero_socio_empleado_gestor}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================
               CAMPO DE ESTADO
          ======================================================================== */}
          <div className="col-md-12 mb-3" style={{display: "flex", justifyContent: "flex-end", alignItems: "flex-end", flexDirection: "column"}}>
            <label className="form-label d-block">
              Estado
            </label>
            <select
              className="form-select"
              name="estado_compensacion_extra_gestor"
              value={formData.estado_compensacion_extra_gestor}
              onChange={handleChange}
              style={{ width: "200px" }}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Aplicada">Aplicada</option>
              <option value="Procesada">Procesada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* ========================================================================
               PRIMERA FILA: PLANILLA, EMPLEADO, REMUNERACIÓN Y TIPO DE JORNADA
          ======================================================================== */}
          <div className="row">
            {/* Planilla */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="planilla_id_compensacion_extra_gestor">
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
                  id="planilla_id_compensacion_extra_gestor"
                  name="planilla_id_compensacion_extra_gestor"
                  value={formData.planilla_id_compensacion_extra_gestor}
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
              <label className="form-label" htmlFor="empleado_id_compensacion_extra_gestor">
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
                  id="empleado_id_compensacion_extra_gestor"
                  name="empleado_id_compensacion_extra_gestor"
                  value={formData.empleado_id_compensacion_extra_gestor}
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
          </div>

          {/* ========================================================================
               SEGUNDA FILA: REMUNERACIÓN, TIPO DE JORNADA, TIPO DE COMPENSACIÓN Y HORAS
          ======================================================================== */}
          <div className="row">
            {/* Remuneracion Actual */}
            <div className="col-md-3 mb-3">
              <label
                className="form-label"
                htmlFor="remuneracion_actual_gestor"
              >
                Remuneracion Actual
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="remuneracion_actual_gestor"
                  name="remuneracion_actual_gestor"
                  value={formatCurrency(formData.remuneracion_actual_gestor || 0)}
                  readOnly
                  placeholder="₡0.00"
                />
              </div>
            </div>

            {/* Tipo de Jornada */}
            <div className="col-md-3 mb-3">
              <label
                className="form-label"
                htmlFor="tipo_jornada_gestor"
              >
                Tipo de Jornada
              </label>
              <input
                type="text"
                className="form-control"
                id="tipo_jornada_gestor"
                name="tipo_jornada_gestor"
                value={formData.tipo_jornada_gestor || ""}
                readOnly
                placeholder="No disponible"
              />
            </div>

            {/* Tipo de Compensación Extra */}
            <div className="col-md-3 mb-3">
              <label className="form-label" htmlFor="tipo_compensacion_extra_gestor">
                Tipo de Compensación Extra <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="tipo_compensacion_extra_gestor"
                name="tipo_compensacion_extra_gestor"
                value={formData.tipo_compensacion_extra_gestor}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione tipo</option>
                <option value="Diurna (50%)">Diurna (50% adicional)</option>
                <option value="Nocturna (25%)">Nocturna (25% adicional)</option>
                <option value="Feriado (100%)">Feriado (100% adicional)</option>
                <option value="Extraordinaria Nocturna (75%)">Extraordinaria Nocturna (75% adicional)</option>
                <option value="Extraordinaria Feriado (100%)">Extraordinaria Feriado (100% adicional)</option>
              </select>
            </div>

            {/* Cantidad de Horas */}
            <div className="col-md-3 mb-3">
              <label className="form-label" htmlFor="cantidad_horas_gestor">
                Cantidad de Horas <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className={`form-control ${formData.cantidad_horas_gestor && (parseFloat(formData.cantidad_horas_gestor) < 0.5 || parseFloat(formData.cantidad_horas_gestor) > 12.0) ? 'is-invalid' : ''}`}
                id="cantidad_horas_gestor"
                name="cantidad_horas_gestor"
                value={formData.cantidad_horas_gestor}
                onChange={handleChange}
                placeholder="0.5"
                step="0.5"
                min="0.5"
                max="12.0"
                required
              />
              {formData.cantidad_horas_gestor && (parseFloat(formData.cantidad_horas_gestor) < 0.5 || parseFloat(formData.cantidad_horas_gestor) > 12.0) && (
                <div className="invalid-feedback">
                  Las horas deben estar entre 0.5 y 12.0
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================
               TERCERA FILA: FECHA, COMPENSACIÓN CALCULADA Y MOTIVO
          ======================================================================== */}
          <div className="row">
            {/* Fecha de Compensación */}
            <div className="col-md-3 mb-3">
              <label className="form-label" htmlFor="fecha_compensacion_gestor">
                Fecha de Compensación <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="fecha_compensacion_gestor"
                name="fecha_compensacion_gestor"
                value={formData.fecha_compensacion_gestor}
                onChange={handleChange}
                required
              />
              <div className="form-text">
                Fecha en que se trabajó la compensación extra
              </div>
            </div>

            {/* Compensacion Extra (Calculada) */}
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="monto_compensacion_calculado_gestor">
                Compensacion Extra (Calculada) <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text">₡</span>
                <input
                  type="text"
                  className="form-control"
                  id="monto_compensacion_calculado_gestor"
                  name="monto_compensacion_calculado_gestor"
                  value={formatCurrency(formData.monto_compensacion_calculado_gestor || 0)}
                  readOnly
                  placeholder="Se calcula automáticamente"
                />
              </div>
              <div className="form-text">
                Este monto se calcula automáticamente basado en el salario, tipo de jornada, tipo de compensación y horas trabajadas
              </div>
            </div>

            {/* Motivo de la Compensación */}
            <div className="col-md-3 mb-3">
              <label className="form-label" htmlFor="motivo_compensacion_gestor">
                Motivo de la Compensación
              </label>
              <textarea
                className="form-control"
                id="motivo_compensacion_gestor"
                name="motivo_compensacion_gestor"
                value={formData.motivo_compensacion_gestor}
                onChange={handleChange}
                rows="3"
                placeholder="Describa el motivo de la compensación..."
              />
              <div className="form-text">
                Campo opcional para describir el motivo de la compensación
              </div>
            </div>
          </div>

          {/* ========================================================================
               DETALLE DEL CÁLCULO (Solo se muestra cuando hay compensación calculada)
          ======================================================================== */}
          {formData.monto_compensacion_calculado_gestor && parseFloat(formData.monto_compensacion_calculado_gestor) > 0 && (
            <div className="alert alert-info mb-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="fas fa-calculator me-2"></i>
                <div>
                  <strong>Detalle del Cálculo:</strong>
                  <div className="mt-1">
                    {(() => {
                      try {
                        const salario = parseFloat(formData.remuneracion_actual_gestor);
                        const tipoJornada = formData.tipo_jornada_gestor;
                        const salarioHora = calcularSalarioPorHora(salario, tipoJornada);
                        const multiplicadores = {
                          'diurna (50%)': 1.5,
                          'nocturna (25%)': 1.25,
                          'feriado (100%)': 2.0,
                          'extraordinaria nocturna (75%)': 1.75,
                          'extraordinaria feriado (100%)': 2.0,
                        };
                        const multiplicador = multiplicadores[formData.tipo_compensacion_extra_gestor.toLowerCase()] || 1;
                        
                        return (
                          <>
                            <div>• Salario por hora: {formatCurrency(salarioHora)}</div>
                            <div>• Multiplicador ({formData.tipo_compensacion_extra_gestor}): {multiplicador}x</div>
                            <div>• Horas trabajadas: {formData.cantidad_horas_gestor} horas</div>
                            <div>• Cálculo: {formatCurrency(salarioHora)} × {multiplicador} × {formData.cantidad_horas_gestor} = {formatCurrency(formData.monto_compensacion_calculado_gestor)}</div>
                          </>
                        );
                      } catch (error) {
                        return <div>Error en el cálculo</div>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================
               CAMPO DE APLICA AGUINALDO
          ======================================================================== */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="aplica_en_compensacion_anual_gestor"
                  name="aplica_en_compensacion_anual_gestor"
                  checked={formData.aplica_en_compensacion_anual_gestor}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="aplica_en_compensacion_anual_gestor">
                  ¿Aplica a la Compensacion Anual?
                </label>
                <div className="form-text">
                  Marque esta casilla si las compensaciones extra deben aplicarse también al cálculo de la Compensacion Anual
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================
               BOTONES DE ACCIÓN
          ======================================================================== */}
          <div className="d-flex gap-2 mt-4">
            <button
              type="submit"
              className={`btn ${isFormValid() ? 'btn-primary' : 'btn-secondary'}`}
              disabled={!isFormValid()}
              title={!isFormValid() ? 'Complete todos los campos obligatorios' : ''}
            >
              <i className="fas fa-save me-2"></i>
              Actualizar Compensacion Extra
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/acciones/horas-extra/lista")}
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