/**
 * Shared utilities for employee form validation and common functions
 * Used by both create and edit employee components
 */

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validation utility functions for form fields
 */
export const validationUtils = {
   /**
    * Validates email format using a comprehensive regex pattern
    */
   validateEmailFormat: (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
   },

   /**
    * Validates if email follows employee email format (accepts any valid email)
    */
   validateEmployeeEmail: (email) => {
      return true; // Accept any valid email format
   },

   /**
    * Validates cédula format (letters and numbers only, no spaces or special characters)
    */
   validateCedulaFormat: (cedula) => {
      const cedulaRegex = /^[A-Za-z0-9]+$/;
      return cedulaRegex.test(cedula);
   },

   /**
    * Validates name format (only letters, spaces, and accents, no special characters)
    */
   validateNameFormat: (name) => {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      return nameRegex.test(name);
   },

   /**
    * Validates phone number format (only numbers)
    */
   validatePhoneFormat: (phone) => {
      const phoneRegex = /^[0-9]+$/;
      return phoneRegex.test(phone);
   },

   /**
    * Validates salary format (positive number)
    */
   validateSalaryFormat: (salary) => {
      const salaryRegex = /^[0-9]+(\.[0-9]+)?$/;
      return salaryRegex.test(salary) && parseFloat(salary) > 0;
   },

   /**
    * Validates number format (only numbers)
    */
   validateNumberFormat: (number) => {
      const numberRegex = /^[0-9]+$/;
      return numberRegex.test(number);
   },
};

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

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
   jornada_laboral: "La jornada laboral es obligatoria",
   fecha_ingreso: "La fecha de ingreso es obligatoria",
   numero_asegurado: "El número de asegurado es obligatorio",
   numero_ins: "El número de INS es obligatorio",
   numero_hacienda: "El número de hacienda es obligatorio",
   moneda_pago: "La moneda de pago es obligatoria",
   tipo_planilla: "El tipo de planilla es obligatorio",
   monto_asegurado: "El monto de asegurado es obligatorio cuando CCSS está activado",
};

/**
 * Initial form data structure
 */
