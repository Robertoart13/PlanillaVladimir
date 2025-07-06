/**
 * Shared utilities for employee form validation and common functions
 * Used by both create and edit employee components
 */

/**
 * Validation utility functions for form fields
 */
export const validationUtils = {
   /**
    * Validates email format using a comprehensive regex pattern
    * @param {string} email - The email address to validate
    * @returns {boolean} - True if email format is valid, false otherwise
    */
   validateEmailFormat: (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
   },

   /**
    * Validates if email follows employee email format (accepts any valid email)
    * @param {string} email - The email address to validate
    * @returns {boolean} - True if email appears to be employee-related, false otherwise
    */
   validateEmployeeEmail: (email) => {
      // Remove the employee keyword validation - accept any valid email format
      return true;
   },

   /**
    * Validates cédula format (letters and numbers only, no spaces or special characters)
    * @param {string} cedula - The cédula value to validate
    * @returns {boolean} - True if cédula format is valid, false otherwise
    */
   validateCedulaFormat: (cedula) => {
      const cedulaRegex = /^[A-Za-z0-9]+$/;
      return cedulaRegex.test(cedula);
   },

   /**
    * Validates name format (only letters, spaces, and accents, no special characters)
    * @param {string} name - The name value to validate
    * @returns {boolean} - True if name format is valid, false otherwise
    */
   validateNameFormat: (name) => {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      return nameRegex.test(name);
   },

   /**
    * Validates phone number format (only numbers)
    * @param {string} phone - The phone value to validate
    * @returns {boolean} - True if phone format is valid, false otherwise
    */
   validatePhoneFormat: (phone) => {
      const phoneRegex = /^[0-9]+$/;
      return phoneRegex.test(phone);
   },

   /**
    * Validates salary format (positive number)
    * @param {string} salary - The salary value to validate
    * @returns {boolean} - True if salary format is valid, false otherwise
    */
   validateSalaryFormat: (salary) => {
      const salaryRegex = /^[0-9]+(\.[0-9]+)?$/;
      return salaryRegex.test(salary) && parseFloat(salary) > 0;
   },

   /**
    * Validates number format (only numbers)
    * @param {string} number - The number value to validate
    * @returns {boolean} - True if number format is valid, false otherwise
    */
   validateNumberFormat: (number) => {
      const numberRegex = /^[0-9]+$/;
      return numberRegex.test(number);
   },
};

/**
 * Configuration object for required fields with their validation messages
 */
export const REQUIRED_FIELDS_CONFIG = {
   nombre_completo: "El nombre completo es obligatorio",
   correo: "El correo electrónico es obligatorio",
   telefono: "El teléfono es obligatorio",
   cedula: "La cédula es obligatoria",
   salario_base: "El salario base es obligatorio",
   tipo_contrato: "El tipo de contrato es obligatorio",
   departamento: "El departamento es obligatorio",
   puesto: "El puesto es obligatorio",
   supervisor: "El supervisor es obligatorio",
   jornada_laboral: "La jornada laboral es obligatoria",
   fecha_ingreso: "La fecha de ingreso es obligatoria",
   numero_asegurado: "El número de asegurado es obligatorio",
   numero_ins: "El número de INS es obligatorio",
   numero_hacienda: "El número de hacienda es obligatorio",
   moneda_pago: "La moneda de pago es obligatoria",
   tipo_planilla: "El tipo de planilla es obligatorio",
};

/**
 * Initial form data structure
 */
export const getInitialFormData = () => ({
   nombre_completo: "",
   correo: "",
   telefono: "",
   cedula: "",
   salario_base: "",
   tipo_contrato: "",
   departamento: "",
   puesto: "",
   supervisor: "",
   id_empresa: "",
   fecha_ingreso: "",
   fecha_salida: "",
   jornada_laboral: "",
   numero_asegurado: "",
   numero_ins: "",
   numero_hacienda: "",
   cuenta_bancaria_1: "",
   cuenta_bancaria_2: "",
   vacaciones_acumuladas: "0",
   aguinaldo_acumulado: "0",
   cesantia_acumulada: "0",
   ministerio_hacienda: false,
   rt_ins: false,
   ccss: false,
   moneda_pago: "",
   tipo_planilla: "",
});

