import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useState } from "react";
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
 * Normaliza un valor para que coincida con el value de las opciones de un select.
 * @param {string} valor - El valor a normalizar (puede ser label o value).
 * @param {Array} opciones - El array de opciones del select.
 * @returns {string} - El value normalizado o "" si no encuentra coincidencia.
 */
export const normalizarValor = (valor, opciones) => {
   if (!valor) return "";
   const found = opciones.find(
      opt =>
         (opt.value && opt.value.toLowerCase() === valor.toLowerCase()) ||
         (opt.label && opt.label.toLowerCase() === valor.toLowerCase())
   );
   return found ? found.value : "";
};

/**
 * Custom hook for managing form validation state
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
   const [jornadaError, setJornadaError] = useState("");
   const [fechaIngresoError, setFechaIngresoError] = useState("");
   const [numeroAseguradoError, setNumeroAseguradoError] = useState("");
   const [numeroInsError, setNumeroInsError] = useState("");
   const [numeroHaciendaError, setNumeroHaciendaError] = useState("");
   const [monedaPagoError, setMonedaPagoError] = useState("");
   const [tipoPlanillaError, setTipoPlanillaError] = useState("");

   const clearAllErrors = () => {
      setEmailError("");
      setCedulaError("");
      setNombreError("");
      setTelefonoError("");
      setSalarioError("");
      setTipoContratoError("");
      setDepartamentoError("");
      setPuestoError("");
      setJornadaError("");
      setFechaIngresoError("");
      setNumeroAseguradoError("");
      setNumeroInsError("");
      setNumeroHaciendaError("");
      setMonedaPagoError("");
      setTipoPlanillaError("");
   };

   const hasErrors = () => {
      return !!(
         emailError || cedulaError || nombreError || telefonoError ||
         salarioError || tipoContratoError || departamentoError || puestoError ||
         jornadaError || fechaIngresoError || numeroAseguradoError ||
         numeroInsError || numeroHaciendaError || monedaPagoError || tipoPlanillaError
      );
   };

   return {
      // Error states
      emailError, cedulaError, nombreError, telefonoError, salarioError,
      tipoContratoError, departamentoError, puestoError,
      jornadaError, fechaIngresoError, numeroAseguradoError, numeroInsError,
      numeroHaciendaError, monedaPagoError, tipoPlanillaError,
      // Error setters
      setEmailError, setCedulaError, setNombreError, setTelefonoError, setSalarioError,
      setTipoContratoError, setDepartamentoError, setPuestoError,
      setJornadaError, setFechaIngresoError, setNumeroAseguradoError, setNumeroInsError,
      setNumeroHaciendaError, setMonedaPagoError, setTipoPlanillaError,
      // Utility functions
      clearAllErrors, hasErrors,
   };
};

/**
 * Custom hook for managing employee form data and operations
 */
