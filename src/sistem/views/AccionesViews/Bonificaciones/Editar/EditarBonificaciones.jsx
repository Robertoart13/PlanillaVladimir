import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrencyByPlanilla, getMonedaSymbol } from "../../../../../hooks/formatCurrency";
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
 * Valida y formatea una fecha para el input de tipo date.
 * @param {string|Date} fecha - Fecha a validar y formatear.
 * @returns {string} Fecha formateada en formato YYYY-MM-DD o fecha actual si es inválida.
 */
function formatearFechaParaInput(fecha) {
   if (!fecha) return new Date().toISOString().split('T')[0];
   
   try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
         return new Date().toISOString().split('T')[0];
      }
      return fechaObj.toISOString().split('T')[0];
   } catch (error) {
      return new Date().toISOString().split('T')[0];
   }
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

   const fetchEmpleados = useCallback(async () => {
      setIsLoading(true);
      setEmpleadoOptions([]);
      setEmpleadoData([]);
      const response = await dispatch(fetchData_api(null, "gestor/planillas/empleados/options"));
      if (response.success && response.data.array?.length > 0) {
         setEmpleadoData(response.data.array);
         setEmpleadoOptions(
            response.data.array.map((empleado) => ({
              value: empleado.id_empleado_gestor,
              label: `${empleado.nombre_completo_empleado_gestor} ${empleado.moneda_pago_empleado_gestor === "colones" ? "₡" : "$"}`
            }))
         );
      }
      setIsLoading(false);
   }, [dispatch]);

   return { empleadoOptions, empleadoData, isLoading, fetchEmpleados };
}

