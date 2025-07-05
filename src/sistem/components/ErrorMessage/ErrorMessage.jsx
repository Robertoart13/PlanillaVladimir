import { Alert } from "@mui/material";

/** 
 * Componente para mostrar mensajes de error 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.error - Objeto de error
 * @param {string} props.message - Mensaje de error alternativo
 * @returns {JSX.Element} Alerta de error
 */
export const ErrorMessage = ({ error, message }) => (
    <Alert
      severity="error"
      sx={{ m: 2 }}
    >
      {error?.message || message || "Error desconocido"}
    </Alert>
  );
  