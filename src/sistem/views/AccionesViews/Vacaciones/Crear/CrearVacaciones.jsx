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
 * Busca un objeto en un array por id.
 * @param {Array} data - Array de objetos.
 * @param {string|number} id - Valor a buscar.
 * @param {string} idKey - Clave del id.
 * @returns {Object|null}
 */
function findById(data, id, idKey) {
   return Array.isArray(data) ? data.find((item) => item[idKey] == id) || null : null;
}

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
              empleadosFiltrados.map((empleado) => ({
                value: empleado.id_empleado_gestor,
                label: `${empleado.nombre_completo_empleado_gestor} ${empleado.moneda_pago_empleado_gestor === "colones" ? "₡" : "$"}`
              }))
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

export const CrearVacaciones = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // ============================================================================
   // HOOKS Y ESTADOS
   // ============================================================================
   
   // Hooks para obtener datos
   const { planillaOptions, planillaData, isLoading: isLoadingPlanillas, fetchPlanillas } = usePlanillas(dispatch);
   const { empleadoOptions, empleadoData, isLoading: isLoadingEmpleados, fetchEmpleados } = useEmpleados(dispatch);

   // Estados de selección y formulario
   const [formData, setFormData] = useState({
      planilla: "",
      empleado: "",
      fecha_inicio_vacaciones: "",
      dias_vacaciones: "",
      motivo_vacaciones: "",
      estado: "Activo",
   });

   const [selectedPlanillaData, setSelectedPlanillaData] = useState(null);
   const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

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

   // Cuando cambia el empleado, buscar datos
   useEffect(() => {
      if (formData.empleado) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         setSelectedEmpleadoData(empleadoObj);
      } else {
         setSelectedEmpleadoData(null);
      }
   }, [formData.empleado, empleadoData]);

   /**
    * Maneja el cambio de cualquier input del formulario.
    */
   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   /**
    * Maneja el submit del formulario.
    */
   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedEmpleadoData) return;

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

      if (!formData.fecha_inicio_vacaciones) {
         setError(true);
         setMessage("La fecha de inicio es obligatoria.");
         return;
      }

      if (!formData.dias_vacaciones || isNaN(formData.dias_vacaciones) || Number(formData.dias_vacaciones) <= 0) {
         setError(true);
         setMessage("La cantidad de días es obligatoria y debe ser mayor a cero.");
         return;
      }

      // ============================================================================
      // CONFIRMACIÓN
      // ============================================================================
      
      const nombre = selectedEmpleadoData.nombre_completo_empleado_gestor;
      const socio = selectedEmpleadoData.numero_socio_empleado_gestor;
      const fechaInicio = formData.fecha_inicio_vacaciones;
      const diasVacaciones = formData.dias_vacaciones;

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
          <b>Fecha de Inicio:</b> <span style="font-weight:500;">${fechaInicio}</span>
        </div>
        <div style="font-size:1.1em; margin-bottom:6px;">
          <b>Días de Vacaciones:</b> <span style="font-weight:500; color:blue;">${diasVacaciones}</span>
        </div>
      </div>
    `;

      const result = await Swal.fire({
         title: "¿Está seguro de crear este registro de vacaciones?",
         html: htmlMsg,
         icon: "question",
         showCancelButton: true,
         confirmButtonText: "Sí, crear vacaciones",
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
               title: "Creando registro de vacaciones",
               text: "Por favor espere...",
               allowOutsideClick: false,
               didOpen: () => {
                  Swal.showLoading();
               },
            });
            
            // Siempre establecer el estado como "Aprobado"
            const datosEnviar = {
               ...formData,
               estado: "Aprobado"
            };
            
            const response = await dispatch(fetchData_api(datosEnviar, "gestor/vacaciones/crear"));

            if (response.success) {
               setError(false);

               Swal.fire({
                  title: "Vacaciones creadas exitosamente",
                  text: "El registro de vacaciones ha sido creado correctamente",
                  icon: "success",
                  confirmButtonText: "Aceptar",
               }).then(() => {
                  navigate("/acciones/vacaciones/lista");
               });
            } else {
               const errorMessage = response.message || "Error al crear el registro de vacaciones";
               setError(true);
               setMessage(errorMessage);
               Swal.fire({
                  title: "Error al crear las vacaciones",
                  text: errorMessage,
                  icon: "error",
                  confirmButtonText: "Aceptar",
               });
            }
         } catch (error) {
            console.error('Error al crear registro de vacaciones:', error);
            Swal.fire({
               icon: 'error',
               title: 'Error',
               text: 'Hubo un error al crear el registro de vacaciones'
            });
         }
      }
   };

   return (
      <div className="card">
         <div className="card-header">
            <h5>Crear Registro de Vacaciones</h5>
            <p className="text-muted">
               Complete el formulario para registrar las vacaciones de un socio.
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
                        onChange={(e) =>
                           setFormData((prev) => ({
                              ...prev,
                              estado: e.target.checked ? "Activo" : "Inactivo",
                           }))
                        }
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
                  
                  {/* Fecha de Inicio */}
                  <div className="col-md-6 mb-3">
                     <label
                        className="form-label"
                        htmlFor="fecha_inicio_vacaciones"
                     >
                        Fecha de Inicio <span className="text-danger">*</span>
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_inicio_vacaciones"
                        name="fecha_inicio_vacaciones"
                        value={formData.fecha_inicio_vacaciones || ""}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  
                  {/* Días de Vacaciones */}
                  <div className="col-md-6 mb-3">
                     <label
                        className="form-label"
                        htmlFor="dias_vacaciones"
                     >
                        Días de Vacaciones <span className="text-danger">*</span>
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="dias_vacaciones"
                        name="dias_vacaciones"
                        value={formData.dias_vacaciones}
                        onChange={handleChange}
                        placeholder="0"
                        step="0.5"
                        min="0"
                        required
                     />
                  </div>
                  
                  {/* Motivo */}
                  <div className="col-md-12 mb-3">
                     <label
                        className="form-label"
                        htmlFor="motivo_vacaciones"
                     >
                        Motivo u Observaciones
                     </label>
                     <textarea
                        className="form-control"
                        id="motivo_vacaciones"
                        name="motivo_vacaciones"
                        value={formData.motivo_vacaciones}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Ingrese el motivo o observaciones de las vacaciones..."
                     />
                  </div>
               </div>
               
               {/* Botones de acción */}
               <div className="d-flex gap-2 mt-4">
                  <button
                     type="submit"
                     className="btn btn-primary"
                  >
                     <i className="fas fa-save me-2"></i>
                     Crear Registro de Vacaciones
                  </button>
                  <button
                     type="button"
                     className="btn btn-secondary"
                     onClick={() => navigate('/acciones/vacaciones/lista')}
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