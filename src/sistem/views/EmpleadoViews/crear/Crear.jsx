import { ErrorMessage } from "../../../components/ErrorMessage/ErrorMessage";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";
import { useState, useEffect } from "react";
import { Switch } from "@mui/material";
import { fetchData_api } from "../../../../store/fetchData_api/fetchData_api_Thunks";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";   
import swal from "sweetalert2";
/**
 * Validation utility functions for form fields
 */
const validationUtils = {
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
 * Custom hook for managing form data and validation
 * @returns {Object} - Object containing form data, handlers, and validation functions
 */
const useEmployeeForm = () => {
   const [error, setError] = useState(false);
   const [message, setMessage] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const validation = useFormValidation();
   const navigate = useNavigate();
   const dispatch = useDispatch();


   const [formData, setFormData] = useState({
      nombre_completo: "",
      correo: "",
      telefono: "",
      cedula: "",
      salario_base: "",
      tipo_contrato: "",
      departamento: "",
      puesto: "",
      supervisor: "",
      id_empresa: "", // Campo oculto
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

   // Debug effect to log form data changes
   useEffect(() => {
      console.log("Form data updated:", formData);
   }, [formData]);

   /**
    * Handles email validation on change
    * @param {string} email - The email value to validate
    */
   const handleEmailValidation = (email) => {
      if (!email) {
         validation.setEmailError("");
         return;
      }

      if (!validationUtils.validateEmailFormat(email)) {
         validation.setEmailError("El formato del correo electrónico no es válido");
         return;
      }

      if (!validationUtils.validateEmployeeEmail(email)) {
         validation.setEmailError("El correo debe ser un correo de Socio válido");
         return;
      }

      validation.setEmailError("");
   };

   /**
    * Handles cédula validation on change
    * @param {string} cedula - The cédula value to validate
    */
   const handleCedulaValidation = (cedula) => {
      if (!cedula) {
         validation.setCedulaError("");
         return;
      }

      if (!validationUtils.validateCedulaFormat(cedula)) {
         validation.setCedulaError(
            "La cédula solo puede contener letras y números, sin espacios ni caracteres especiales",
         );
         return;
      }

      validation.setCedulaError("");
   };

   /**
    * Handles name validation on change
    * @param {string} name - The name value to validate
    */
   const handleNameValidation = (name) => {
      if (!name) {
         validation.setNombreError("");
         return;
      }

      if (!validationUtils.validateNameFormat(name)) {
         validation.setNombreError("El nombre solo puede contener letras, espacios y tildes");
         return;
      }

      validation.setNombreError("");
   };

   /**
    * Handles phone validation on change
    * @param {string} phone - The phone value to validate
    */
   const handlePhoneValidation = (phone) => {
      if (!phone) {
         validation.setTelefonoError("");
         return;
      }

      if (!validationUtils.validatePhoneFormat(phone)) {
         validation.setTelefonoError("El teléfono solo puede contener números");
         return;
      }

      validation.setTelefonoError("");
   };

   /**
    * Handles salary validation on change
    * @param {string} salary - The salary value to validate
    */
   const handleSalaryValidation = (salary) => {
      if (!salary) {
         validation.setSalarioError("");
         return;
      }

      if (!validationUtils.validateSalaryFormat(salary)) {
         validation.setSalarioError("El salario debe ser un número positivo");
         return;
      }

      validation.setSalarioError("");
   };

   /**
    * Handles number validation on change
    * @param {string} number - The number value to validate
    * @param {string} fieldName - The field name for error state
    */
   const handleNumberValidation = (number, fieldName) => {
      if (!number) {
         switch (fieldName) {
            case "numero_asegurado":
               validation.setNumeroAseguradoError("");
               break;
            case "numero_ins":
               validation.setNumeroInsError("");
               break;
            case "numero_hacienda":
               validation.setNumeroHaciendaError("");
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
               validation.setNumeroAseguradoError(errorMessage);
               break;
            case "numero_ins":
               validation.setNumeroInsError(errorMessage);
               break;
            case "numero_hacienda":
               validation.setNumeroHaciendaError(errorMessage);
               break;
            default:
               break;
         }
         return;
      }

      switch (fieldName) {
         case "numero_asegurado":
            validation.setNumeroAseguradoError("");
            break;
         case "numero_ins":
            validation.setNumeroInsError("");
            break;
         case "numero_hacienda":
            validation.setNumeroHaciendaError("");
            break;
         default:
            break;
      }
   };

   /**
    * Handles form field changes with validation
    * @param {Event} e - The change event
    */
   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Validate fields specifically
      switch (name) {
         case "correo":
            handleEmailValidation(value);
            break;
         case "cedula":
            handleCedulaValidation(value);
            break;
         case "nombre_completo":
            handleNameValidation(value);
            break;
         case "telefono":
            handlePhoneValidation(value);
            break;
         case "salario_base":
            handleSalaryValidation(value);
            break;
         case "numero_asegurado":
         case "numero_ins":
         case "numero_hacienda":
            handleNumberValidation(value, name);
            break;
         default:
            break;
      }
   };

   /**
    * Handles switch changes for institution fields
    * @param {string} fieldName - The name of the institution field
    * @param {boolean} checked - The checked state of the switch
    */
   const handleSwitchChange = (fieldName, checked) => {
      setFormData({ ...formData, [fieldName]: checked });
   };

   /**
    * Generates a random number between min and max
    * @param {number} min - Minimum value
    * @param {number} max - Maximum value
    * @returns {number} - Random number
    */
   const getRandomNumber = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
   };

   /**
    * Generates a random element from an array
    * @param {Array} array - Array to select from
    * @returns {*} - Random element
    */
   const getRandomElement = (array) => {
      return array[Math.floor(Math.random() * array.length)];
   };

   /**
    * Generates a random Costa Rican name
    * @returns {string} - Random full name
    */
   const generateRandomName = () => {
      const nombres = [
         "María José", "Juan Carlos", "Ana Sofía", "Luis Fernando", "Carmen Elena",
         "Roberto Antonio", "Patricia Isabel", "Carlos Manuel", "Laura Cristina",
         "Miguel Ángel", "Sofia Alejandra", "Diego Alejandro", "Valeria María",
         "Andrés Felipe", "Daniela Carolina", "Jorge Luis", "Natalia Andrea",
         "Ricardo José", "Gabriela Patricia", "Francisco Javier"
      ];
      
      const apellidos = [
         "Rodríguez López", "González Pérez", "Hernández Mora", "Jiménez Castro",
         "Morales Vega", "Rojas Chaves", "Castro Méndez", "Vargas Solís",
         "Méndez Rojas", "Araya Campos", "Salazar Herrera", "Ramírez Valverde",
         "Cordero Guzmán", "Villalobos Brenes", "Acuña Madrigal", "Brenes Mora",
         "Campos Rojas", "Chaves Solís", "Díaz Castro", "Espinoza Vega"
      ];

      return `${getRandomElement(nombres)} ${getRandomElement(apellidos)}`;
   };

   /**
    * Generates a random email
    * @param {string} name - Name to use in email
    * @returns {string} - Random email
    */
   const generateRandomEmail = (name) => {
      const domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "empresa.com"];
      const cleanName = name.toLowerCase().replace(/[áéíóúñ]/g, (match) => {
         const accents = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
         return accents[match];
      }).replace(/\s+/g, '.');
      
      return `${cleanName}@${getRandomElement(domains)}`;
   };

   /**
    * Generates a random phone number
    * @returns {string} - Random phone number
    */
   const generateRandomPhone = () => {
      const prefixes = ["8", "7", "6"];
      const prefix = getRandomElement(prefixes);
      const number = getRandomNumber(10000000, 99999999).toString();
      return `${prefix}${number}`;
   };

   /**
    * Generates a random cédula
    * @returns {string} - Random cédula
    */
   const generateRandomCedula = () => {
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
      const letter = getRandomElement(letters);
      const number = getRandomNumber(10000000, 99999999).toString();
      return `${letter}${number}`;
   };

   /**
    * Generates a random date within the last 5 years
    * @returns {string} - Random date in YYYY-MM-DD format
    */
   const generateRandomDate = () => {
      const today = new Date();
      const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
      const randomTime = fiveYearsAgo.getTime() + Math.random() * (today.getTime() - fiveYearsAgo.getTime());
      const randomDate = new Date(randomTime);
      return randomDate.toISOString().split('T')[0];
   };

   /**
    * Generates a random bank account number
    * @returns {string} - Random bank account
    */
   const generateRandomBankAccount = () => {
      const prefix = "CR";
      const number = getRandomNumber(10000000000000000000, 99999999999999999999).toString();
      return `${prefix}${number}`;
   };

   /**
    * Loads random example employee data into the form
    * Follows the proper format for all validation rules
    */
   const loadExampleData = () => {
      const randomName = generateRandomName();
      
      const exampleEmployee = {
         nombre_completo: randomName,
         correo: generateRandomEmail(randomName),
         telefono: generateRandomPhone(),
         cedula: generateRandomCedula(),
         salario_base: getRandomNumber(300000, 2000000).toString(),
         tipo_contrato: getRandomElement(["indefinido", "plazo_fijo", "por_servicios_profesionales"]),
         departamento: getRandomElement([
            "administracion", "contabilidad", "operaciones", "recursos_humanos",
            "marketing", "ventas", "it", "logistica", "legal", "investigacion_desarollo",
            "servicio_cliente", "compras", "produccion"
         ]),
         puesto: getRandomElement([
            "administrador", "contador", "bodeguero", "gerente", "analista",
            "desarrollador", "soporte_tecnico", "vendedor", "recepcionista",
            "asistente", "supervisor", "coordinador", "director",
            "especialista_en_marketing", "rrhh"
         ]),
         supervisor: getRandomElement(["Socio_1", "Socio_2", "Socio_3"]),
         id_empresa: "",
         fecha_ingreso: generateRandomDate(),
         fecha_salida: Math.random() > 0.8 ? generateRandomDate() : "", // 20% chance of having end date
         jornada_laboral: getRandomElement([
            "tiempo_completo", "medio_tiempo", "por_horas", "temporal",
            "freelance", "practicas", "remoto", "contrato", "jornada_parcial", "becario"
         ]),
         numero_asegurado: getRandomNumber(100000000, 999999999).toString(),
         numero_ins: getRandomNumber(100000000, 999999999).toString(),
         numero_hacienda: getRandomNumber(100000000, 999999999).toString(),
         cuenta_bancaria_1: Math.random() > 0.3 ? generateRandomBankAccount() : "", // 70% chance of having account
         cuenta_bancaria_2: Math.random() > 0.7 ? generateRandomBankAccount() : "", // 30% chance of having second account
         vacaciones_acumuladas: getRandomNumber(0, 30).toString(),
         aguinaldo_acumulado: getRandomNumber(0, 500000).toString(),
         cesantia_acumulada: getRandomNumber(0, 300000).toString(),
         ministerio_hacienda: Math.random() > 0.3, // 70% chance of being true
         rt_ins: Math.random() > 0.2, // 80% chance of being true
         ccss: Math.random() > 0.4, // 60% chance of being true
         moneda_pago: getRandomElement(["colones", "dolares", "colones_y_dolares"]),
         tipo_planilla: getRandomElement(["quincenal", "bisemanal", "semanal"]),
      };

      // Clear any existing validation errors first
      validation.clearAllErrors();
      setError(false);
      setMessage("");

      // Set the form data
      setFormData(exampleEmployee);
   };

   /**
    * Configuration object for required fields with their validation messages
    * @type {Object.<string, string>}
    */
   const REQUIRED_FIELDS_CONFIG = {
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
    * Validates if a field value is empty or contains only whitespace
    * @param {string} value - The field value to validate
    * @returns {boolean} - True if field is empty, false otherwise
    */
   const isFieldEmpty = (value) => {
      return !value || value.toString().trim() === "";
   };

   /**
    * Sets validation error for a specific field
    * @param {string} fieldName - The name of the field
    * @param {string} errorMessage - The error message to set
    */
   const setFieldValidationError = (fieldName, errorMessage) => {
      const errorSetters = {
         nombre_completo: validation.setNombreError,
         correo: validation.setEmailError,
         telefono: validation.setTelefonoError,
         cedula: validation.setCedulaError,
         salario_base: validation.setSalarioError,
         tipo_contrato: validation.setTipoContratoError,
         departamento: validation.setDepartamentoError,
         puesto: validation.setPuestoError,
         supervisor: validation.setSupervisorError,
         jornada_laboral: validation.setJornadaError,
         fecha_ingreso: validation.setFechaIngresoError,
         numero_asegurado: validation.setNumeroAseguradoError,
         numero_ins: validation.setNumeroInsError,
         numero_hacienda: validation.setNumeroHaciendaError,
         moneda_pago: validation.setMonedaPagoError,
         tipo_planilla: validation.setTipoPlanillaError,
      };

      const setter = errorSetters[fieldName];
      if (setter) {
         setter(errorMessage);
      }
   };

   /**
    * Validates all required fields and sets appropriate error messages
    * @returns {boolean} - True if all required fields are valid, false otherwise
    */
   const validateRequiredFields = () => {
      let hasErrors = false;

      Object.entries(REQUIRED_FIELDS_CONFIG).forEach(([fieldName, errorMessage]) => {
         if (isFieldEmpty(formData[fieldName])) {
            hasErrors = true;
            setFieldValidationError(fieldName, errorMessage);
         }
      });

      return !hasErrors;
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
      const requiredFieldsValid = validateRequiredFields();

      // Check for existing validation errors
      const hasValidationErrors = validation.hasErrors();

      // Validación adicional para campos únicos
      const uniqueFieldsValid = validateUniqueFields();

      if (!requiredFieldsValid || hasValidationErrors || !uniqueFieldsValid) {
         setError(true);
         setMessage("Por favor corrija todos los errores en el formulario");
         return false;
      }

      return true;
   };

   /**
    * Validates unique fields to ensure they are properly filled
    * @returns {boolean} - True if all unique fields are valid, false otherwise
    */
   const validateUniqueFields = () => {
      let isValid = true;

      // Validar que los números de identificación no estén vacíos
      if (!formData.numero_asegurado || formData.numero_asegurado.trim() === "") {
         validation.setNumeroAseguradoError("El número de asegurado es obligatorio y debe ser único");
         isValid = false;
      }

      if (!formData.numero_ins || formData.numero_ins.trim() === "") {
         validation.setNumeroInsError("El número de INS es obligatorio y debe ser único");
         isValid = false;
      }

      if (!formData.numero_hacienda || formData.numero_hacienda.trim() === "") {
         validation.setNumeroHaciendaError("El número de hacienda es obligatorio y debe ser único");
         isValid = false;
      }

      if (!formData.correo || formData.correo.trim() === "") {
         validation.setEmailError("El correo electrónico es obligatorio y debe ser único");
         isValid = false;
      }

      if (!formData.cedula || formData.cedula.trim() === "") {
         validation.setCedulaError("La cédula es obligatoria y debe ser única");
         isValid = false;
      }

      return isValid;
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

         swal.fire({
            title: "Creando Socio",
            text: "Espere un momento mientras se crea el Socio",
            icon: "info",
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            allowClosePropagation: false,
         });

         const response = await dispatch(fetchData_api(formData, "gestor/empleados/crear"));

         if (response.success) {
            setError(false);

            swal.fire({
               title: "Socio creado exitosamente",
               text: "El Socio ha sido creado exitosamente",
               icon: "success",
               confirmButtonText: "Aceptar",
            }).then(() => {
                  // Reset form
               setFormData({
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
               validation.clearAllErrors();
               navigate("/empleados/lista");
            });
           
         } else {
            // Mejorar el manejo de errores para mostrar mensajes más específicos
            let errorMessage = response.message || "Error al crear el Socio";
            
            // Si el mensaje contiene información sobre duplicados, mostrarlo de forma más clara
            if (errorMessage.includes("número de asegurado")) {
               errorMessage = "El número de asegurado ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
            } else if (errorMessage.includes("número de INS")) {
               errorMessage = "El número de INS ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
            } else if (errorMessage.includes("número de hacienda")) {
               errorMessage = "El número de hacienda ya está registrado en el sistema. Por favor, verifique el número e intente nuevamente.";
            } else if (errorMessage.includes("correo electrónico")) {
               errorMessage = "El correo electrónico ya está registrado en el sistema. Por favor, use un correo diferente.";
            } else if (errorMessage.includes("cédula")) {
               errorMessage = "La cédula ya está registrada en el sistema. Por favor, verifique el número e intente nuevamente.";
            } else if (errorMessage.includes("mismos datos de identificación")) {
               errorMessage = "Ya existe un Socio con los mismos datos de identificación. Por favor, verifique la información e intente nuevamente.";
            }

            swal.fire({
               title: "Error al crear el Socio",
               text: errorMessage,
               icon: "error",
               confirmButtonText: "Aceptar",
            });
            setError(true);
            setMessage(errorMessage);
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
      handleInputChange,
      handleSwitchChange,
      loadExampleData,
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
 * Main component for creating a new employee
 * @returns {JSX.Element} - CrearSocio component
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
      loadExampleData,
      handleSubmit 
   } = useEmployeeForm();

   return (
      <TarjetaRow
         texto="Crear un nuevo Socio"
         subtitulo="Complete la información del Socio"
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
                  Si intenta crear un Socio con datos que ya existen, recibirá un mensaje de error específico.
               </p>
               <p className="mb-0">
                  <strong>Campos únicos:</strong> Correo electrónico, Cédula, Número de asegurado, Número de INS, Número de hacienda.
               </p>
            </div>

            {/* Botón para cargar datos de ejemplo */}
            <div className="mb-4">
               <button
                  type="button"
                  onClick={loadExampleData}
                  className="btn btn-outline-primary me-2"
                  disabled={isLoading}
               >
                  <i className="fas fa-random me-2"></i>
                  Generar Socio Aleatorio
               </button>
               <small className="text-muted">
                  Haz clic para llenar el formulario con datos aleatorios válidos
               </small>
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

            {/* Información Laboral */}
            <h5 className="mb-3 mt-4">Información Laboral</h5>
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
                     <option value="indefinido">Indefinido</option>
                     <option value="plazo_fijo">Plazo fijo</option>
                     <option value="por_servicios_profesionales">
                        Por servicios profesionales
                     </option>
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
                     <option value="administracion">Administración</option>
                     <option value="contabilidad">Contabilidad</option>
                     <option value="operaciones">Operaciones</option>
                     <option value="recursos_humanos">Recursos Humanos</option>
                     <option value="marketing">Marketing</option>
                     <option value="ventas">Ventas</option>
                     <option value="it">Tecnología de la Información (IT)</option>
                     <option value="logistica">Logística</option>
                     <option value="legal">Legal</option>
                     <option value="investigacion_desarollo">Investigación y Desarrollo</option>
                     <option value="servicio_cliente">Servicio al Cliente</option>
                     <option value="compras">Compras</option>
                     <option value="produccion">Producción</option>
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
                     <option value="administrador">Administrador</option>
                     <option value="contador">Contador</option>
                     <option value="bodeguero">Bodeguero</option>
                     <option value="gerente">Gerente</option>
                     <option value="analista">Analista</option>
                     <option value="desarrollador">Desarrollador</option>
                     <option value="soporte_tecnico">Soporte Técnico</option>
                     <option value="vendedor">Vendedor</option>
                     <option value="recepcionista">Recepcionista</option>
                     <option value="asistente">Asistente</option>
                     <option value="supervisor">Supervisor</option>
                     <option value="coordinador">Coordinador</option>
                     <option value="director">Director</option>
                     <option value="especialista_en_marketing">Especialista en Marketing</option>
                     <option value="rrhh">Especialista en Recursos Humanos</option>
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
                     onChange={handleInputChange}
                     required
                     error={validation.supervisorError}
                  >
                     <option value="">Seleccione una opción</option>
                     <option value="Socio_1">Socio 1</option>
                     <option value="Socio_2">Socio 2</option>
                     <option value="Socio_3">Socio 3</option>
                  </FormField>
               </div>
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
                     <option value="tiempo_completo">Tiempo completo</option>
                     <option value="medio_tiempo">Medio tiempo</option>
                     <option value="por_horas">Por horas</option>
                     <option value="temporal">Temporal</option>
                     <option value="freelance">Freelance</option>
                     <option value="practicas">Prácticas</option>
                     <option value="remoto">Remoto</option>
                     <option value="contrato">Contrato</option>
                     <option value="jornada_parcial">Jornada parcial</option>
                     <option value="becario">Becario</option>
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

            {/* Números de identificación */}
            <h5 className="mb-3 mt-4">Números de Identificación</h5>
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

            {/* Cuentas bancarias */}
            <h5 className="mb-3 mt-4">Cuentas Bancarias</h5>
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

            {/* Acumulados */}
            <h5 className="mb-3 mt-4">Acumulados a la fecha de ingreso</h5>
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
                     onChange={handleInputChange}
                     required
                     error={validation.monedaPagoError}
                  >
                     <option value="">Seleccione una opción</option>
                     <option value="colones">Colones</option>
                     <option value="dolares">Dólares</option>
                     <option value="colones_y_dolares">Colones y dólares</option>
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
                     <option value="quincenal">Quincenal</option>
                     <option value="bisemanal">Bisemanal</option>
                     <option value="semanal">Semanal</option>
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
