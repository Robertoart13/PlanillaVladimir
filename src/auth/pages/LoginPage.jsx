import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Custom hook to manage form state
 * Following Single Responsibility Principle (SRP) by extracting form logic
 * @param {Object} initialState - Initial state for the form
 * @returns {Array} - Form state and handlers
 */
const useFormState = (initialState) => {
   const [state, setState] = useState(initialState);

   // Handler for input changes
   const handleInputChange = ({ target }) => {
      const { name, value, type, checked } = target;
      setState(prevState => ({
         ...prevState,
         [name]: type === 'checkbox' ? checked : value
      }));
   };

   // Setter for specific form state properties
   const setFormState = (newState) => {
      setState(prevState => ({
         ...prevState,
         ...newState
      }));
   };

   return [state, handleInputChange, setFormState];
};

/**
 * Custom hook to manage password visibility
 * Following Single Responsibility Principle (SRP) by extracting UI state logic
 * @returns {Array} - Password visibility state and toggle function
 */
const usePasswordVisibility = () => {
   const [visible, setVisible] = useState(false);

   const toggle = () => setVisible(prev => !prev);

   return [visible, toggle];
};

/**
 * Custom hook to manage remembered email in localStorage
 * Following Single Responsibility Principle (SRP) by extracting storage logic
 * @returns {Object} - Methods to interact with localStorage
 */
const useRememberedEmail = () => {
   const storageKey = 'rememberedEmail';

   // Get email from localStorage
   const getEmail = () => localStorage.getItem(storageKey);

   // Save email to localStorage
   const saveEmail = (email) => {
      if (email) {
         localStorage.setItem(storageKey, email);
      } else {
         localStorage.removeItem(storageKey);
      }
   };

   return { getEmail, saveEmail };
};

/**
 * LoginPage Component
 * Handles user authentication through a login form with "remember me" functionality
 * @returns {JSX.Element} - LoginPage component
 */
export const LoginPage = () => {
   // Initialize custom hooks
   const [formState, handleInputChange, setFormState] = useFormState({
      email: '',
      password: '',
      rememberMe: false
   });
   const [showPassword, togglePasswordVisibility] = usePasswordVisibility();
   const { getEmail, saveEmail } = useRememberedEmail();

   const { email, password, rememberMe } = formState;

   // Load remembered email on initial render
   useEffect(() => {
      const savedEmail = getEmail();
      if (savedEmail) {
         setFormState({
            email: savedEmail,
            rememberMe: true
         });
      }
   }, []);

   /**
    * Handle form submission
    * Saves email to localStorage if "Remember me" is checked
    * @param {Event} e - Form submission event
    */
   const handleSubmit = (e) => {
      e.preventDefault();

      // TODO: Add authentication logic here

      // Handle "Remember me" functionality
      if (rememberMe) {
         saveEmail(email);
      } else {
         saveEmail(null);
      }
   };

   return (
      <>
         <div className="auth-main v1">
            <div className="auth-wrapper">
               <div className="auth-form">
                  <div className="card my-5">
                     <div className="card-body">
                        <div className="text-center">
                           <img src="/img/logo.svg" alt="Logo" className="img-fluid mb-4" width={200} />
                           <h4 className="f-w-800 mb-1">Iniciar sesión con tu correo electrónico</h4>
                           <br />
                        </div>
                        <form onSubmit={handleSubmit}>
                           <div className="mb-3">
                              <input
                                 type="email"
                                 className="form-control"
                                 id="floatingInput"
                                 placeholder="Correo electrónico"
                                 name="email"
                                 value={email}
                                 onChange={handleInputChange}
                                 aria-label="Email"
                              />
                           </div>
                           <div className="mb-3 position-relative">
                              <input
                                 type={showPassword ? "text" : "password"}
                                 className="form-control"
                                 id="floatingInput1"
                                 placeholder="Contraseña"
                                 name="password"
                                 value={password}
                                 onChange={handleInputChange}
                                 aria-label="Password"
                              />
                              <button
                                 type="button"
                                 className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary pe-3"
                                 onClick={togglePasswordVisibility}
                                 aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                              >
                                 <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                              </button>
                           </div>
                           <div className="d-flex mt-1 justify-content-between align-items-center">
                              <div className="form-check">
                                 <input
                                    className="form-check-input input-dark"
                                    type="checkbox"
                                    id="customCheckc1"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={handleInputChange}
                                    aria-label="Remember me checkbox"
                                 />
                                 <label className="form-check-label text-muted" htmlFor="customCheckc1">Recordarme</label>
                              </div>
                              <Link to="/auth/recover" className="text-decoration-none">
                                 <h6 className="f-w-400 mb-0">¿Olvidaste tu contraseña?</h6>
                              </Link>
                           </div>
                           <div className="d-grid mt-4">
                              <button
                                 type="submit"
                                 className="btn btn-dark"
                                 aria-label="Iniciar sesión"
                              >
                                 Iniciar sesión
                              </button>
                           </div>
                        </form>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </>
   );
};
