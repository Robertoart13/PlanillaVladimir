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

export const EditarVacaciones = () => {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Estados de empleado
   const {
      empleadoOptions,
      empleadoData,
      isLoading: isLoadingEmpleados,
      fetchEmpleados,
   } = useEmpleados(dispatch);

   // Estados de selección y formulario
   const [formData, setFormData] = useState({
      id_vacacion_vacaciones_gestor: "",
      empleado_id_vacaciones_gestor: "",
      fecha_inicio_vacaciones_gestor: "",
      dias_vacaciones_vacaciones_gestor: "",
      motivo_vacaciones_gestor: "",
      estado_vacaciones_gestor: "Pendiente",
      activo_vacaciones_gestor: 1,
   });
   const [selectedEmpleadoData, setSelectedEmpleadoData] = useState(null);

   // Estado de error y mensaje
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");

   // Limpia el mensaje de error al montar el componente
   useEffect(() => {
      setMessage("");
      setError(false);
   }, []);

   // Cargar datos desde localStorage al montar
   useEffect(() => {
      const vacacionData = localStorage.getItem('vacacionParaEditar');
      if (vacacionData) {
         try {
            const parsedData = JSON.parse(vacacionData);
            // Formatear la fecha para el input date
            const fechaInicio = parsedData.fecha_inicio_vacaciones_gestor 
               ? new Date(parsedData.fecha_inicio_vacaciones_gestor).toISOString().split('T')[0]
               : "";
               
            setFormData({
               id_vacacion_vacaciones_gestor: parsedData.id_vacacion_vacaciones_gestor || "",
               empleado_id_vacaciones_gestor: parsedData.empleado_id_vacaciones_gestor || "",
               fecha_inicio_vacaciones_gestor: fechaInicio,
               dias_vacaciones_vacaciones_gestor: parsedData.dias_vacaciones_vacaciones_gestor || "",
               motivo_vacaciones_gestor: parsedData.motivo_vacaciones_gestor || "",
               estado_vacaciones_gestor: "Aprobado", // Siempre Aprobado
               activo_vacaciones_gestor: parsedData.activo_vacaciones_gestor || 1,
            });
         } catch (error) {
            console.error("Error al parsear datos de localStorage:", error);
            setError(true);
            setMessage("Error al cargar los datos de la vacación");
         }
      } else {
         setError(true);
         setMessage("No se encontraron datos para editar");
      }
   }, []);

   // Cargar empleados al montar
   useEffect(() => {
      fetchEmpleados();
   }, [fetchEmpleados]);

   // Cuando cambia el empleado, buscar datos
   useEffect(() => {
      if (formData.empleado_id_vacaciones_gestor) {
         const empleadoObj = findById(empleadoData, formData.empleado_id_vacaciones_gestor, "id_empleado_gestor");
         setSelectedEmpleadoData(empleadoObj);
      } else {
         setSelectedEmpleadoData(null);
      }
   }, [formData.empleado_id_vacaciones_gestor, empleadoData]);

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

      // Validaciones
      if (!formData.empleado_id_vacaciones_gestor) {
         setError(true);
         setMessage("Debe seleccionar un socio.");
         return;
      }

      if (!formData.fecha_inicio_vacaciones_gestor) {
         setError(true);
         setMessage("La fecha de inicio es obligatoria.");
         return;
      }

      if (!formData.dias_vacaciones_vacaciones_gestor || isNaN(formData.dias_vacaciones_vacaciones_gestor) || Number(formData.dias_vacaciones_vacaciones_gestor) <= 0) {
         setError(true);
         setMessage("La cantidad de días es obligatoria y debe ser mayor a cero.");
         return;
      }

      const nombre = selectedEmpleadoData.nombre_completo_empleado_gestor;
      const socio = selectedEmpleadoData.numero_socio_empleado_gestor;
      const fechaInicio = formData.fecha_inicio_vacaciones_gestor;
      const diasVacaciones = formData.dias_vacaciones_vacaciones_gestor;
      const estado = formData.estado_vacaciones_gestor;

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
        <div style="font-size:1.1em; margin-bottom:6px;">
          <b>Estado:</b> <span style="font-weight:500; color:green;">${estado}</span>
        </div>
      </div>
    `;

      const result = await Swal.fire({
         title: "¿Está seguro de actualizar este registro de vacaciones?",
         html: htmlMsg,
         icon: "question",
         showCancelButton: true,
         confirmButtonText: "Sí, actualizar vacaciones",
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
            title: "Actualizando registro de vacaciones",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
               Swal.showLoading();
            },
         });
         
         // Siempre establecer el estado como "Aprobado"
      const datosEnviar = {
         ...formData,
         estado_vacaciones_gestor: "Aprobado"
      };
      
      const response = await dispatch(fetchData_api(datosEnviar, "gestor/vacaciones/editar"));

         if (response.success) {
            setError(false);

            Swal.fire({
               title: "Vacaciones actualizadas exitosamente",
               text: "El registro de vacaciones ha sido actualizado correctamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
               localStorage.removeItem('vacacionParaEditar');
               navigate("/acciones/vacaciones/lista");
            });
         } else {
            const errorMessage = response.message || "Error al actualizar el registro de vacaciones";
            setError(true);
            setMessage(errorMessage);
            Swal.fire({
               title: "Error al actualizar las vacaciones",
               text: errorMessage,
               icon: "error",
               confirmButtonText: "Aceptar",
            });
         }
      }
   };

   return (
      <div className="card">
         <div className="card-header">
            <h5>Editar Registro de Vacaciones</h5>
            <p className="text-muted">
               Modifique los datos del registro de vacaciones seleccionado.
            </p>
         </div>
         <div className="card-body">
            <form onSubmit={handleSubmit}>

               
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
                        id="activo_vacaciones_gestor"
                        name="activo_vacaciones_gestor"
                        checked={formData.activo_vacaciones_gestor === 1}
                        onChange={(e) =>
                           setFormData((prev) => ({
                              ...prev,
                              activo_vacaciones_gestor: e.target.checked ? 1 : 0,
                           }))
                        }
                     />
                     <label
                        className="form-check-label"
                        htmlFor="activo_vacaciones_gestor"
                     >
                        {formData.activo_vacaciones_gestor === 1 ? "Activo" : "Inactivo"}
                     </label>
                  </div>
               </div>
               
               <div className="row">
                  {/* Empleado */}
                  <div className="col-md-6 mb-3">
                     <label
                        className="form-label"
                        htmlFor="empleado_id_vacaciones_gestor"
                     >
                        Socio <span className="text-danger">*</span>
                     </label>
                     <select
                        className="form-select"
                        id="empleado_id_vacaciones_gestor"
                        name="empleado_id_vacaciones_gestor"
                        value={formData.empleado_id_vacaciones_gestor}
                        onChange={handleChange}
                        required
                        disabled={isLoadingEmpleados}
                     >
                        <option value="">
                           {isLoadingEmpleados
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
                        htmlFor="fecha_inicio_vacaciones_gestor"
                     >
                        Fecha de Inicio <span className="text-danger">*</span>
                     </label>
                     <input
                        type="date"
                        className="form-control"
                        id="fecha_inicio_vacaciones_gestor"
                        name="fecha_inicio_vacaciones_gestor"
                        value={formData.fecha_inicio_vacaciones_gestor || ""}
                        onChange={handleChange}
                        required
                     />
                  </div>
                  
                  {/* Días de Vacaciones */}
                  <div className="col-md-6 mb-3">
                     <label
                        className="form-label"
                        htmlFor="dias_vacaciones_vacaciones_gestor"
                     >
                        Días de Vacaciones <span className="text-danger">*</span>
                     </label>
                     <input
                        type="number"
                        className="form-control"
                        id="dias_vacaciones_vacaciones_gestor"
                        name="dias_vacaciones_vacaciones_gestor"
                        value={formData.dias_vacaciones_vacaciones_gestor}
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
                        htmlFor="motivo_vacaciones_gestor"
                     >
                        Motivo u Observaciones
                     </label>
                     <textarea
                        className="form-control"
                        id="motivo_vacaciones_gestor"
                        name="motivo_vacaciones_gestor"
                        value={formData.motivo_vacaciones_gestor}
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
                     Actualizar Vacaciones
                  </button>
                  <button
                     type="button"
                     className="btn btn-secondary"
                     onClick={() => {
                        localStorage.removeItem('vacacionParaEditar');
                        navigate("/acciones/vacaciones/lista");
                     }}
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