/**
 * Validates if a field value is empty or contains only whitespace
 * @param {string} value - The field value to validate
 * @returns {boolean} - True if field is empty, false otherwise
 */
export const isFieldEmpty = (value) => {
   return !value || value.toString().trim() === "";
};

/**
 * Handles email validation on change
 * @param {string} email - The email value to validate
 * @param {Function} setEmailError - Function to set email error
 */
export const handleEmailValidation = (email, setEmailError) => {
   if (!email) {
      setEmailError("");
      return;
   }

   if (!validationUtils.validateEmailFormat(email)) {
      setEmailError("El formato del correo electrónico no es válido");
      return;
   }

   if (!validationUtils.validateEmployeeEmail(email)) {
      setEmailError("El correo debe ser un correo de Socio válido");
      return;
   }

   setEmailError("");
};

/**
 * Handles cédula validation on change
 * @param {string} cedula - The cédula value to validate
 * @param {Function} setCedulaError - Function to set cédula error
 */
export const handleCedulaValidation = (cedula, setCedulaError) => {
   if (!cedula) {
      setCedulaError("");
      return;
   }

   if (!validationUtils.validateCedulaFormat(cedula)) {
      setCedulaError(
         "La cédula solo puede contener letras y números, sin espacios ni caracteres especiales",
      );
      return;
   }

   setCedulaError("");
};

/**
 * Handles name validation on change
 * @param {string} name - The name value to validate
 * @param {Function} setNombreError - Function to set name error
 */
export const handleNameValidation = (name, setNombreError) => {
   if (!name) {
      setNombreError("");
      return;
   }

   if (!validationUtils.validateNameFormat(name)) {
      setNombreError("El nombre solo puede contener letras, espacios y tildes");
      return;
   }

   setNombreError("");
};

/**
 * Handles phone validation on change
 * @param {string} phone - The phone value to validate
 * @param {Function} setTelefonoError - Function to set phone error
 */
export const handlePhoneValidation = (phone, setTelefonoError) => {
   if (!phone) {
      setTelefonoError("");
      return;
   }

   if (!validationUtils.validatePhoneFormat(phone)) {
      setTelefonoError("El teléfono solo puede contener números");
      return;
   }

   setTelefonoError("");
};

/**
 * Handles salary validation on change
 * @param {string} salary - The salary value to validate
 * @param {Function} setSalarioError - Function to set salary error
 */
export const handleSalaryValidation = (salary, setSalarioError) => {
   if (!salary) {
      setSalarioError("");
      return;
   }

   if (!validationUtils.validateSalaryFormat(salary)) {
      setSalarioError("El salario debe ser un número positivo");
      return;
   }

   setSalarioError("");
};

/**
 * Handles number validation on change
 * @param {string} number - The number value to validate
 * @param {string} fieldName - The field name for error state
 * @param {Object} errorSetters - Object containing error setter functions
 */
export const handleNumberValidation = (number, fieldName, errorSetters) => {
   const { setNumeroAseguradoError, setNumeroInsError, setNumeroHaciendaError } = errorSetters;

   if (!number) {
      switch (fieldName) {
         case "numero_asegurado":
            setNumeroAseguradoError("");
            break;
         case "numero_ins":
            setNumeroInsError("");
            break;
         case "numero_hacienda":
            setNumeroHaciendaError("");
            break;
         default:
            break;
      }
      return;
   }

   if (!validationUtils.validateNumberFormat(number)) {
      const errorMessage = "Este campo solo puede contener números";
      switch (fieldName) {
         case "numero_asegurado":
            setNumeroAseguradoError(errorMessage);
            break;
         case "numero_ins":
            setNumeroInsError(errorMessage);
            break;
         case "numero_hacienda":
            setNumeroHaciendaError(errorMessage);
            break;
         default:
            break;
      }
      return;
   }

   switch (fieldName) {
      case "numero_asegurado":
         setNumeroAseguradoError("");
         break;
      case "numero_ins":
         setNumeroInsError("");
         break;
      case "numero_hacienda":
         setNumeroHaciendaError("");
         break;
      default:
         break;
   }
};

/**
 * Sets validation error for a specific field
 * @param {string} fieldName - The name of the field
 * @param {string} errorMessage - The error message to set
 * @param {Object} errorSetters - Object containing all error setter functions
 */
