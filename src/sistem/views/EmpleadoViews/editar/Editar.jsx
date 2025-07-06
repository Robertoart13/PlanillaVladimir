import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useState, useEffect } from "react";
import { Switch } from "@mui/material";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";   
import swal from "sweetalert2";
import {
   validationUtils,
   REQUIRED_FIELDS_CONFIG,
   getInitialFormData,
   isFieldEmpty,
   handleEmailValidation,
   handleCedulaValidation,
   handleNameValidation,
   handlePhoneValidation,
   handleSalaryValidation,
   handleNumberValidation,
   setFieldValidationError,
   validateRequiredFields,
   validateUniqueFields,
   handleInputChange,
   handleSwitchChange,
   improveErrorMessage,
   formOptions,
} from "../shared/employeeFormUtils";

/**
 * Custom hook for managing form validation state
 * @returns {Object} - Object containing all validation error states and setters
 */
const useFormValidation = () => {
   const [emailError, setEmailError] = useState("");
   const [cedulaError, setCedulaError] = useState("");
   const [nombreError, setNombreError] = useState("");
   const [telefonoError, setTelefonoError] = useState("");
   const [salarioError, setSalarioError] = useState("");
   const [tipoContratoError, setTipoContratoError] = useState("");
   const [departamentoError, setDepartamentoError] = useState("");
   const [puestoError, setPuestoError] = useState("");
   const [supervisorError, setSupervisorError] = useState("");
   const [jornadaError, setJornadaError] = useState("");
   const [fechaIngresoError, setFechaIngresoError] = useState("");
   const [numeroAseguradoError, setNumeroAseguradoError] = useState("");
   const [numeroInsError, setNumeroInsError] = useState("");
   const [numeroHaciendaError, setNumeroHaciendaError] = useState("");
   const [monedaPagoError, setMonedaPagoError] = useState("");
   const [tipoPlanillaError, setTipoPlanillaError] = useState("");

   /**
    * Clears all validation errors
    */
   const clearAllErrors = () => {
      setEmailError("");
      setCedulaError("");
      setNombreError("");
      setTelefonoError("");
      setSalarioError("");
      setTipoContratoError("");
      setDepartamentoError("");
      setPuestoError("");
      setSupervisorError("");
      setJornadaError("");
      setFechaIngresoError("");
      setNumeroAseguradoError("");
      setNumeroInsError("");
      setNumeroHaciendaError("");
      setMonedaPagoError("");
      setTipoPlanillaError("");
   };

   /**
    * Checks if any validation errors exist
    * @returns {boolean} - True if any errors exist, false otherwise
    */
   const hasErrors = () => {
      return !!(
         emailError ||
         cedulaError ||
         nombreError ||
         telefonoError ||
         salarioError ||
         tipoContratoError ||
         departamentoError ||
         puestoError ||
         supervisorError ||
         jornadaError ||
         fechaIngresoError ||
         numeroAseguradoError ||
         numeroInsError ||
         numeroHaciendaError ||
         monedaPagoError ||
         tipoPlanillaError
      );
   };

   return {
      // Error states
      emailError,
      cedulaError,
      nombreError,
      telefonoError,
      salarioError,
      tipoContratoError,
      departamentoError,
      puestoError,
      supervisorError,
      jornadaError,
      fechaIngresoError,
      numeroAseguradoError,
      numeroInsError,
      numeroHaciendaError,
      monedaPagoError,
      tipoPlanillaError,
      // Error setters
      setEmailError,
      setCedulaError,
      setNombreError,
      setTelefonoError,
      setSalarioError,
      setTipoContratoError,
      setDepartamentoError,
      setPuestoError,
      setSupervisorError,
      setJornadaError,
      setFechaIngresoError,
      setNumeroAseguradoError,
      setNumeroInsError,
      setNumeroHaciendaError,
      setMonedaPagoError,
      setTipoPlanillaError,
      // Utility functions
      clearAllErrors,
      hasErrors,
   };
};

