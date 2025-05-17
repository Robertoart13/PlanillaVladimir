/**
 * Verifica si un usuario tiene el permiso necesario para consultar información de permisos.
 * 
 * Esta función evalúa si el usuario autenticado tiene un permiso específico dentro 
 * de su lista de permisos asignados. Utiliza la comparación entre el ID del usuario 
 * y el ID del permiso requerido para determinar si el usuario tiene acceso.
 * 
 * @param {Array} permisos - Lista de objetos de permisos asignados al usuario. Cada objeto 
 *                            debe contener las propiedades `id_usuario` e `id_permiso`.
 * @param {number} idUsuario - El ID del usuario autenticado que se verifica.
 * @param {number} consultarPermiso - El ID del permiso que se está verificando.
 * 
 * @returns {boolean} Retorna `true` si el usuario tiene el permiso requerido, 
 *                   `false` en caso contrario.
 */
export const tienePermisoRequerido = (permisos, idUsuario, consultarPermiso) => {
   // Convertir explícitamente a número
   const userId = Number(idUsuario);
   const requiredPermission = Number(consultarPermiso);
   

   return permisos.some(permiso => {
      const permisoUserId = Number(permiso.id_usuario);
      const permisoId = Number(permiso.id_permiso);
      
      return permisoUserId === userId && 
             permisoId === requiredPermission;
   });
};