const useEmployeeForm = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const validation = useFormValidation();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const [formData, setFormData] = useState(getInitialFormData());

   /**
    * Handles form field changes with validation
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
         setTipoContratoError: validation.setTipoContratoError,
         setDepartamentoError: validation.setDepartamentoError,
         setPuestoError: validation.setPuestoError,
         setJornadaError: validation.setJornadaError,
         setFechaIngresoError: validation.setFechaIngresoError,
         setMonedaPagoError: validation.setMonedaPagoError,
         setTipoPlanillaError: validation.setTipoPlanillaError,
      });
   };

   /**
    * Handles switch changes for institution fields
    */
   const handleFormSwitchChange = (fieldName, checked) => {
      handleSwitchChange(fieldName, checked, formData, setFormData);
   };

   /**
    * Validates the complete form
    */
   const validateForm = () => {
      setError(false);
      setMessage("");
      validation.clearAllErrors();

      const requiredFieldsValid = validateRequiredFields(formData, {
         setNombreError: validation.setNombreError,
         setEmailError: validation.setEmailError,
         setTelefonoError: validation.setTelefonoError,
         setCedulaError: validation.setCedulaError,
         setSalarioError: validation.setSalarioError,
         setTipoContratoError: validation.setTipoContratoError,
         setDepartamentoError: validation.setDepartamentoError,
         setPuestoError: validation.setPuestoError,
         setJornadaError: validation.setJornadaError,
         setFechaIngresoError: validation.setFechaIngresoError,
         setNumeroAseguradoError: validation.setNumeroAseguradoError,
         setNumeroInsError: validation.setNumeroInsError,
         setNumeroHaciendaError: validation.setNumeroHaciendaError,
         setMonedaPagoError: validation.setMonedaPagoError,
         setTipoPlanillaError: validation.setTipoPlanillaError,
      });

      const hasValidationErrors = validation.hasErrors();
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
    * Handles form submission to create employee
    */
   const handleSubmit = async () => {
      try {
         setError(false);
         setMessage("");

         if (!validateForm()) {
            return;
         }

         setIsLoading(true);

         const result = await swal.fire({
            title: "Creando Socio",
            text: "Espere un momento mientras se crea el Socio",
            icon: "info",
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            allowClosePropagation: false,
         })
         if (result.isConfirmed) {

            const response = await dispatch(fetchData_api(formData, "gestor/empleados/crear"));

            if (response.success) {
               setError(false);

               swal.fire({
                  title: "Socio creado exitosamente",
                  text: "El Socio ha sido creado exitosamente",
                  icon: "success",
                  confirmButtonText: "Aceptar",
               }).then(() => {
                  setFormData(getInitialFormData());
                  validation.clearAllErrors();
                  navigate("/empleados/lista");
               });
            
            } else {
               const errorMessage = improveErrorMessage(response.message || "Error al crear el Socio");

               swal.fire({
                  title: "Error al crear el Socio",
                  text: errorMessage,
                  icon: "error",
                  confirmButtonText: "Aceptar",
               });
               setError(true);
               setMessage(errorMessage);
            }
         }
      } catch (error) {
         setError(true);
         setMessage("Error inesperado al crear el Socio");
         console.error("Error creating employee:", error);
         
         swal.fire({
            title: "Error inesperado",
            text: "Ha ocurrido un error inesperado al crear el Socio. Por favor, intente nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
         });
      } finally {
         setIsLoading(false);
      }
   };

   return {
      formData,
      error,
      message,
      isLoading,
      validation,
      handleInputChange: handleFormInputChange,
      handleSwitchChange: handleFormSwitchChange,
      handleSubmit,
   };
};

/**
 * Form field component with validation styling
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
      <label className="form-label" htmlFor={id}>
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
 * Form section component for better organization
 */
const FormSection = ({ title, children }) => (
   <>
      <h5 className="mb-3 mt-4">{title}</h5>
      {children}
   </>
);

/**
 * Main component for creating a new employee
 */