/**
 * Custom hook for managing form data and validation for editing
 * @returns {Object} - Object containing form data, handlers, and validation functions
 */
const useEmployeeEditForm = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [isLoadingData, setIsLoadingData] = useState(true);
   const validation = useFormValidation();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const [formData, setFormData] = useState(getInitialFormData());

   // Load employee data on component mount
   useEffect(() => {
      loadEmployeeData();
   }, []);

   /**
    * Loads employee data from localStorage and API
    */
   const loadEmployeeData = async () => {
      try {
         setIsLoadingData(true);
         
         // Get employee data from localStorage (set by the list component)
         const selectedEmployeeData = localStorage.getItem("selectedEmpleado");
         
         if (!selectedEmployeeData) {
            setError(true);
            setMessage("No se encontraron datos del Socio para editar");
            return;
         }

         const employeeData = JSON.parse(selectedEmployeeData);
         
         // Debug: Log the employee data to verify it's being loaded correctly
         console.log("Employee data loaded from localStorage:", employeeData);
         
         // Transform the data to match our form structure
         const transformedData = {
            nombre_completo: employeeData.nombre_completo_empleado_gestor || "",
            correo: employeeData.correo_empleado_gestor || "",
            telefono: employeeData.telefono_empleado_gestor || "",
            cedula: employeeData.cedula_empleado_gestor || "",
            salario_base: employeeData.salario_base_empleado_gestor || "",
            tipo_contrato: employeeData.tipo_contrato_empleado_gestor || "",
            departamento: employeeData.departamento_empleado_gestor || "",
            puesto: employeeData.puesto_empleado_gestor || "",
            supervisor: employeeData.supervisor_empleado_gestor || "",
            id_empresa: employeeData.id_empresa || "",
            fecha_ingreso: employeeData.fecha_ingreso_empleado_gestor || "",
            fecha_salida: employeeData.fecha_salida_empleado_gestor || "",
            jornada_laboral: employeeData.jornada_laboral_empleado_gestor || "",
            numero_asegurado: employeeData.numero_asegurado_empleado_gestor || "",
            numero_ins: employeeData.numero_ins_empleado_gestor || "",
            numero_hacienda: employeeData.numero_hacienda_empleado_gestor || "",
            cuenta_bancaria_1: employeeData.cuenta_bancaria_1_empleado_gestor || "",
            cuenta_bancaria_2: employeeData.cuenta_bancaria_2_empleado_gestor || "",
            vacaciones_acumuladas: employeeData.vacaciones_acumuladas_empleado_gestor || "0",
            aguinaldo_acumulado: employeeData.aguinaldo_acumulado_empleado_gestor || "0",
            cesantia_acumulada: employeeData.cesantia_acumulada_empleado_gestor || "0",
            ministerio_hacienda: Boolean(employeeData.ministerio_hacienda_empleado_gestor),
            rt_ins: Boolean(employeeData.rt_ins_empleado_gestor),
            ccss: Boolean(employeeData.ccss_empleado_gestor),
            moneda_pago: employeeData.moneda_pago_empleado_gestor || "",
            tipo_planilla: employeeData.tipo_planilla_empleado_gestor || "",
         };
         
         // Debug: Log the transformed data
         console.log("Transformed form data:", transformedData);

         setFormData(transformedData);
         
         // Clear any existing validation errors
         validation.clearAllErrors();
         setError(false);
         setMessage("");

      } catch (error) {
         console.error("Error loading employee data:", error);
         setError(true);
         setMessage("Error al cargar los datos del Socio");
      } finally {
         setIsLoadingData(false);
      }
   };

   /**
    * Validates all required fields in the form
    * @returns {boolean} - True if all validations pass, false otherwise
    */
   const validateForm = () => {
      // Clear all previous errors
      setError(false);
      setMessage("");
      validation.clearAllErrors();

      // Validate required fields
      const requiredFieldsValid = validateRequiredFields(formData, {
         setNombreError: validation.setNombreError,
         setEmailError: validation.setEmailError,
         setTelefonoError: validation.setTelefonoError,
         setCedulaError: validation.setCedulaError,
         setSalarioError: validation.setSalarioError,
         setTipoContratoError: validation.setTipoContratoError,
         setDepartamentoError: validation.setDepartamentoError,
         setPuestoError: validation.setPuestoError,
         setSupervisorError: validation.setSupervisorError,
         setJornadaError: validation.setJornadaError,
         setFechaIngresoError: validation.setFechaIngresoError,
         setNumeroAseguradoError: validation.setNumeroAseguradoError,
         setNumeroInsError: validation.setNumeroInsError,
         setNumeroHaciendaError: validation.setNumeroHaciendaError,
         setMonedaPagoError: validation.setMonedaPagoError,
         setTipoPlanillaError: validation.setTipoPlanillaError,
      });

      // Check for existing validation errors
      const hasValidationErrors = validation.hasErrors();

      // Validación adicional para campos únicos
      const uniqueFieldsValid = validateUniqueFields(formData, {
         setNumeroAseguradoError: validation.setNumeroAseguradoError,
         setNumeroInsError: validation.setNumeroInsError,
         setNumeroHaciendaError: validation.setNumeroHaciendaError,
         setEmailError: validation.setEmailError,
         setCedulaError: validation.setCedulaError,
      });

      if (!requiredFieldsValid || hasValidationErrors || !uniqueFieldsValid) {
         setError(true);
         setMessage("Por favor corrija todos los errores en el formulario");
         return false;
      }

      return true;
   };

   /**
    * Handles form submission to update employee
    */
   const handleSubmit = async () => {
      try {
         setError(false);
         setMessage("");

         if (!validateForm()) {
            return;
         }

         setIsLoading(true);

         swal.fire({
            title: "Actualizando Socio",
            text: "Espere un momento mientras se actualiza el Socio",
            icon: "info",
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            allowClosePropagation: false,
         });

         // Get employee ID from localStorage
         const selectedEmployeeData = localStorage.getItem("selectedEmpleado");
         const employeeData = JSON.parse(selectedEmployeeData);
         const employeeId = employeeData.id_empleado_gestor;

         // Add employee ID to form data for update
         const updateData = {
            ...formData,
            id_empleado_gestor: employeeId,
         };

         const response = await dispatch(fetchData_api(updateData, "gestor/empleados/editar"));

         if (response.success) {
            setError(false);

            swal.fire({
               title: "Socio actualizado exitosamente",
               text: "El Socio ha sido actualizado exitosamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
               // Clear localStorage and navigate back to list
               localStorage.removeItem("selectedEmpleado");
               navigate("/empleados/lista");
            });
           
         } else {
            const errorMessage = improveErrorMessage(response.message);
            
            swal.fire({
               title: "Error al actualizar el Socio",
               text: errorMessage,
               icon: "error",
               confirmButtonText: "Aceptar",
            });
            setError(true);
            setMessage(errorMessage);
         }
      } catch (error) {
         setError(true);
         setMessage("Error inesperado al actualizar el Socio");
         console.error("Error updating employee:", error);
         
         swal.fire({
            title: "Error inesperado",
            text: "Ha ocurrido un error inesperado al actualizar el Socio. Por favor, intente nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
         });
      } finally {
         setIsLoading(false);
      }
   };

   /**
    * Handles form field changes with validation using shared utilities
    */
   const handleFormInputChange = (e) => {
      handleInputChange(e, formData, setFormData, {
         setEmailError: validation.setEmailError,
         setCedulaError: validation.setCedulaError,
         setNombreError: validation.setNombreError,
         setTelefonoError: validation.setTelefonoError,
         setSalarioError: validation.setSalarioError,
         setNumeroAseguradoError: validation.setNumeroAseguradoError,
         setNumeroInsError: validation.setNumeroInsError,
         setNumeroHaciendaError: validation.setNumeroHaciendaError,
      });
   };

   /**
    * Handles switch changes for institution fields using shared utilities
    */
   const handleFormSwitchChange = (fieldName, checked) => {
      handleSwitchChange(fieldName, checked, formData, setFormData);
   };

   return {
      formData,
      error,
      message,
      isLoading,
      isLoadingData,
      validation,
      handleFormInputChange,
      handleFormSwitchChange,
      handleSubmit,
   };
};

