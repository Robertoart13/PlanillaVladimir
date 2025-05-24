import axios from "axios";
import Cookies from "js-cookie";

/**********************************************
 * Environment Configuration
 **********************************************/

/**
 * Determines if the application is running in local development mode
 * @returns {boolean} - True if running locally, false otherwise
 */
const isLocalEnvironment = () => {
  return window.location.hostname === "localhost" || window.location.hostname === "localhost";
};




/**
 * Environment configuration object
 */
const ENV_CONFIG = {
  development: {
    apiBaseUrl: "http://localhost:7500/api/v1/",
    database: "pruebas",
  },
  production: {
    apiBaseUrl: "https://api.acuamic.com/api/v1/",
    database: "produccion",
  },
};

/**
 * Gets the current environment configuration
 * @returns {Object} - Environment configuration
 */
const getCurrentEnvConfig = () => {
  return isLocalEnvironment() ? ENV_CONFIG.development : ENV_CONFIG.production;
};

// Initialize environment-specific constants
const apiUrl = getCurrentEnvConfig().apiBaseUrl;
const apiUrlImg = apiUrl; // Same as apiUrl for now
const databaseuse = getCurrentEnvConfig().database;

/**********************************************
 * Authentication Configuration
 **********************************************/

/**
 * Gets the authentication token from storage
 * @returns {string|null} - The authentication token or null if not found
 */
const getAuthToken = () => {
  return Cookies.get("access_token"); // Obtiene el valor de la cookie 'access_token'
};

/**********************************************
 * Request Configuration
 **********************************************/

/**
 * Generates common request data for API calls
 * @returns {Object} - Object containing standard request parameters
 */
const getCommonRequestData = () => {
  return {
    token_access: "1234567890",
    database: databaseuse,
    sqlQuery: "",
    type: "",
  };
};

// Initialize common request data
const commonRequestData = getCommonRequestData();

/**********************************************
 * API Request Handlers
 **********************************************/

/**
 * Creates headers for API requests
 * @param {boolean} includeAuth - Whether to include authentication token
 * @returns {Object} - Headers object
 */
const createHeaders = (includeAuth = true) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Validates API response structure
 * @param {Object} response - The response object to validate
 * @returns {boolean} - True if valid, throws error if invalid
 */
const validateResponseStructure = (response) => {
  if (!response || typeof response !== "object") {

    const data = {
      respuesta: {
        status: 422,
        error: {
          details: "Invalid response format: Response is not an object",
        }
      }
    }

    return data;
  }

  // You can add more specific validations based on your API's expected structure
  // For example, checking for specific fields that should always be present
  return true;
};

/**
 * Handles standard API requests
 * @param {string} endpoint - API endpoint to call
 * @param {Object} requestData - Data to send with the request
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} - Response object with success status and data
 */
const fetchData = async (endpoint, requestData, requiresAuth = true) => {
  try {
    const url = `${apiUrl}${endpoint}`;
    
    // Create headers properly using the createHeaders function
    const headers = createHeaders(requiresAuth);
    
    // For debugging
    // console.log("Request URL:", url);
    // console.log("Request Headers:", headers);
    // console.log("Request Data:", requestData);

    const response = await axios.post(url, requestData, { headers });

    // Validate response structure
    validateResponseStructure(response.data);

    return { ok: true, data: response.data };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Handles file upload API requests
 * @param {string} endpoint - API endpoint to call
 * @param {Object} requestData - Data containing FormData object
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} - Response object with success status and data
 */
const fetchDataFile = async (endpoint, requestData, requiresAuth = true) => {
  try {
    const url = `${apiUrl}${endpoint}`;
    
    // Create proper headers for file upload
    const headers = {};
    
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    

    const response = await fetch(url, {
      method: "POST",
      body: requestData.formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    // Validate response structure
    validateResponseStructure(responseData);

    return { ok: true, data: responseData };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Handles API errors consistently
 * @param {Error} error - The error object
 * @returns {Object} - Standardized error response
 */
const handleApiError = (error) => {
  console.error("API Error:", error);

  // Check if error is related to response validation
  const isValidationError = error.message && error.message.includes("Invalid response format");

  return {
    ok: false,
    errorMessage: error.message || "An unknown error occurred",
    errorDetails: error.response?.data || null,
    status: error.response?.status || (isValidationError ? 422 : 500),
    isValidationError: isValidationError,
  };
};

/**********************************************
 * Module Exports
 **********************************************/

// For security reasons, don't export the secret key directly
const secretKey = "9e-@5Y4cHdQ)5wT!uL*BzR#e^T@6f2X!";

export { fetchData, fetchDataFile, commonRequestData, secretKey, apiUrlImg, isLocalEnvironment, getCurrentEnvConfig, getAuthToken, createHeaders, apiUrl };
