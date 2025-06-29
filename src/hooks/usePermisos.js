import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personalizado para verificar si el usuario tiene un permiso específico.
 * @param {number} idPermiso - ID del permiso a verificar.
 * @returns {boolean|undefined} - Verdadero si el usuario tiene el permiso, falso si no, undefined si aún cargando.
 */
export const usePermiso = (idPermiso) => {
  // Obtener la lista de permisos y estado de carga desde el estado de Redux
  const { listaPermisos, loading } = useSelector((state) => state.permisos);
  console.log(listaPermisos);  

  // Memoiza el resultado para evitar recálculos innecesarios
  return useMemo(() => {
    // Si aún está cargando permisos, devolvemos undefined
    if (loading) {
      return undefined;
    }
    // Verificar si la lista de permisos existe y es un array
    if (!listaPermisos || !Array.isArray(listaPermisos)) {
      return false;
    }
    
    // Comprobar si el permiso específico existe en la lista de permisos del usuario
    return listaPermisos.some(permiso => permiso.id_perm_usuario_perm === idPermiso);
  }, [listaPermisos, idPermiso, loading]);
};