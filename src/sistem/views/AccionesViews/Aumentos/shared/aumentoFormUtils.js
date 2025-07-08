/**
 * Shared utilities for aumento salarial form validation and common functions
 * Used by both create and edit aumento components
 */

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validation utility functions for form fields
 */
export const validationUtils = {
   /**
    * Validates if a value is a positive number
    */
   validatePositiveNumber: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
   },

   /**
    * Validates if a value is a valid percentage (0-100)
    */
   validatePercentage: (value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 100;
   },

   /**
    * Validates if a date is not in the past
    */
   validateFutureDate: (date) => {
      if (!date) return false;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
   },

   /**
    * Validates if a text field is not empty and has minimum length
    */
   validateTextLength: (text, minLength = 10) => {
      return text && text.trim().length >= minLength;
   },
};

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

/**
 * Configuration object for required fields with their validation messages
 */
export const REQUIRED_FIELDS_CONFIG = {
   planilla: "Debe seleccionar una planilla",
   empleado: "Debe seleccionar un socio",
   remuneracion_actual: "La remuneración actual es obligatoria y debe ser mayor a cero",
   tipo_ajuste: "Debe seleccionar el tipo de ajuste",
   monto_aumento: "El monto del aumento es obligatorio y debe ser mayor a cero",
   fecha_efectiva: "La fecha efectiva es obligatoria",
};

/**
 * Initial form data structure
 */
export const getInitialFormData = () => ({
   // Basic Information
   empresa: "",
   planilla: "",
   empleado: "",
   
   // Salary Information
   remuneracion_actual: "",
   tipo_ajuste: "Fijo",
   monto_aumento: "",
   remuneracion_nueva: "",
   
   // Additional Information
   fecha_efectiva: "",
   
   // Status
   estado: "Activo",
});

/**
 * Options for form select fields
 */
export const formOptions = {
   tipoAjuste: [
      { value: "Fijo", label: "Fijo (₡)" },
      { value: "Porcentual", label: "Porcentual (%)" },
   ],
   
   estados: [
      { value: "Activo", label: "Activo" },
      { value: "Inactivo", label: "Inactivo" },
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
 * Calculates new salary based on current salary, adjustment type and amount
 */
export const calculateNewSalary = (currentSalary, adjustmentType, adjustmentAmount) => {
   const current = parseFloat(currentSalary);
   const amount = parseFloat(adjustmentAmount);
   
   if (isNaN(current) || isNaN(amount) || amount <= 0) {
      return "";
   }
   
   let newSalary = 0;
   
   if (adjustmentType === "Fijo") {
      // Fixed amount: direct addition
      newSalary = current + amount;
   } else if (adjustmentType === "Porcentual") {
      // Percentage: calculate percentage
      const percentage = amount / 100;
      newSalary = current + (current * percentage);
   }
   
   return newSalary.toFixed(2);
};

/**
 * Formats currency for display
 */
export const formatCurrency = (amount) => {
   if (!amount || isNaN(amount)) return "₡0.00";
   return `₡${parseFloat(amount).toLocaleString('es-CR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
   })}`;
};

/**
 * Formats percentage for display
 */
export const formatPercentage = (percentage) => {
   if (!percentage || isNaN(percentage)) return "0%";
   return `${parseFloat(percentage).toFixed(2)}%`;
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
 * Handles remuneration validation
 */
export const handleRemuneracionValidation = (value, setError) => {
   handleFieldValidation(
      value,
      validationUtils.validatePositiveNumber,
      setError,
      "La remuneración debe ser un número positivo"
   );
};

/**
 * Handles adjustment amount validation based on type
 */
export const handleMontoAumentoValidation = (value, tipoAjuste, setError) => {
   if (!value) {
      setError("");
      return;
   }
   
   let isValid = false;
   let errorMessage = "";
   
   if (tipoAjuste === "Fijo") {
      isValid = validationUtils.validatePositiveNumber(value);
      errorMessage = "El monto debe ser un número positivo";
   } else if (tipoAjuste === "Porcentual") {
      isValid = validationUtils.validatePercentage(value);
      errorMessage = "El porcentaje debe estar entre 0 y 100";
   }
   
   if (!isValid) {
      setError(errorMessage);
   } else {
      setError("");
   }
};

/**
 * Handles date validation
 */
export const handleFechaValidation = (value, setError) => {
   handleFieldValidation(
      value,
      validationUtils.validateFutureDate,
      setError,
      "La fecha efectiva no puede ser anterior a hoy"
   );
};



/**
 * Handles select field validation
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
      planilla: errorSetters.setPlanillaError,
      empleado: errorSetters.setEmpleadoError,
      remuneracion_actual: errorSetters.setRemuneracionActualError,
      tipo_ajuste: errorSetters.setTipoAjusteError,
      monto_aumento: errorSetters.setMontoAumentoError,
      fecha_efectiva: errorSetters.setFechaEfectivaError,
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
      if (isFieldEmpty(formData[fieldName])) {
         hasErrors = true;
         setFieldValidationError(fieldName, errorMessage, errorSetters);
      }
   });

   return !hasErrors;
};

/**
 * Handles form field changes with validation
 */
export const handleInputChange = (e, formData, setFormData, errorSetters) => {
   const { name, value } = e.target;
   setFormData({ ...formData, [name]: value });

   // Field-specific validation handlers
   const validationHandlers = {
      remuneracion_actual: () => handleRemuneracionValidation(value, errorSetters.setRemuneracionActualError),
      monto_aumento: () => handleMontoAumentoValidation(value, formData.tipo_ajuste, errorSetters.setMontoAumentoError),
      fecha_efectiva: () => handleFechaValidation(value, errorSetters.setFechaEfectivaError),
      // Select field validations
      planilla: () => handleSelectValidation(value, errorSetters.setPlanillaError, "Debe seleccionar una planilla"),
      empleado: () => handleSelectValidation(value, errorSetters.setEmpleadoError, "Debe seleccionar un socio"),
      tipo_ajuste: () => handleSelectValidation(value, errorSetters.setTipoAjusteError, "Debe seleccionar el tipo de ajuste"),
   };

   const handler = validationHandlers[name];
   if (handler) {
      handler();
   }
};

// ============================================================================
// ERROR MESSAGE HANDLING
// ============================================================================

/**
 * Improves error message handling for API responses
 */
export const improveErrorMessage = (errorMessage) => {
   const errorMappings = {
      "planilla": "Error relacionado con la planilla seleccionada",
      "empleado": "Error relacionado con el socio seleccionado",
      "remuneracion": "Error en la remuneración ingresada",
      "monto": "Error en el monto del aumento",
      "fecha": "Error en la fecha efectiva",
      "duplicado": "Ya existe un aumento similar para este socio",
      "planilla_cerrada": "No se puede crear un aumento en una planilla cerrada",
   };

   for (const [key, message] of Object.entries(errorMappings)) {
      if (errorMessage.toLowerCase().includes(key)) {
         return message;
      }
   }
   
   return errorMessage || "Error al procesar la solicitud";
};

/**
 * Creates a confirmation message for the user
 */
export const createConfirmationMessage = (formData, empleadoData) => {
   const nombre = empleadoData?.nombre_completo_empleado_gestor || "N/A";
   const socio = empleadoData?.numero_socio_empleado_gestor || "N/A";
   const tipoAjuste = formData.tipo_ajuste;
   const montoAumento = formData.monto_aumento;
   const fechaEfectiva = formData.fecha_efectiva;

   return `
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
}; 