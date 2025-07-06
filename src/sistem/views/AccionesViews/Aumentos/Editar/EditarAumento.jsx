import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchData_api } from "../../../../../store/fetchData_api/fetchData_api_Thunks";
import formatCurrency from "../../../../../hooks/formatCurrency";
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
      monto_aumento: "",
      aplica_aguinaldo: false,
      estado: "Activo",
      Remuneracion_Actual: "",
      Remuneracion_Nueva: "",
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

            // Mapear los datos del localStorage al formData
            const mappedData = {
               id_aumento_gestor: aumentoData.id_aumento_gestor || "",
               empresa: "",
               planilla: aumentoData.planilla_id_aumento_gestor || "",
               empleado: aumentoData.empleado_id_aumento_gestor || "",
               monto_aumento: aumentoData.monto_aumento_gestor || "",
               aplica_aguinaldo: aumentoData.aplica_aguinaldo_aumento_gestor === 1,
               estado: aumentoData.estado_aumento_gestor === 1 ? "Activo" : "Inactivo",
               Remuneracion_Actual: aumentoData.remuneracion_actual_aumento_gestor || "",
               Remuneracion_Nueva: aumentoData.remuneracion_nueva_aumento_gestor || "",
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
            !formData.Remuneracion_Actual &&
            empleadoObj?.salario_base_empleado_gestor
         ) {
            setFormData((prev) => ({
               ...prev,
               Remuneracion_Actual: empleadoObj.salario_base_empleado_gestor.toString(),
            }));
         }
      } else {
         setSelectedEmpleadoData(null);
      }
   }, [formData.empleado, empleadoData, isDataLoaded, formData.Remuneracion_Actual]);

   // Asegurar que el empleado se mantenga seleccionado cuando se cargan los empleados
   useEffect(() => {
      if (isDataLoaded && formData.empleado && empleadoData.length > 0) {
         const empleadoObj = findById(empleadoData, formData.empleado, "id_empleado_gestor");
         if (empleadoObj) {
            setSelectedEmpleadoData(empleadoObj);
         }
      }
   }, [empleadoData, isDataLoaded, formData.empleado]);

   // Calcular Remuneracion nueva cuando cambie el monto de aumento o Remuneracion actual
   useEffect(() => {
      /**
       * Calcula la suma directa: Remuneracion_Actual + monto_aumento
       * Solo muestra el resultado si ambos campos son válidos, si no, muestra ₡0.00
       */
      const actual = parseFloat(formData.Remuneracion_Actual);
      const aumento = parseFloat(formData.monto_aumento);
      if (!isNaN(actual) && !isNaN(aumento) && formData.monto_aumento !== "") {
         const nuevo = actual + aumento;
         const nuevoCalculado = nuevo.toFixed(2);
         setFormData((prev) => ({
            ...prev,
            Remuneracion_Nueva: nuevoCalculado,
         }));
      } else {
         setFormData((prev) => ({
            ...prev,
            Remuneracion_Nueva: "",
         }));
      }
   }, [formData.Remuneracion_Actual, formData.monto_aumento]);

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

      // Validación de monto del aumento
      if (
         !formData.monto_aumento ||
         isNaN(formData.monto_aumento) ||
         Number(formData.monto_aumento) <= 0
      ) {
         setError(true);
         setMessage("El monto del aumento es obligatorio y debe ser mayor a cero.");
         return;
      }

      const aplicaAguinaldo = formData.aplica_aguinaldo;
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
          <span style="font-weight:500; color:${aplicaAguinaldo ? "green" : "red"};">
            ${aplicaAguinaldo ? "Sí" : "No"}
          </span>
        </div>
        ${
           !aplicaAguinaldo
              ? `<div style="color:#d32f2f; font-weight:bold; margin-top:10px;">
                ¿Aplica a la Compensación Anual? está desmarcado.<br/>
                ¿Está seguro que esta acción de personal no aplica a la compensación anual?
              </div>`
              : ""
        }
      </div>
    `;

      const result = await Swal.fire({
         title: "¿Está seguro de actualizar esta acción de personal?",
         html: htmlMsg,
         icon: aplicaAguinaldo ? "question" : "warning",
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
            title: "Actualizando aumento",
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
               title: "Aumento actualizado exitosamente",
               text: "El Aumento ha sido actualizado exitosamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
               navigate("/acciones/aumentos/lista");
            });
         } else {
            const errorMessage = response.message || "Error al actualizar el Aumento";
            setError(true);
            setMessage(errorMessage);
            Swal.fire({
               title: "Error al actualizar el Aumento",
               text: errorMessage,
               icon: "error",
               confirmButtonText: "Aceptar",
            });
         }
      }

      // Si cancela, no hacer nada
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
                  <h5>Editar Aumento de Remuneracion</h5>
                  <p className="text-muted">
                     Modifique el formulario para actualizar el aumento de remuneracion.
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
                                 value={formatCurrency(formData.Remuneracion_Actual || 0)}
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
                                 onChange={handleChange}
                                 placeholder="0.00"
                                 step="0.01"
                                 min="0"
                                 disabled={!canEdit}
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
                                 value={formatCurrency(formData.Remuneracion_Nueva || 0)}
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
                                 disabled={!canEdit}
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
                           disabled={!canEdit}
                        >
                           <i className="fas fa-save me-2"></i>
                           Actualizar Aumento
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
