import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { AuthLayout } from "../layout/AuthLayout";
import { IniciarSesionManualmente } from "../../store/auth/authThunk";

// --- Custom Hooks (Separación de preocupaciones) ---

/**
 * Hook personalizado para gestionar el estado del formulario.
 * Sigue el Principio de Responsabilidad Única (SRP) al extraer la lógica del formulario.
 * @param {Object} initialState - Estado inicial para el formulario.
 * @returns {Object} - Estado del formulario y manejadores.
 */
const useForm = (initialState) => {
   const [formState, setFormState] = useState(initialState);

   // Manejador para cambios en los inputs
   const handleInputChange = useCallback(({ target }) => {
      const { name, value, type, checked } = target;
      setFormState((prev) => ({
         ...prev,
         [name]: type === "checkbox" ? checked : value,
      }));
   }, []);

   // Setter para propiedades específicas del estado del formulario
   const updateFormState = useCallback((newState) => {
      setFormState((prev) => ({
         ...prev,
         ...newState,
      }));
   }, []);

   return { formState, handleInputChange, updateFormState };
};

/**
 * Hook personalizado para gestionar la visibilidad de la contraseña.
 * Sigue el SRP al extraer la lógica del estado de la UI.
 * @returns {Object} - Estado de visibilidad de la contraseña y función para alternarla.
 */
const usePasswordVisibility = () => {
   const [showPassword, setShowPassword] = useState(false);
   const togglePasswordVisibility = useCallback(() => setShowPassword((prev) => !prev), []);
   return { showPassword, togglePasswordVisibility };
};

/**
 * Hook personalizado para gestionar el email recordado en localStorage.
 * Sigue el SRP al extraer la lógica de almacenamiento.
 * @returns {Object} - Métodos para interactuar con localStorage.
 */
const useRememberedEmail = () => {
   const storageKey = "rememberedEmail";

   const getEmail = useCallback(() => localStorage.getItem(storageKey), [storageKey]);

   const saveEmail = useCallback((email) => {
      if (email) {
         localStorage.setItem(storageKey, email);
      } else {
         localStorage.removeItem(storageKey);
      }
   }, [storageKey]);

   return { getEmail, saveEmail };
};

// --- Funciones de Utilidad (Helpers) ---

/**
 * Valida el formato del email usando regex.
 * @param {string} email - Email a validar.
 * @returns {boolean} - True si el formato del email es válido.
 */
const isValidEmail = (email) => {
   const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g; // Regex mejorada y más común
   return emailRegex.test(String(email).toLowerCase());
};

// --- Componentes de UI específicos para LoginPage (Separación de preocupaciones) ---

/**
 * Componente que muestra el estado actual del proceso de autenticación.
 * @param {string} authStatus - Estado actual de la autenticación ('EnProceso', 'Error', etc.).
 * @param {string} message - Mensaje de estado o error.
 * @returns {JSX.Element | null} Indicador de estado de autenticación o null.
 */
const LoginStatusIndicator = React.memo(({ authStatus, message }) => {
   if (authStatus === "EnProceso") {
      return (
         <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", my: 2, gap: 1 }}>
            <CircularProgress size={24} />
            <span style={{ fontSize: '0.875rem' }}>{message || "Verificando cuenta, espere un momento..."}</span>
         </Box>
      );
   }

   if (authStatus === "Error" && message) {
      return <Box sx={{ color: "error.main", textAlign: "center", my: 2, fontSize: '0.875rem' }}>{message}</Box>;
   }

   return null;
});

/**
 * Componente para el campo de entrada de email.
 */
const EmailInput = React.memo(({ value, onChange, error }) => (
   <div className="mb-3">
      <input
         type="email"
         className={`form-control ${error ? "is-invalid" : ""}`}
         placeholder="Correo electrónico"
         name="email"
         value={value}
         onChange={onChange}
         aria-label="Email"
         aria-describedby={error ? "email-error" : undefined}
      />
      {error && <div id="email-error" className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{error}</div>}
   </div>
));

/**
 * Componente para el campo de entrada de contraseña.
 */
const PasswordInput = React.memo(({ value, onChange, error, showPassword, onToggleVisibility }) => (
   <div className="mb-3 position-relative">
      <input
         type={showPassword ? "text" : "password"}
         className={`form-control ${error ? "is-invalid" : ""}`}
         placeholder="Contraseña"
         name="password"
         value={value}
         onChange={onChange}
         aria-label="Password"
         aria-describedby={error ? "password-error" : undefined}
      />
      <button
         type="button"
         className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
         onClick={onToggleVisibility}
         aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
         style={{ lineHeight: 1 }} // Ajuste para mejor alineación del ícono
      >
         <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true"></i>
      </button>
      {error && <div id="password-error" className="text-danger mt-1" style={{ fontSize: '0.8rem' }}>{error}</div>}
   </div>
));

// --- Componente Principal: LoginPage ---

/**
 * Componente LoginPage.
 * Maneja la autenticación del usuario a través de un formulario de inicio de sesión
 * con funcionalidad de "recordarme".
 * @returns {JSX.Element} - Componente LoginPage.
 */