export const setFieldValidationError = (fieldName, errorMessage, errorSetters) => {
   const {
      setNombreError,
      setEmailError,
      setTelefonoError,
      setCedulaError,
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
   } = errorSetters;

   const errorSettersMap = {
      nombre_completo: setNombreError,
      correo: setEmailError,
      telefono: setTelefonoError,
      cedula: setCedulaError,
      salario_base: setSalarioError,
      tipo_contrato: setTipoContratoError,
      departamento: setDepartamentoError,
      puesto: setPuestoError,
      supervisor: setSupervisorError,
      jornada_laboral: setJornadaError,
      fecha_ingreso: setFechaIngresoError,
      numero_asegurado: setNumeroAseguradoError,
      numero_ins: setNumeroInsError,
      numero_hacienda: setNumeroHaciendaError,
      moneda_pago: setMonedaPagoError,
      tipo_planilla: setTipoPlanillaError,
   };

   const setter = errorSettersMap[fieldName];
   if (setter) {
      setter(errorMessage);
   }
};

/**
 * Validates all required fields and sets appropriate error messages
 * @param {Object} formData - Current form data
 * @param {Object} errorSetters - Object containing all error setter functions
 * @returns {boolean} - True if all required fields are valid, false otherwise
 */
export const validateRequiredFields = (formData, errorSetters) => {
   let hasErrors = false;

   Object.entries(REQUIRED_FIELDS_CONFIG).forEach(([fieldName, errorMessage]) => {
      if (isFieldEmpty(formData[fieldName])) {
         hasErrors = true;
         setFieldValidationError(fieldName, errorMessage, errorSetters);
      }
   });

   return !hasErrors;
};

/**
 * Validates unique fields to ensure they are properly filled
 * @param {Object} formData - Current form data
 * @param {Object} errorSetters - Object containing all error setter functions
 * @returns {boolean} - True if all unique fields are valid, false otherwise
 */
export const validateUniqueFields = (formData, errorSetters) => {
   const {
      setNumeroAseguradoError,
      setNumeroInsError,
      setNumeroHaciendaError,
      setEmailError,
      setCedulaError,
   } = errorSetters;

   let isValid = true;

   // Validar que los números de identificación no estén vacíos
   if (!formData.numero_asegurado || formData.numero_asegurado.trim() === "") {
      setNumeroAseguradoError("El número de asegurado es obligatorio y debe ser único");
      isValid = false;
   }

   if (!formData.numero_ins || formData.numero_ins.trim() === "") {
      setNumeroInsError("El número de INS es obligatorio y debe ser único");
      isValid = false;
   }

   if (!formData.numero_hacienda || formData.numero_hacienda.trim() === "") {
      setNumeroHaciendaError("El número de hacienda es obligatorio y debe ser único");
      isValid = false;
   }

   if (!formData.correo || formData.correo.trim() === "") {
      setEmailError("El correo electrónico es obligatorio y debe ser único");
      isValid = false;
   }

   if (!formData.cedula || formData.cedula.trim() === "") {
      setCedulaError("La cédula es obligatoria y debe ser única");
      isValid = false;
   }

   return isValid;
};

/**
 * Handles form field changes with validation
 * @param {Event} e - The change event
 * @param {Object} formData - Current form data
 * @param {Function} setFormData - Function to update form data
 * @param {Object} errorSetters - Object containing all error setter functions
 */
export const handleInputChange = (e, formData, setFormData, errorSetters) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });

   // Validate fields specifically
   switch (name) {
      case "correo":
         handleEmailValidation(value, errorSetters.setEmailError);
         break;
      case "cedula":
         handleCedulaValidation(value, errorSetters.setCedulaError);
         break;
      case "nombre_completo":
         handleNameValidation(value, errorSetters.setNombreError);
         break;
      case "telefono":
         handlePhoneValidation(value, errorSetters.setTelefonoError);
         break;
      case "salario_base":
         handleSalaryValidation(value, errorSetters.setSalarioError);
         break;
      case "numero_asegurado":
      case "numero_ins":
      case "numero_hacienda":
         handleNumberValidation(value, name, errorSetters);
         break;
      default:
         break;
   }
};

/**
 * Handles switch changes for institution fields
 * @param {string} fieldName - The name of the institution field
 * @param {boolean} checked - The checked state of the switch
 * @param {Object} formData - Current form data
 * @param {Function} setFormData - Function to update form data
 */
