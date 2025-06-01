import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico.
 * @param {number} idPermiso - ID del permiso a verificar.
 * @returns {boolean} - Verdadero si el usuario tiene el permiso, falso de lo contrario.
 */
export const usePermiso = (idPermiso) => {
  // Obtener la lista de permisos del usuario desde el estado de Redux
  const { listaPermisos } = useSelector((state) => state.permisos);

  // Memoiza el resultado para evitar recálculos innecesarios
  return useMemo(() => {
    // Verificar si la lista de permisos existe y es un array
    if (!listaPermisos || !Array.isArray(listaPermisos)) {
      return false;
    }
    
    // Comprobar si el permiso específico existe en la lista de permisos del usuario
    return listaPermisos.some(permiso => permiso.id_perm_usuario_perm === idPermiso);
  }, [listaPermisos, idPermiso]);
};