export const LoginPage = () => {
   // Estado global de Redux
   const { authUsuario, mensaje } = useSelector((state) => state.auth);
   const dispatch = useDispatch();
   const navigate = useNavigate();

   // Hooks personalizados para manejar el estado y la lógica específica
   const { formState, handleInputChange, updateFormState } = useForm({
      email: "",
      password: "",
      rememberMe: false,
   });
   const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
   const { getEmail: getRememberedEmail, saveEmail: saveRememberedEmail } = useRememberedEmail();

   const [errors, setErrors] = useState({
      email: "",
      password: "",
   });

   const { email, password, rememberMe } = formState;

   // Efecto para cargar el email recordado en el montaje inicial
   useEffect(() => {
      const savedEmail = getRememberedEmail();
      if (savedEmail) {
         updateFormState({
            email: savedEmail,
            rememberMe: true,
         });
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [getRememberedEmail]); // updateFormState se memoiza con useCallback

   // Efecto para limpiar errores cuando los campos se modifican y validar email en tiempo real
   useEffect(() => {
      setErrors((prevErrors) => {
         const newErrors = { ...prevErrors };
         if (email && prevErrors.email) {
            if (isValidEmail(email)) {
               newErrors.email = "";
            } else {
               // Mantenemos el error si aún es inválido, o lo actualizamos si el usuario está escribiendo
               // newErrors.email = "Formato de correo electrónico inválido";
            }
         }
         if (password && prevErrors.password) {
            newErrors.password = "";
         }
         return newErrors;
      });
   }, [email, password]);

   /**
    * Valida los campos del formulario.
    * @returns {boolean} - True si el formulario es válido.
    */
   const validateForm = useCallback(() => {
      const newErrors = {};
      let isValid = true;

      if (!email.trim()) {
         newErrors.email = "El correo electrónico es obligatorio";
         isValid = false;
      } else if (!isValidEmail(email)) {
         newErrors.email = "Formato de correo electrónico inválido";
         isValid = false;
      }

      if (!password) {
         newErrors.password = "La contraseña es obligatoria";
         isValid = false;
      }

      setErrors(newErrors);
      return isValid;
   }, [email, password]);

   /**
    * Maneja el envío del formulario.
    * Valida los campos y guarda el email en localStorage si "Recordarme" está marcado.
    * @param {React.FormEvent<HTMLFormElement>} e - Evento de envío del formulario.
    */
   const handleSubmit = useCallback(async (e) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      if (rememberMe) {
         saveRememberedEmail(email);
      } else {
         saveRememberedEmail(null); // Pasar null para eliminarlo
      }

      // Lógica de autenticación
      // El thunk ya maneja la navegación en caso de éxito/error si es necesario
      dispatch(IniciarSesionManualmente({ email, password }, navigate));

   }, [dispatch, email, password, rememberMe, navigate, saveRememberedEmail, validateForm]);

   return (
      <AuthLayout>
         <div className="text-center">
            <img
               src="/img/1.png" // Considerar importar la imagen o usar una variable para la ruta
               alt="Logo de la empresa"
               className="img-fluid mb-4"
               width={250} // Podría ser gestionado por CSS para responsividad
            />
            <div className="saprator my-1">
               <span>Iniciar sesión para continuar</span>
            </div>
         </div>

         <LoginStatusIndicator authStatus={authUsuario} message={mensaje} />

         {/* El formulario ahora usa onSubmit para un mejor manejo semántico y de accesibilidad */}
         <form onSubmit={handleSubmit} noValidate>
            <EmailInput
               value={email}
               onChange={handleInputChange}
               error={errors.email}
            />

            <PasswordInput
               value={password}
               onChange={handleInputChange}
               error={errors.password}
               showPassword={showPassword}
               onToggleVisibility={togglePasswordVisibility}
            />

            <div className="d-flex mt-1 justify-content-between align-items-center">
               <div className="form-check">
                  <input
                     className="form-check-input input-dark"
                     type="checkbox"
                     id="customCheckc1" // IDs deben ser únicos, considerar generar dinámicamente si es necesario
                     name="rememberMe"
                     checked={rememberMe}
                     onChange={handleInputChange}
                     aria-label="Recordarme"
                  />
                  <label
                     className="form-check-label text-muted"
                     htmlFor="customCheckc1"
                  >
                     Recordarme
                  </label>
               </div>
               <Link to="/auth/recover" className="text-decoration-none">
                  <h6 className="f-w-400 mb-0">¿Olvidaste tu contraseña?</h6>
               </Link>
            </div>

            <div className="d-grid mt-4">
               <button
                  type="submit" // Cambiado a type="submit" para el formulario
                  className="btn btn-dark"
                  aria-label="Iniciar sesión"
                  disabled={authUsuario === 'EnProceso'} // Deshabilitar botón durante la carga
               >
                  {authUsuario === 'EnProceso' ? 'Iniciando...' : 'Iniciar sesión'}
               </button>
            </div>
         </form>
      </AuthLayout>
   );
};