export const getInitialFormData = () => ({
   // Personal Information
   nombre_completo: "",
   correo: "",
   telefono: "",
   cedula: "",
   
   // Work Information
   salario_base: "0",
   tipo_contrato: "",
   departamento: "",
   puesto: "",
   id_empresa: "",
   fecha_ingreso: "0",
   fecha_salida: "0",
   jornada_laboral: "0",
   
   // Identification Numbers
   numero_asegurado: "0",
   numero_ins: "0",
   numero_hacienda: "0",
   
   // Bank Accounts
   cuenta_bancaria_1: "0",
   cuenta_bancaria_2: "0",
   
   // Accumulated Benefits
   vacaciones_acumuladas: "0",
   aguinaldo_acumulado: "0",
   cesantia_acumulada: "0",
   
   // Institution Switches
   ministerio_hacienda: false,
   rt_ins: false,
   ccss: false,
   
   // CCSS Amount (only required when CCSS is checked)
   monto_asegurado: "",
   
   // Payment Configuration
   moneda_pago: "",
   tipo_planilla: "",
   
   // Employee Status
   estado_empleado_gestor: true,
   
   // Flag to indicate if data was copied from another employee
   isCopiedData: false,
});

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
   ],
   
   tipoPlanilla: [
      { value: "mensual", label: "Mensual" },
      { value: "quincenal", label: "Quincenal" },
      { value: "semanal", label: "Semanal" },
   ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validates if a field value is empty or contains only whitespace
 */
export const isFieldEmpty = (value) => {
   return !value || value.toString().trim() === "";
};

/**
 * Normalizes a value to match the value of select options
 * @param {string} valor - The value to normalize (can be label or value)
 * @param {Array} opciones - The array of select options
 * @returns {string} - The normalized value or "" if no match found
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

// ============================================================================
// VALIDATION HANDLERS
// ============================================================================

/**
 * Generic validation handler that sets error or clears it based on validation result
 */
const handleFieldValidation = (value, validator, setError, errorMessage) => {
   if (!value) {
      setError("");
      return;
   }
   
   if (!validator(value)) {
      setError(errorMessage);
      return;
   }
   
   setError("");
};

/**
 * Handles email validation on change
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
 */
export const handleCedulaValidation = (cedula, setCedulaError) => {
   handleFieldValidation(
      cedula,
      validationUtils.validateCedulaFormat,
      setCedulaError,
      "La cédula solo puede contener letras y números, sin espacios ni caracteres especiales"
   );
};

/**
 * Handles name validation on change
 */
export const handleNameValidation = (name, setNombreError) => {
   handleFieldValidation(
      name,
      validationUtils.validateNameFormat,
      setNombreError,
      "El nombre solo puede contener letras, espacios y tildes"
   );
};

/**
 * Handles phone validation on change
 */
export const handlePhoneValidation = (phone, setTelefonoError) => {
   handleFieldValidation(
      phone,
      validationUtils.validatePhoneFormat,
      setTelefonoError,
      "El teléfono solo puede contener números"
   );
};

/**
 * Handles salary validation on change
 */
export const handleSalaryValidation = (salary, setSalarioError) => {
   handleFieldValidation(
      salary,
      validationUtils.validateSalaryFormat,
      setSalarioError,
      "El salario debe ser un número positivo"
   );
};

/**
 * Handles number validation on change for identification fields
 */
export const handleNumberValidation = (number, fieldName, errorSetters) => {
   const errorMap = {
      numero_asegurado: errorSetters.setNumeroAseguradoError,
      numero_ins: errorSetters.setNumeroInsError,
      numero_hacienda: errorSetters.setNumeroHaciendaError,
      monto_asegurado: errorSetters.setMontoAseguradoError,
   };

   const setError = errorMap[fieldName];
   if (setError) {
      handleFieldValidation(
         number,
         validationUtils.validateNumberFormat,
         setError,
         "Este campo solo puede contener números"
      );
   }
};

/**
 * Handles monto asegurado validation - only required when CCSS is checked
 */
export const handleMontoAseguradoValidation = (monto, ccssChecked, setMontoAseguradoError) => {
   if (!ccssChecked) {
      setMontoAseguradoError("");
      return;
   }

   if (!monto || monto.trim() === "") {
      setMontoAseguradoError("El monto de asegurado es obligatorio cuando CCSS está activado");
      return;
   }

   if (!validationUtils.validateNumberFormat(monto)) {
      setMontoAseguradoError("El monto de asegurado solo puede contener números");
      return;
   }

   setMontoAseguradoError("");
};

/**
 * Handles select field validation - clears error when valid option is selected
 */
const handleSelectValidation = (value, setError, errorMessage) => {
   setError(value ? "" : errorMessage);
};

// ============================================================================
// FORM HANDLERS
// ============================================================================

/**
 * Sets validation error for a specific field
 */
export const setFieldValidationError = (fieldName, errorMessage, errorSetters) => {
   const errorSettersMap = {
      nombre_completo: errorSetters.setNombreError,
      correo: errorSetters.setEmailError,
      telefono: errorSetters.setTelefonoError,
      cedula: errorSetters.setCedulaError,
      salario_base: errorSetters.setSalarioError,
      tipo_contrato: errorSetters.setTipoContratoError,
      departamento: errorSetters.setDepartamentoError,
      puesto: errorSetters.setPuestoError,
      jornada_laboral: errorSetters.setJornadaError,
      fecha_ingreso: errorSetters.setFechaIngresoError,
      numero_asegurado: errorSetters.setNumeroAseguradoError,
      numero_ins: errorSetters.setNumeroInsError,
      numero_hacienda: errorSetters.setNumeroHaciendaError,
      moneda_pago: errorSetters.setMonedaPagoError,
      tipo_planilla: errorSetters.setTipoPlanillaError,
      monto_asegurado: errorSetters.setMontoAseguradoError,
   };

   const setter = errorSettersMap[fieldName];
   if (setter) {
      setter(errorMessage);
   }
};

/**
 * Validates all required fields and sets appropriate error messages
 */
export const validateRequiredFields = (formData, errorSetters) => {
   let hasErrors = false;

   Object.entries(REQUIRED_FIELDS_CONFIG).forEach(([fieldName, errorMessage]) => {
      // Special handling for monto_asegurado - only required when CCSS is checked
      if (fieldName === 'monto_asegurado') {
         if (formData.ccss && isFieldEmpty(formData[fieldName])) {
            hasErrors = true;
            setFieldValidationError(fieldName, errorMessage, errorSetters);
         }
      } else if (isFieldEmpty(formData[fieldName])) {
         hasErrors = true;
         setFieldValidationError(fieldName, errorMessage, errorSetters);
      }
   });

   return !hasErrors;
};

/**
 * Validates unique fields to ensure they are properly filled
 */
export const validateUniqueFields = (formData, errorSetters) => {
   const uniqueFields = [
      { field: 'numero_asegurado', setter: errorSetters.setNumeroAseguradoError, message: 'El número de asegurado es obligatorio y debe ser único' },
      { field: 'numero_ins', setter: errorSetters.setNumeroInsError, message: 'El número de INS es obligatorio y debe ser único' },
      { field: 'numero_hacienda', setter: errorSetters.setNumeroHaciendaError, message: 'El número de hacienda es obligatorio y debe ser único' },
      { field: 'correo', setter: errorSetters.setEmailError, message: 'El correo electrónico es obligatorio y debe ser único' },
      { field: 'cedula', setter: errorSetters.setCedulaError, message: 'La cédula es obligatoria y debe ser única' },
   ];

   let isValid = true;

   uniqueFields.forEach(({ field, setter, message }) => {
      if (!formData[field] || formData[field].trim() === "") {
         setter(message);
         isValid = false;
      }
   });

   return isValid;
};

/**
 * Handles form field changes with validation
 */
export const handleInputChange = (e, formData, setFormData, errorSetters) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });

   // Field-specific validation handlers
   const validationHandlers = {
      correo: () => handleEmailValidation(value, errorSetters.setEmailError),
      cedula: () => handleCedulaValidation(value, errorSetters.setCedulaError),
      nombre_completo: () => handleNameValidation(value, errorSetters.setNombreError),
      telefono: () => handlePhoneValidation(value, errorSetters.setTelefonoError),
      salario_base: () => handleSalaryValidation(value, errorSetters.setSalarioError),
      numero_asegurado: () => handleNumberValidation(value, name, errorSetters),
      numero_ins: () => handleNumberValidation(value, name, errorSetters),
      numero_hacienda: () => handleNumberValidation(value, name, errorSetters),
      monto_asegurado: () => handleMontoAseguradoValidation(value, formData.ccss, errorSetters.setMontoAseguradoError),
      // Select field validations
      tipo_contrato: () => handleSelectValidation(value, errorSetters.setTipoContratoError, "El tipo de contrato es obligatorio"),
      departamento: () => handleSelectValidation(value, errorSetters.setDepartamentoError, "El departamento es obligatorio"),
      puesto: () => handleSelectValidation(value, errorSetters.setPuestoError, "El puesto es obligatorio"),
      jornada_laboral: () => handleSelectValidation(value, errorSetters.setJornadaError, "La jornada laboral es obligatoria"),
      fecha_ingreso: () => handleSelectValidation(value, errorSetters.setFechaIngresoError, "La fecha de ingreso es obligatoria"),
      moneda_pago: () => handleSelectValidation(value, errorSetters.setMonedaPagoError, "La moneda de pago es obligatoria"),
      tipo_planilla: () => handleSelectValidation(value, errorSetters.setTipoPlanillaError, "El tipo de planilla es obligatorio"),
   };

   const handler = validationHandlers[name];
   if (handler) {
      handler();
   }
};