/**
 * Form field component with validation styling
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.id - Field ID
 * @param {string} props.name - Field name
 * @param {string} props.type - Input type
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.error - Error message
 * @param {boolean} props.isUnique - Whether field must be unique
 * @param {React.ReactNode} props.children - Select options
 * @returns {JSX.Element} - Form field component
 */
const FormField = ({
   label,
   id,
   name,
   type = "text",
   value,
   onChange,
   placeholder,
   required = false,
   error,
   isUnique = false,
   children,
}) => (
   <div className="mb-3">
      <label
         className="form-label"
         htmlFor={id}
      >
         {label} {required && "*"} {isUnique && <span className="text-info">(Único)</span>}
      </label>
      {type === "select" ? (
         <select
            className={`form-control ${error ? "is-invalid" : ""}`}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
         >
            {children}
         </select>
      ) : (
         <input
            type={type}
            className={`form-control ${error ? "is-invalid" : ""}`}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
         />
      )}
      {error && <div className="invalid-feedback">{error}</div>}
      {isUnique && !error && (
         <small className="form-text text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Este campo debe ser único en el sistema
         </small>
      )}
   </div>
);

/**
 * Main component for editing an existing employee
 * @returns {JSX.Element} - EditarEmpleado component
 */
export const EditarEmpleado = () => {
   const { 
      formData, 
      error, 
      message, 
      isLoading, 
      isLoadingData,
      validation, 
      handleFormInputChange, 
      handleFormSwitchChange,
      handleSubmit 
   } = useEmployeeEditForm();

   if (isLoadingData) {
      return (
         <TarjetaRow
            texto="Editando Socio"
            subtitulo="Cargando datos del Socio..."
         >
            <div className="text-center p-4">
               <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
               </div>
               <p className="mt-2">Cargando datos del Socio...</p>
            </div>
         </TarjetaRow>
      );
   }

   return (
      <TarjetaRow
         texto="Editar Socio"
         subtitulo="Modifique la información del Socio"
      >
         {error && (
            <ErrorMessage
               error={error}
               message={message}
            />
         )}

         <div className="card-body">
            {/* Información sobre campos únicos */}
            <div className="alert alert-info mb-4">
               <h6 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  Información importante
               </h6>
               <p className="mb-2">
                  Los campos marcados con <span className="text-info">(Único)</span> deben ser diferentes para cada Socio. 
                  Si intenta actualizar un Socio con datos que ya existen, recibirá un mensaje de error específico.
               </p>
               <p className="mb-0">
                  <strong>Campos únicos:</strong> Correo electrónico, Cédula, Número de asegurado, Número de INS, Número de hacienda.
               </p>
            </div>

            {/* Información sobre el socio que se está editando */}
            <div className="alert alert-success mb-4">
               <h6 className="alert-heading">
                  <i className="fas fa-user-edit me-2"></i>
                  Editando Socio
               </h6>
               <p className="mb-0">
                  <strong>Socio:</strong> {formData.nombre_completo} | <strong>Cédula:</strong> {formData.cedula} | <strong>Correo:</strong> {formData.correo}
               </p>
            </div>

            {/* Información Personal */}
            <h5 className="mb-3">Información Personal</h5>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Nombre completo"
                     id="nombre_completo"
                     name="nombre_completo"
                     value={formData.nombre_completo}
                     onChange={handleFormInputChange}
                     placeholder="Ingrese el nombre completo"
                     required
                     error={validation.nombreError}
                  />
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Correo electrónico"
                     id="correo"
                     name="correo"
                     type="email"
                     value={formData.correo}
                     onChange={handleFormInputChange}
                     placeholder="Socio@empresa.com"
                     required
                     isUnique
                     error={validation.emailError}
                  />
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Teléfono"
                     id="telefono"
                     name="telefono"
                     value={formData.telefono}
                     onChange={handleFormInputChange}
                     placeholder="88888888"
                     required
                     error={validation.telefonoError}
                  />
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Cédula"
                     id="cedula"
                     name="cedula"
                     value={formData.cedula}
                     onChange={handleFormInputChange}
                     placeholder="CT57623562"
                     required
                     isUnique
                     error={validation.cedulaError}
                  />
               </div>
            </div>

            {/* Información Laboral */}
            <h5 className="mb-3 mt-4">Información Laboral</h5>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Salario base"
                     id="salario_base"
                     name="salario_base"
                     value={formData.salario_base}
                     onChange={handleFormInputChange}
                     placeholder="500000"
                     required
                     error={validation.salarioError}
                  />
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Tipo de contrato"
                     id="tipo_contrato"
                     name="tipo_contrato"
                     type="select"
                     value={formData.tipo_contrato}
                     onChange={handleFormInputChange}
                     required
                     error={validation.tipoContratoError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.tipoContrato.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Departamento"
                     id="departamento"
                     name="departamento"
                     type="select"
                     value={formData.departamento}
                     onChange={handleFormInputChange}
                     required
                     error={validation.departamentoError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.departamentos.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Puesto"
                     id="puesto"
                     name="puesto"
                     type="select"
                     value={formData.puesto}
                     onChange={handleFormInputChange}
                     required
                     error={validation.puestoError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.puestos.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
            </div>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Supervisor"
                     id="supervisor"
                     name="supervisor"
                     type="select"
                     value={formData.supervisor}
                     onChange={handleFormInputChange}
                     required
                     error={validation.supervisorError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.supervisores.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Jornada laboral"
                     id="jornada_laboral"
                     name="jornada_laboral"
                     type="select"
                     value={formData.jornada_laboral}
                     onChange={handleFormInputChange}
                     required
                     error={validation.jornadaError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.jornadaLaboral.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
            </div>

            {/* Fechas */}
            <h5 className="mb-3 mt-4">Fechas</h5>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Fecha de ingreso"
                     id="fecha_ingreso"
                     name="fecha_ingreso"
                     type="date"
                     value={formData.fecha_ingreso}
                     onChange={handleFormInputChange}
                     required
                     error={validation.fechaIngresoError}
                  />
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Fecha de salida"
                     id="fecha_salida"
                     name="fecha_salida"
                     type="date"
                     value={formData.fecha_salida}
                     onChange={handleFormInputChange}
                  />
               </div>
            </div>

            {/* Números de identificación */}
            <h5 className="mb-3 mt-4">Números de Identificación</h5>
            <div className="row">
               <div className="col-md-4">
                  <FormField
                     label="Número de asegurado"
                     id="numero_asegurado"
                     name="numero_asegurado"
                     value={formData.numero_asegurado}
                     onChange={handleFormInputChange}
                     placeholder="123456789"
                     required
                     isUnique
                     error={validation.numeroAseguradoError}
                  />
               </div>
               <div className="col-md-4">
                  <FormField
                     label="Número de INS"
                     id="numero_ins"
                     name="numero_ins"
                     value={formData.numero_ins}
                     onChange={handleFormInputChange}
                     placeholder="123456789"
                     required
                     isUnique
                     error={validation.numeroInsError}
                  />
               </div>
               <div className="col-md-4">
                  <FormField
                     label="Número de hacienda"
                     id="numero_hacienda"
                     name="numero_hacienda"
                     value={formData.numero_hacienda}
                     onChange={handleFormInputChange}
                     placeholder="123456789"
                     required
                     isUnique
                     error={validation.numeroHaciendaError}
                  />
               </div>
            </div>

            {/* Cuentas bancarias */}
            <h5 className="mb-3 mt-4">Cuentas Bancarias</h5>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Cuenta bancaria 1"
                     id="cuenta_bancaria_1"
                     name="cuenta_bancaria_1"
                     value={formData.cuenta_bancaria_1}
                     onChange={handleFormInputChange}
                     placeholder="CR12345678901234567890"
                  />
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Cuenta bancaria 2"
                     id="cuenta_bancaria_2"
                     name="cuenta_bancaria_2"
                     value={formData.cuenta_bancaria_2}
                     onChange={handleFormInputChange}
                     placeholder="CR12345678901234567890"
                  />
               </div>
            </div>

            {/* Acumulados */}
            <h5 className="mb-3 mt-4">Acumulados a la fecha de ingreso</h5>
            <div className="row">
               <div className="col-md-4">
                  <FormField
                     label="Vacaciones acumuladas"
                     id="vacaciones_acumuladas"
                     name="vacaciones_acumuladas"
                     value={formData.vacaciones_acumuladas}
                     onChange={handleFormInputChange}
                     placeholder="0"
                  />
               </div>
               <div className="col-md-4">
                  <FormField
                     label="Aguinaldo acumulado"
                     id="aguinaldo_acumulado"
                     name="aguinaldo_acumulado"
                     value={formData.aguinaldo_acumulado}
                     onChange={handleFormInputChange}
                     placeholder="0"
                  />
               </div>
               <div className="col-md-4">
                  <FormField
                     label="Cesantía acumulada"
                     id="cesantia_acumulada"
                     name="cesantia_acumulada"
                     value={formData.cesantia_acumulada}
                     onChange={handleFormInputChange}
                     placeholder="0"
                  />
               </div>
            </div>

            {/* Configuración de pago */}
            <h5 className="mb-3 mt-4">Configuración de Pago</h5>
            <div className="row">
               <div className="col-md-6">
                  <FormField
                     label="Moneda de pago"
                     id="moneda_pago"
                     name="moneda_pago"
                     type="select"
                     value={formData.moneda_pago}
                     onChange={handleFormInputChange}
                     required
                     error={validation.monedaPagoError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.monedaPago.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
               <div className="col-md-6">
                  <FormField
                     label="Tipo de planilla"
                     id="tipo_planilla"
                     name="tipo_planilla"
                     type="select"
                     value={formData.tipo_planilla}
                     onChange={handleFormInputChange}
                     required
                     error={validation.tipoPlanillaError}
                  >
                     <option value="">Seleccione una opción</option>
                     {formOptions.tipoPlanilla.map(option => (
                        <option key={option.value} value={option.value}>
                           {option.label}
                        </option>
                     ))}
                  </FormField>
               </div>
            </div>

            {/* Checks de instituciones */}
            <h5 className="mb-3 mt-4">Instituciones</h5>
            <div className="row">
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.ministerio_hacienda}
                        onChange={(e) => handleFormSwitchChange("ministerio_hacienda", e.target.checked)}
                     />
                     <label className="ms-2">Ministerio de Hacienda</label>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.rt_ins}
                        onChange={(e) => handleFormSwitchChange("rt_ins", e.target.checked)}
                     />
                     <label className="ms-2">RT INS</label>
                  </div>
               </div>
               <div className="col-md-4">
                  <div className="mb-3">
                     <Switch
                        checked={formData.ccss}
                        onChange={(e) => handleFormSwitchChange("ccss", e.target.checked)}
                     />
                     <label className="ms-2">CCSS</label>
                  </div>
               </div>
            </div>

            <button
               onClick={handleSubmit}
               className="btn btn-dark mb-4"
               disabled={isLoading || validation.hasErrors()}
            >
               {isLoading ? "Actualizando..." : "Actualizar Socio"}
            </button>
         </div>
      </TarjetaRow>
   );
}; 