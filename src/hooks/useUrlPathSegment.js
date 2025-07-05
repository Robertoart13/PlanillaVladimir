import { useLocation } from "react-router-dom";

/**
 * Hook personalizado para extraer segmentos específicos de la ruta URL actual
 * 
 * @param {number} indiceSegmento - El índice del segmento a extraer (basado en 0)
 * @returns {string|null} - El segmento de ruta solicitado o null si no está disponible
 * 
 * Ejemplo:
 * - Para la URL "/permisos/lista":
 *   - useSegmentoRutaUrl(0) devuelve "permisos"
 *   - useSegmentoRutaUrl(1) devuelve "lista"
 *   - useSegmentoRutaUrl(2) devuelve null 
 */
export const useSegmentoRutaUrl = (indiceSegmento = 0) => {
  const ubicacion = useLocation();
  
  // Elimina la barra inicial y divide la ruta en segmentos
  const segmentos = ubicacion.pathname.substring(1).split('/');
  
  // Devuelve el segmento solicitado o null si el índice está fuera de los límites
  return segmentos.length > indiceSegmento ? segmentos[indiceSegmento] : null;
};