/**
 * Handles switch changes for institution fields
 */
export const handleSwitchChange = (fieldName, checked, formData, setFormData, errorSetters = null) => {
   setFormData({ ...formData, [fieldName]: checked });
   
   // If CCSS is being toggled and we have error setters, validate monto_asegurado
   if (fieldName === 'ccss') {
      if (errorSetters && errorSetters.setMontoAseguradoError) {
         handleMontoAseguradoValidation(formData.monto_asegurado, checked, errorSetters.setMontoAseguradoError);
      }
      
      // If CCSS is being unchecked, clear the monto_asegurado field
      if (!checked) {
         setFormData(prevData => ({ ...prevData, monto_asegurado: "0" }));
      }
   }
};

// ============================================================================
// ERROR MESSAGE HANDLING
// ============================================================================

/**
 * Improves error message handling for API responses
 */
export const improveErrorMessage = (errorMessage) => {
   // Si el mensaje ya viene del backend con el formato correcto de triggers, lo devolvemos tal como está
   if (errorMessage.includes("Ya existen 2 empleados")) {
      return errorMessage;
   }
   
   const errorMappings = {
      "número de asegurado": "El número de asegurado ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.",
      "número de INS": "El número de INS ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.",
      "número de hacienda": "El número de hacienda ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.",
      "correo electrónico": "El correo electrónico ya está registrado en el sistema. Por favor, use un correo diferente.",
      "cédula": "La cédula ya está registrada en el sistema. Por favor, verifique el número e intente nuevamente.",
      "mismos datos de identificación": "Ya existe un Socio con los mismos datos de identificación. Por favor, verifique la información e intente nuevamente.",
   };

   for (const [key, message] of Object.entries(errorMappings)) {
      if (errorMessage.includes(key)) {
         return message;
      }
   }
   
   return errorMessage || "Error al procesar la solicitud";
}; 