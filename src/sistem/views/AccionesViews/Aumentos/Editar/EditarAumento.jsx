import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import { formatCurrency } from "../../../../../hooks/formatCurrency";
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
 * Formatea una fecha para el campo date de HTML (YYYY-MM-DD).
 * @param {string} fecha - Fecha en cualquier formato.
 * @returns {string} Fecha en formato YYYY-MM-DD o cadena vacía si no es válida.
 */
function formatearFechaParaInput(fecha) {
   if (!fecha) return "";
   
   try {
      const fechaObj = new Date(fecha);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaObj.getTime())) {
         return "";
      }
      
      // Formatear a YYYY-MM-DD
      const año = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      
      return `${año}-${mes}-${dia}`;
   } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "";
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
            getOptionList(
               response.data.array,
               "id_empleado_gestor",
               "nombre_completo_empleado_gestor",
            ),
         );
      }
      setIsLoading(false);
   }, [dispatch]);

   return { empleadoOptions, empleadoData, isLoading, fetchEmpleados };
}

export const EditarAumento = () => {
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
      id_aumento_gestor: "",
      empresa: "",
      planilla: "",
      empleado: "",
      remuneracion_actual: "",
      tipo_ajuste: "Fijo",
      monto_aumento: "",
      remuneracion_nueva: "",
      fecha_efectiva: "",
      estado: "Activo",
      estado_procesado: "",
   });
   const [selectedPlanillaData, setSelectedPlanillaData] = useState(null);
   const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

   // Estado de error y mensaje
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [isDataLoaded, setIsDataLoaded] = useState(false);
   const [canEdit, setCanEdit] = useState(true);
   const [isReady, setIsReady] = useState(false);

   // Cargar datos del aumento desde localStorage al montar el componente
   useEffect(() => {
      const selectedAumento = localStorage.getItem("selectedAumento");
      if (selectedAumento) {
         try {
            const aumentoData = JSON.parse(selectedAumento);

            // Debug: Mostrar la fecha original para depuración
            console.log("Fecha original del backend:", aumentoData.fecha_efectiva_aumento_gestor);
            console.log("Fecha formateada:", formatearFechaParaInput(aumentoData.fecha_efectiva_aumento_gestor));

            // Mapear los datos del localStorage al formData
            const mappedData = {
               id_aumento_gestor: aumentoData.id_aumento_gestor || "",
               empresa: "",
               planilla: aumentoData.planilla_id_aumento_gestor || "",
               empleado: aumentoData.empleado_id_aumento_gestor || "",
               remuneracion_actual: aumentoData.remuneracion_actual_aumento_gestor || "",
               tipo_ajuste: aumentoData.tipo_ajuste_aumento_gestor || "Fijo",
               monto_aumento: aumentoData.monto_aumento_gestor || "",
               remuneracion_nueva: aumentoData.remuneracion_nueva_aumento_gestor || "",
               fecha_efectiva: formatearFechaParaInput(aumentoData.fecha_efectiva_aumento_gestor),
               estado: "Activo", // Por defecto activo ya que no existe estado_aumento_gestor
               estado_procesado: aumentoData.estado_planilla_aumento_gestor || "",
            };

            setFormData(mappedData);
            setIsDataLoaded(true);
         } catch (error) {
            setError(true);
            setMessage("Error al cargar los datos del aumento");
         }
      } else {
         // Si no hay datos en localStorage, redirigir a la lista
         navigate("/acciones/aumentos/lista");
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
                  `No se puede editar el aumento. El estado de la planilla es "${planillaEstado}". Solo se pueden editar aumentos cuando la planilla está "En Proceso".`,
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
                  `No se puede editar el aumento. El estado de la planilla es "${planillaEstado}". Solo se pueden editar aumentos cuando la planilla está "En Proceso".`,
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

   // Cuando cambia el empleado, buscar datos y actualizar remuneración
   useEffect(() => {
      if (formData.empleado && empleadoData.length > 0) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         setSelectedEmpleadoData(empleadoObj);

         // Solo actualizar remuneración actual si no hay datos cargados desde localStorage
         if (
            isDataLoaded &&
            !formData.remuneracion_actual &&
            empleadoObj?.salario_base_empleado_gestor
         ) {
            setFormData((prev) => ({
               ...prev,
               remuneracion_actual: empleadoObj.salario_base_empleado_gestor.toString(),
            }));
         }
      } else {
         setSelectedEmpleadoData(null);
      }
   }, [formData.empleado, empleadoData, isDataLoaded, formData.remuneracion_actual]);

   // Asegurar que el empleado se mantenga seleccionado cuando se cargan los empleados
   useEffect(() => {
      if (isDataLoaded && formData.empleado && empleadoData.length > 0) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         if (empleadoObj) {
            setSelectedEmpleadoData(empleadoObj);
         }
      }
   }, [empleadoData, isDataLoaded, formData.empleado]);

   // Calcular Remuneracion nueva cuando cambie el monto de aumento, tipo de ajuste o remuneracion actual
   useEffect(() => {
      const actual = parseFloat(formData.remuneracion_actual);
      const aumento = parseFloat(formData.monto_aumento);
      
      if (!isNaN(actual) && !isNaN(aumento) && formData.monto_aumento !== "") {
         let nuevo = 0;
         
         if (formData.tipo_ajuste === "Fijo") {
            // Aumento fijo: suma directa
            nuevo = actual + aumento;
         } else if (formData.tipo_ajuste === "Porcentual") {
            // Aumento porcentual: calcular porcentaje
            const porcentaje = aumento / 100;
            nuevo = actual + (actual * porcentaje);
         }
         
         const nuevoCalculado = nuevo.toFixed(2);
         setFormData((prev) => ({
            ...prev,
            remuneracion_nueva: nuevoCalculado,
         }));
      } else {
         setFormData((prev) => ({
            ...prev,
            remuneracion_nueva: "",
         }));
      }
   }, [formData.remuneracion_actual, formData.monto_aumento, formData.tipo_ajuste]);

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
            "No se puede editar el aumento. El estado de la planilla no permite ediciones.",
         );
         return;
      }

      // Validaciones
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

      if (!formData.remuneracion_actual || isNaN(formData.remuneracion_actual) || Number(formData.remuneracion_actual) <= 0) {
         setError(true);
         setMessage("La remuneración actual es obligatoria y debe ser mayor a cero.");
         return;
      }

      if (!formData.monto_aumento || isNaN(formData.monto_aumento) || Number(formData.monto_aumento) <= 0) {
         setError(true);
         setMessage("El monto del aumento es obligatorio y debe ser mayor a cero.");
         return;
      }

      if (!formData.fecha_efectiva) {
         setError(true);
         setMessage("La fecha efectiva es obligatoria.");
         return;
      }

      const nombre = selectedEmpleadoData.nombre_completo_empleado_gestor;
      const socio = selectedEmpleadoData.numero_socio_empleado_gestor;
      const tipoAjuste = formData.tipo_ajuste;
      const montoAumento = formData.monto_aumento;
      const fechaEfectiva = formData.fecha_efectiva;

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
          <b>Tipo de Ajuste:</b> <span style="font-weight:500; color:blue;">${tipoAjuste}</span>
        </div>
        <div style="font-size:1.1em; margin-bottom:6px;">
          <b>Monto del Aumento:</b> <span style="font-weight:500; color:green;">
            ${tipoAjuste === "Fijo" ? "₡" : "%"}${montoAumento}
          </span>
        </div>
        <div style="font-size:1.1em; margin-bottom:6px;">
          <b>Fecha Efectiva:</b> <span style="font-weight:500;">${fechaEfectiva}</span>
        </div>
      </div>
    `;

      const result = await Swal.fire({
         title: "¿Está seguro de actualizar este aumento salarial?",
         html: htmlMsg,
         icon: "question",
         showCancelButton: true,
         confirmButtonText: "Sí, actualizar aumento",
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
            title: "Actualizando aumento salarial",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading();
            },
         });

         const response = await dispatch(
            fetchData_api(formData, "gestor/planilla/aumentos/editar"),
         );

         if (response.success) {
            setError(false);

            Swal.fire({
               title: "Aumento salarial actualizado exitosamente",
               text: "El aumento ha sido actualizado correctamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
               navigate("/acciones/aumentos/lista");
            });
         } else {
            const errorMessage = response.message || "Error al actualizar el aumento salarial";
            setError(true);
            setMessage(errorMessage);
            Swal.fire({
               title: "Error al actualizar el aumento",
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
                  <h5>Editar Aumento Salarial</h5>
                  <p className="text-muted">
                     Modifique el formulario para actualizar el aumento salarial.
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
                                       aumentos cuando la planilla está "En Proceso".
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
                              checked={formData.estado === "Activo"}
                              onChange={(e) =>
                                 setFormData((prev) => ({
                                    ...prev,
                                    estado: e.target.checked ? "Activo" : "Inactivo",
                                 }))
                              }
                              disabled={!canEdit}
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
                        
                        {/* Remuneracion Actual */}
                        <div className="col-md-4 mb-3">
                           <label
                              className="form-label"
                              htmlFor="remuneracion_actual"
                           >
                              Remuneración Actual <span className="text-danger">*</span>
                           </label>
                           <div className="input-group">
                              <span className="input-group-text">₡</span>
                              <input
                                 type="text"
                                 className="form-control"
                                 id="remuneracion_actual"
                                 name="remuneracion_actual"
                                 value={formatCurrency(formData.remuneracion_actual || 0)}
                                 readOnly
                                 placeholder="₡0.00"
                              />
                           </div>
                        </div>
                        
                        {/* Tipo de Ajuste */}
                        <div className="col-md-4 mb-3">
                           <label
                              className="form-label"
                              htmlFor="tipo_ajuste"
                           >
                              Tipo de Ajuste <span className="text-danger">*</span>
                           </label>
                           <select
                              className="form-select"
                              id="tipo_ajuste"
                              name="tipo_ajuste"
                              value={formData.tipo_ajuste}
                              onChange={handleChange}
                              required
                              disabled={!canEdit}
                           >
                              <option value="Fijo">Fijo (₡)</option>
                              <option value="Porcentual">Porcentual (%)</option>
                           </select>
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
                              <span className="input-group-text">
                                 {formData.tipo_ajuste === "Fijo" ? "₡" : "%"}
                              </span>
                              <input
                                 type="number"
                                 className="form-control"
                                 id="monto_aumento"
                                 name="monto_aumento"
                                 value={formData.monto_aumento}
                                 onChange={handleChange}
                                 placeholder={formData.tipo_ajuste === "Fijo" ? "0.00" : "0"}
                                 step={formData.tipo_ajuste === "Fijo" ? "0.01" : "0.01"}
                                 min="0"
                                 disabled={!canEdit}
                              />
                           </div>
                           <small className="form-text text-muted">
                              {formData.tipo_ajuste === "Fijo" 
                                 ? "Ingrese el monto fijo a sumar" 
                                 : "Ingrese el porcentaje a aplicar"}
                           </small>
                        </div>
                        
                        {/* Remuneracion Nueva */}
                        <div className="col-md-6 mb-3">
                           <label
                              className="form-label"
                              htmlFor="remuneracion_nueva"
                           >
                              Remuneración Nueva
                           </label>
                           <div className="input-group">
                              <span className="input-group-text">₡</span>
                              <input
                                 type="text"
                                 className="form-control"
                                 id="remuneracion_nueva"
                                 name="remuneracion_nueva"
                                 value={formatCurrency(formData.remuneracion_nueva || 0)}
                                 readOnly
                                 placeholder="Se calcula automáticamente"
                              />
                           </div>
                        </div>
                        
                        {/* Fecha Efectiva */}
                        <div className="col-md-6 mb-3">
                           <label
                              className="form-label"
                              htmlFor="fecha_efectiva"
                           >
                              Fecha Efectiva <span className="text-danger">*</span>
                           </label>
                           <input
                              type="date"
                              className="form-control"
                              id="fecha_efectiva"
                              name="fecha_efectiva"
                              value={formData.fecha_efectiva || ""}
                              onChange={handleChange}
                              required
                              disabled={!canEdit}
                           />
                           {!formData.fecha_efectiva && (
                              <small className="form-text text-warning">
                                 ⚠️ La fecha no se pudo cargar correctamente. Por favor, seleccione una nueva fecha.
                              </small>
                           )}
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
                           Actualizar Aumento Salarial
                        </button>
                        {!canEdit && (
                           <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => navigate("/acciones/aumentos/lista")}
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