export const EditarBonificaciones = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Estados de planilla y empleado
   const {
      planillaOptions,
      planillaData,
      isLoading: isLoadingPlanillas,
      fetchPlanillas,
   } = usePlanillas(dispatch);
   const {
      empleadoOptions,
      empleadoData,
      isLoading: isLoadingEmpleados,
      fetchEmpleados,
   } = useEmpleados(dispatch);

   // Estados de selección y formulario
   const [formData, setFormData] = useState({
      id_compensacion_metrica_gestor: "",
      planilla: "",
      empleado: "",
      tipo_compensacion_metrica: "productividad",
      monto_bonificacion: "",
      motivo_compensacion: "-- no es obligatorio",
      fecha_compensacion: new Date().toISOString().split('T')[0],
      aplica_Compensacion_Anual: false,
      estado: "Pendiente",
   });
   const [selectedPlanillaData, setSelectedPlanillaData] = useState(null);
   const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

   // Estado de error y mensaje
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [isDataLoaded, setIsDataLoaded] = useState(false);
   const [canEdit, setCanEdit] = useState(true);
   const [isReady, setIsReady] = useState(false);

   // Cargar datos de la compensación desde localStorage al montar el componente
   useEffect(() => {
      const selectedBonificacion = localStorage.getItem("selectedBonificacion");
      if (selectedBonificacion) {
         try {
            const bonificacionData = JSON.parse(selectedBonificacion);
            
            // Debug: mostrar los datos que llegan del localStorage
            console.log("Datos del localStorage:", bonificacionData);
            console.log("Fecha original:", bonificacionData.fecha_compensacion_metrica_gestor);

            // Mapear los datos del localStorage al formData
            const mappedData = {
               id_compensacion_metrica_gestor: bonificacionData.id_compensacion_metrica_gestor || "",
               planilla: bonificacionData.planilla_id_compensacion_metrica_gestor?.toString() || "",
               empleado: bonificacionData.empleado_id_compensacion_metrica_gestor?.toString() || "",
               tipo_compensacion_metrica: bonificacionData.tipo_compensacion_metrica_gestor || "productividad",
               monto_bonificacion: bonificacionData.monto_compensacion_metrica_gestor?.toString() || "",
               motivo_compensacion: bonificacionData.motivo_compensacion_gestor || "-- no es obligatorio",
               fecha_compensacion: formatearFechaParaInput(bonificacionData.fecha_compensacion_metrica_gestor),
               aplica_Compensacion_Anual: bonificacionData.aplica_en_compensacion_anual_gestor === 1,
               estado: bonificacionData.estado_compensacion_metrica_gestor || "Pendiente",
            };

            // Debug: mostrar los datos mapeados
            console.log("Datos mapeados:", mappedData);
            console.log("Fecha formateada:", mappedData.fecha_compensacion);

            setFormData(mappedData);
            setIsDataLoaded(true);
         } catch (error) {
            setError(true);
            setMessage("Error al cargar los datos de la compensación por métrica");
         }
      } else {
         // Si no hay datos en localStorage, redirigir a la lista
         navigate("/acciones/compensacion-metrica/lista");
      }
   }, [navigate]);

   // Limpia el mensaje de error al montar el componente
   useEffect(() => {
      setMessage("");
      setError(false);
   }, []);

   // Cargar planillas al montar
   useEffect(() => {
      fetchPlanillas();
   }, [fetchPlanillas]);

   // Verificar si la planilla del localStorage existe en las opciones disponibles
   useEffect(() => {
      if (isDataLoaded && formData.planilla) {
         // Si no hay planillas cargadas aún, no hacer nada
         if (planillaData.length === 0) {
            return;
         }

         const planillaObj = findById(planillaData, formData.planilla, "planilla_id");

         if (!planillaObj) {
            // La planilla no está disponible en las opciones
            setCanEdit(false);
            setError(true);
         } else {
            // La planilla existe, verificar su estado
            const planillaEstado = planillaObj.planilla_estado;
            const puedeEditar = planillaEstado === "En Proceso";
            setCanEdit(puedeEditar);

            if (!puedeEditar) {
               setError(true);
               setMessage(
                  `No se puede editar la compensación por métrica. El estado de la planilla es "${planillaEstado}". Solo se pueden editar compensaciones cuando la planilla está "En Proceso".`,
               );
            } else {
               setError(false);
               setMessage("");
            }
         }
      }
   }, [isDataLoaded, planillaData, formData.planilla]);

   // Cuando cambia la planilla, buscar datos y empleados
   useEffect(() => {
      if (formData.planilla) {
         const planillaObj = findById(planillaData, formData.planilla, "planilla_id");
         setSelectedPlanillaData(planillaObj);

         // Verificar si se puede editar basado en el estado de la planilla
         if (planillaObj) {
            const planillaEstado = planillaObj.planilla_estado;
            const puedeEditar = planillaEstado === "En Proceso";
            setCanEdit(puedeEditar);

            if (!puedeEditar) {
               setError(true);
               setMessage(
                  `No se puede editar la compensación por métrica. El estado de la planilla es "${planillaEstado}". Solo se pueden editar compensaciones cuando la planilla está "En Proceso".`,
               );
            } else {
               setError(false);
               setMessage("");
            }
         }

         fetchEmpleados();
      } else {
         setSelectedPlanillaData(null);
         setCanEdit(false);
         setError(false);
         setMessage("");
      }
   }, [formData.planilla, planillaData, fetchEmpleados]);

   // Cuando cambia el empleado, buscar datos
   useEffect(() => {
      if (formData.empleado && empleadoData.length > 0) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         setSelectedEmpleadoData(empleadoObj);
      } else {
         setSelectedEmpleadoData(null);
      }
   }, [formData.empleado, empleadoData]);

   // Asegurar que el empleado se mantenga seleccionado cuando se cargan los empleados
   useEffect(() => {
      if (isDataLoaded && formData.empleado && empleadoData.length > 0) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         if (empleadoObj) {
            setSelectedEmpleadoData(empleadoObj);
         }
      }
   }, [empleadoData, isDataLoaded, formData.empleado]);

   useEffect(() => {
      setIsReady(isDataLoaded && !isLoadingPlanillas);
   }, [isDataLoaded, isLoadingPlanillas]);

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

      // Verificar si se puede editar
      if (!canEdit) {
         setError(true);
         setMessage(
            "No se puede editar la compensación por métrica. El estado de la planilla no permite ediciones.",
         );
         return;
      }

      // Validación de monto de la compensación
      if (
         !formData.monto_bonificacion ||
         isNaN(formData.monto_bonificacion) ||
         Number(formData.monto_bonificacion) <= 0
      ) {
         setError(true);
         setMessage("El monto de la compensación es obligatorio y debe ser mayor a cero.");
         return;
      }

      // Validación de fecha de compensación
      if (!formData.fecha_compensacion) {
         setError(true);
         setMessage("La fecha de compensación es obligatoria.");
         return;
      }

      // Validar que la fecha sea válida
      const fechaFormateada = formatearFechaParaInput(formData.fecha_compensacion);
      if (fechaFormateada !== formData.fecha_compensacion) {
         setError(true);
         setMessage("La fecha de compensación no es válida.");
         return;
      }

      const aplicaCompensacionAnual = formData.aplica_Compensacion_Anual;
      const nombre = selectedEmpleadoData.nombre_completo_empleado_gestor;
      const socio = selectedEmpleadoData.numero_socio_empleado_gestor;

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
          <b>¿Aplica a la Compensación Anual?:</b>
          <span style="font-weight:500; color:${aplicaCompensacionAnual ? "green" : "red"};">
            ${aplicaCompensacionAnual ? "Sí" : "No"}
          </span>
        </div>
        ${
           !aplicaCompensacionAnual
              ? `<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">
                ¿Aplica a la Compensación Anual? está desmarcado.<br/>
                ¿Está seguro que esta compensación por métrica no aplica a la compensación anual?
              </div>`
              : ""
        }
      </div>
    `;

      const result = await Swal.fire({
         title: "¿Está seguro de actualizar esta compensación por métrica?",
         html: htmlMsg,
         icon: aplicaCompensacionAnual ? "question" : "warning",
         showCancelButton: true,
         confirmButtonText: "Sí, actualizar",
         cancelButtonText: "Cancelar",
         focusCancel: true,
         customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-secondary ms-2",
         },
         buttonsStyling: false,
      });

      if (result.isConfirmed) {
         Swal.fire({
            title: "Actualizando compensación por métrica",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading();
            },
         });

         // Preparar datos para la actualización
         const updateData = {
            id_compensacion_metrica_gestor: formData.id_compensacion_metrica_gestor,
            planilla_id_compensacion_metrica_gestor: parseInt(formData.planilla),
            empleado_id_compensacion_metrica_gestor: parseInt(formData.empleado),
            tipo_compensacion_metrica_gestor: formData.tipo_compensacion_metrica,
            monto_compensacion_metrica_gestor: parseFloat(formData.monto_bonificacion),
            motivo_compensacion_gestor: formData.motivo_compensacion,
            fecha_compensacion_metrica_gestor: formData.fecha_compensacion,
            aplica_en_compensacion_anual_gestor: formData.aplica_Compensacion_Anual ? 1 : 0,
            estado_compensacion_metrica_gestor: formData.estado,
         };

         const response = await dispatch(fetchData_api(updateData, "gestor/planilla/compensaciones-metrica/editar"));

         if (response.success) {
            setError(false);

            Swal.fire({
               title: "Compensación por métrica actualizada exitosamente",
               text: "La Compensación por Métrica ha sido actualizada exitosamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
               // Limpiar localStorage después de actualizar exitosamente
               localStorage.removeItem("selectedBonificacion");
               navigate("/acciones/compensacion-metrica/lista");
            });
         } else {
            const errorMessage = response.message || "Error al actualizar la Compensación por Métrica";
            setError(true);
            setMessage(errorMessage);
            Swal.fire({
               title: "Error al actualizar la Compensación por Métrica",
               text: errorMessage,
               icon: "error",
               confirmButtonText: "Aceptar",
            });
         }
      }
   };

   return (
      <div className="card">
         {!isReady ? (
            <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="text-center">
                  <div className="spinner-border text-primary mb-2" role="status">
                     <span className="visually-hidden">Cargando...</span>
                  </div>
                  <div>Cargando información...</div>
               </div>
            </div>
         ) : (
            <>
               <div className="card-header">
                  <h5>Editar Compensacion por Metrica</h5>
                  <p className="text-muted">
                     Modifique los campos necesarios para actualizar el registro de Compensacion por Metrica.
                  </p>
               </div>
               <div className="card-body">
                  <form onSubmit={handleSubmit}>
                     {/* Alert for Planilla Status */}
                     {selectedPlanillaData && (
                        <div
                           className={`alert ${canEdit ? "alert-info" : "alert-warning"} mb-3`}
                           role="alert"
                        >
                           <div className="d-flex align-items-center">
                              <i
                                 className={`fas ${
                                    canEdit ? "fa-info-circle" : "fa-exclamation-triangle"
                                 } me-2`}
                              ></i>
                              <div>
                                 <strong>Estado de la Planilla:</strong>{" "}
                                 {selectedPlanillaData.planilla_estado || "No disponible"}
                                 {selectedPlanillaData.planilla_codigo && (
                                    <span className="ms-2">
                                       <strong>Código:</strong> {selectedPlanillaData.planilla_codigo}
                                    </span>
                                 )}
                                 {!canEdit && (
                                    <div className="mt-2">
                                       <strong>⚠️ No se puede editar:</strong> Solo se pueden editar
                                       compensaciones cuando la planilla está "En Proceso".
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Alert for Planilla Not Available */}
                     {isDataLoaded &&
                        formData.planilla &&
                        !selectedPlanillaData && (
                           <div
                              className="alert alert-danger mb-3"
                              role="alert"
                           >
                              <div className="d-flex align-items-center">
                                 <i className="fas fa-exclamation-triangle me-2"></i>
                                 <div>
                                    <strong>Planilla no disponible:</strong> La planilla seleccionada no
                                    está disponible en las opciones actuales.
                                    <div className="mt-2">
                                       <strong>Posibles razones:</strong>
                                       <ul className="mb-0 mt-1">
                                          <li>La planilla puede estar cerrada</li>
                                          <li>La planilla puede estar aplicada</li>
                                          <li>La planilla puede estar procesada</li>
                                          <li>La planilla puede estar cancelada</li>
                                       </ul>
                                    </div>
                                    <div className="mt-2">
                                       <strong>Acción requerida:</strong> Favor verificar en la vista de
                                       planillas si está en proceso.
                                    </div>
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

                     {/* Mostrar mensaje de error general */}
                     {error && message && !selectedPlanillaData && (
                        <div
                           className="alert alert-danger mt-2"
                           role="alert"
                        >
                           {message}
                        </div>
                     )}

                     {/* Mostrar mensaje de error cuando la planilla existe pero no se puede editar */}
                     {error && message && selectedPlanillaData && !canEdit && (
                        <div
                           className="alert alert-warning mt-2"
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
                              checked={formData.estado === "Pendiente"}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    estado: e.target.checked ? "Pendiente" : "Cancelada",
                                 }))
                              }
                              disabled={!canEdit}
                           />
                           <label
                              className="form-check-label"
                              htmlFor="estado"
                           >
                              {formData.estado === "Pendiente" ? "Pendiente" : "Cancelada"}
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
                              onChange={handleChange}
                              required
                              disabled
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
                              disabled
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

                        {/* Tipo de Compensación por Métrica */}
                        <div className="col-md-6 mb-3">
                           <label
                              className="form-label"
                              htmlFor="tipo_compensacion_metrica"
                           >
                              Tipo de Compensación por Métrica <span className="text-danger">*</span>
                           </label>
                           <select
                              className="form-select"
                              id="tipo_compensacion_metrica"
                              name="tipo_compensacion_metrica"
                              value={formData.tipo_compensacion_metrica}
                              onChange={handleChange}
                              required
                              disabled={!canEdit}
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
                           <label
                              className="form-label"
                              htmlFor="fecha_compensacion"
                           >
                              Fecha de Compensación <span className="text-danger">*</span>
                           </label>
                           <input
                              type="date"
                              className={`form-control ${!formData.fecha_compensacion ? 'is-invalid' : ''}`}
                              id="fecha_compensacion"
                              name="fecha_compensacion"
                              value={formData.fecha_compensacion}
                              onChange={handleChange}
                              required
                              disabled={!canEdit}
                           />
                           {!formData.fecha_compensacion && (
                              <div className="invalid-feedback">
                                 La fecha de compensación es obligatoria
                              </div>
                           )}
                           <div className="form-text">
                              Fecha en que se registra o aplica la compensación
                           </div>
                        </div>

                        {/* Monto de Compensacion por Metrica */}
                        <div className="col-md-6 mb-3">
                           <label
                              className="form-label"
                              htmlFor="monto_bonificacion"
                           >
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
                                 disabled={!canEdit}
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
                           <label
                              className="form-label"
                              htmlFor="motivo_compensacion"
                           >
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
                              disabled={!canEdit}
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
                                 disabled={!canEdit}
                              />
                              <label
                                 className="form-check-label"
                                 htmlFor="aplica_Compensacion_Anual"
                              >
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
                           className="btn btn-primary"
                           disabled={!canEdit}
                        >
                           <i className="fas fa-save me-2"></i>
                           Actualizar Compensacion por Metrica
                        </button>
                        {!canEdit && (
                           <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => navigate("/acciones/compensacion-metrica/lista")}
                           >
                              <i className="fas fa-arrow-left me-2"></i>
                              Volver a la Lista
                           </button>
                        )}
                     </div>
                  </form>
               </div>
            </>
         )}
      </div>
   );
};