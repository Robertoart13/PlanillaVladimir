
import { useLocation } from "react-router-dom";
import { useMemo } from "react";  

/**
 * Hook personalizado para obtener valores de query parameters
 * @param {string} paramName - Nombre del parámetro a extraer
 * @returns {string|null} Valor del parámetro o null si no existe
 */
export const useQueryParam = (paramName) => {
  const location = useLocation();
  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(paramName);
  }, [location.search, paramName]);
};