export const CrearEmpleado = () => {
   const { 
      formData, 
      error, 
      message, 
      isLoading, 
      validation, 
      handleInputChange, 
      handleSwitchChange,
      handleSubmit 
   } = useEmployeeForm();

   return (
      <TarjetaRow
         texto="Crear un nuevo Socio"
         subtitulo="Complete la información del Socio"
      >
         {error && <ErrorMessage error={error} message={message} />}

         <div className="card-body">
            {/* Information about unique fields */}
            <div className="alert alert-info mb-4">
               <h6 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  Información importante
               </h6>
               <p className="mb-2">
                  Los campos marcados con <span className="text-info">(Único)</span> deben ser diferentes para cada Socio. 
                  Si intenta crear un Socio con datos que ya existen, recibirá un mensaje de error específico.
               </p>
               <p className="mb-0">
                  <strong>Campos únicos:</strong> Correo electrónico, Cédula, Número de asegurado, Número de INS, Número de hacienda.
               </p>
            </div>

            {/* Personal Information */}
            <FormSection title="Información Personal">
               <div className="row">
                  <div className="col-md-6">
                     <FormField
                        label="Nombre completo"
                        id="nombre_completo"
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        placeholder="CT57623562"
                        required
                        isUnique
                        error={validation.cedulaError}
                     />
                  </div>
               </div>
            </FormSection>

            {/* Work Information */}
            <FormSection title="Información Laboral">
               <div className="row">
                  <div className="col-md-6">
                     <FormField
                        label="Salario base"
                        id="salario_base"
                        name="salario_base"
                        value={formData.salario_base}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        label="Jornada laboral"
                        id="jornada_laboral"
                        name="jornada_laboral"
                        type="select"
                        value={formData.jornada_laboral}
                        onChange={handleInputChange}
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
            </FormSection>

            {/* Dates */}
            <FormSection title="Fechas">
               <div className="row">
                  <div className="col-md-6">
                     <FormField
                        label="Fecha de ingreso"
                        id="fecha_ingreso"
                        name="fecha_ingreso"
                        type="date"
                        value={formData.fecha_ingreso}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                     />
                  </div>
               </div>
            </FormSection>

            {/* Identification Numbers */}
            <FormSection title="Números de Identificación">
               <div className="row">
                  <div className="col-md-4">
                     <FormField
                        label="Número de asegurado"
                        id="numero_asegurado"
                        name="numero_asegurado"
                        value={formData.numero_asegurado}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        placeholder="123456789"
                        required
                        isUnique
                        error={validation.numeroHaciendaError}
                     />
                  </div>
               </div>
            </FormSection>

            {/* Bank Accounts */}
            <FormSection title="Cuentas Bancarias">
               <div className="row">
                  <div className="col-md-6">
                     <FormField
                        label="Cuenta bancaria 1"
                        id="cuenta_bancaria_1"
                        name="cuenta_bancaria_1"
                        value={formData.cuenta_bancaria_1}
                        onChange={handleInputChange}
                        placeholder="CR12345678901234567890"
                     />
                  </div>
                  <div className="col-md-6">
                     <FormField
                        label="Cuenta bancaria 2"
                        id="cuenta_bancaria_2"
                        name="cuenta_bancaria_2"
                        value={formData.cuenta_bancaria_2}
                        onChange={handleInputChange}
                        placeholder="CR12345678901234567890"
                     />
                  </div>
               </div>
            </FormSection>

            {/* Accumulated Benefits */}
            <FormSection title="Acumulados a la fecha de ingreso">
               <div className="row">
                  <div className="col-md-4">
                     <FormField
                        label="Vacaciones acumuladas"
                        id="vacaciones_acumuladas"
                        name="vacaciones_acumuladas"
                        value={formData.vacaciones_acumuladas}
                        onChange={handleInputChange}
                        placeholder="0"
                     />
                  </div>
                  <div className="col-md-4">
                     <FormField
                        label="Aguinaldo acumulado"
                        id="aguinaldo_acumulado"
                        name="aguinaldo_acumulado"
                        value={formData.aguinaldo_acumulado}
                        onChange={handleInputChange}
                        placeholder="0"
                     />
                  </div>
                  <div className="col-md-4">
                     <FormField
                        label="Cesantía acumulada"
                        id="cesantia_acumulada"
                        name="cesantia_acumulada"
                        value={formData.cesantia_acumulada}
                        onChange={handleInputChange}
                        placeholder="0"
                     />
                  </div>
               </div>
            </FormSection>

            {/* Payment Configuration */}
            <FormSection title="Configuración de Pago">
               <div className="row">
                  <div className="col-md-6">
                     <FormField
                        label="Moneda de pago"
                        id="moneda_pago"
                        name="moneda_pago"
                        type="select"
                        value={formData.moneda_pago}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
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
            </FormSection>

            {/* Institution Switches */}
            <FormSection title="Instituciones">
               <div className="row">
                  <div className="col-md-4">
                     <div className="mb-3">
                        <Switch
                           checked={formData.ministerio_hacienda}
                           onChange={(e) => handleSwitchChange("ministerio_hacienda", e.target.checked)}
                        />
                        <label className="ms-2">Ministerio de Hacienda</label>
                     </div>
                  </div>
                  <div className="col-md-4">
                     <div className="mb-3">
                        <Switch
                           checked={formData.rt_ins}
                           onChange={(e) => handleSwitchChange("rt_ins", e.target.checked)}
                        />
                        <label className="ms-2">RT INS</label>
                     </div>
                  </div>
                  <div className="col-md-4">
                     <div className="mb-3">
                        <Switch
                           checked={formData.ccss}
                           onChange={(e) => handleSwitchChange("ccss", e.target.checked)}
                        />
                        <label className="ms-2">CCSS</label>
                     </div>
                  </div>
               </div>
            </FormSection>

            {/* Submit Button */}
            <button
               onClick={handleSubmit}
               className="btn btn-dark mb-4"
               disabled={isLoading || validation.hasErrors()}
            >
               {isLoading ? "Creando..." : "Crear Socio"}
            </button>
         </div>
      </TarjetaRow>
   );
};