export const handleSwitchChange = (fieldName, checked, formData, setFormData) => {
   setFormData({ ...formData, [fieldName]: checked });
};

/**
 * Improves error message handling for API responses
 * @param {string} errorMessage - Original error message from API
 * @returns {string} - Improved error message
 */
export const improveErrorMessage = (errorMessage) => {
   if (errorMessage.includes("número de asegurado")) {
      return "El número de asegurado ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
   } else if (errorMessage.includes("número de INS")) {
      return "El número de INS ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
   } else if (errorMessage.includes("número de hacienda")) {
      return "El número de hacienda ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
   } else if (errorMessage.includes("correo electrónico")) {
      return "El correo electrónico ya está registrado en el sistema. Por favor, use un correo diferente.";
   } else if (errorMessage.includes("cédula")) {
      return "La cédula ya está registrada en el sistema. Por favor, verifique el número e intente nuevamente.";
   } else if (errorMessage.includes("mismos datos de identificación")) {
      return "Ya existe un Socio con los mismos datos de identificación. Por favor, verifique la información e intente nuevamente.";
   }
   
   return errorMessage || "Error al procesar la solicitud";
};

/**
 * Options for form select fields
 */
export const formOptions = {
   tipoContrato: [
      { value: "indefinido", label: "Indefinido" },
      { value: "plazo_fijo", label: "Plazo fijo" },
      { value: "por_servicios_profesionales", label: "Por servicios profesionales" },
   ],
   
   departamentos: [
      { value: "administracion", label: "Administración" },
      { value: "contabilidad", label: "Contabilidad" },
      { value: "operaciones", label: "Operaciones" },
      { value: "recursos_humanos", label: "Recursos Humanos" },
      { value: "marketing", label: "Marketing" },
      { value: "ventas", label: "Ventas" },
      { value: "it", label: "Tecnología de la Información (IT)" },
      { value: "logistica", label: "Logística" },
      { value: "legal", label: "Legal" },
      { value: "investigacion_desarollo", label: "Investigación y Desarrollo" },
      { value: "servicio_cliente", label: "Servicio al Cliente" },
      { value: "compras", label: "Compras" },
      { value: "produccion", label: "Producción" },
   ],
   
   puestos: [
      { value: "administrador", label: "Administrador" },
      { value: "contador", label: "Contador" },
      { value: "bodeguero", label: "Bodeguero" },
      { value: "gerente", label: "Gerente" },
      { value: "analista", label: "Analista" },
      { value: "desarrollador", label: "Desarrollador" },
      { value: "soporte_tecnico", label: "Soporte Técnico" },
      { value: "vendedor", label: "Vendedor" },
      { value: "recepcionista", label: "Recepcionista" },
      { value: "asistente", label: "Asistente" },
      { value: "supervisor", label: "Supervisor" },
      { value: "coordinador", label: "Coordinador" },
      { value: "director", label: "Director" },
      { value: "especialista_en_marketing", label: "Especialista en Marketing" },
      { value: "rrhh", label: "Especialista en Recursos Humanos" },
   ],
   
   supervisores: [
      { value: "Socio_1", label: "Socio 1" },
      { value: "Socio_2", label: "Socio 2" },
      { value: "Socio_3", label: "Socio 3" },
   ],
   
   jornadaLaboral: [
      { value: "tiempo_completo", label: "Tiempo completo" },
      { value: "medio_tiempo", label: "Medio tiempo" },
      { value: "por_horas", label: "Por horas" },
      { value: "temporal", label: "Temporal" },
      { value: "freelance", label: "Freelance" },
      { value: "practicas", label: "Prácticas" },
      { value: "remoto", label: "Remoto" },
      { value: "contrato", label: "Contrato" },
      { value: "jornada_parcial", label: "Jornada parcial" },
      { value: "becario", label: "Becario" },
   ],
   
   monedaPago: [
      { value: "colones", label: "Colones" },
      { value: "dolares", label: "Dólares" },
      { value: "colones_y_dolares", label: "Colones y dólares" },
   ],
   
   tipoPlanilla: [
      { value: "quincenal", label: "Quincenal" },
      { value: "bisemanal", label: "Bisemanal" },
      { value: "semanal", label: "Semanal" },
   ],
}; 