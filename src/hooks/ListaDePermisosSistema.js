/**
 * @fileoverview Módulo que define los permisos del sistema y proporciona utilidades para su verificación.
 * Este archivo contiene constantes con los IDs de permisos y funciones para validar si un usuario 
 * tiene determinados permisos dentro de la aplicación.
 * 
 * @module ListaDePermisosSistema
 */

/**
 * Objeto que contiene todos los permisos del sistema relacionados con usuarios.
 * Cada propiedad representa un tipo de permiso con su respectivo ID numérico.
 * 
 * @constant {Object} PERMISOS_SISTEMA_MODAL_USUARIO
 */
export const PERMISOS_SISTEMA_MODAL_USUARIO = {
    LISTAR_PERMISOS: 1,     // Permiso para listar permisos
    EDITAR_PERMISOS: 2,     // Permiso para editar permisos
    VER_PERMISOS: 3,        // Permiso para ver permisos
    CREAR_PERMISOS: 4,      // Permiso para crear nuevos permisos
    VER_DETALLES: 33,      // Permiso para ver detalles de usuario
    DESACTIVAR_USUARIO: 34, // Permiso para desactivar cuentas de usuario
    ACTIVAR_USUARIO: 35,    // Permiso para activar cuentas de usuario
    VERIFICAR_USUARIO: 36,  // Permiso para verificar usuarios
    RESETEAR_PASSWORD: 37,  // Permiso para restablecer contraseñas
    RESETEAR_INTENTOS: 38,  // Permiso para resetear intentos fallidos de login
    ASIGNAR_PERMISOS: 39,   // Permiso para asignar permisos a usuarios
    EDITAR_USUARIO: 40,     // Permiso para editar información de usuario
    CREAR_USUARIO: 41,     // Permiso para crear un nuevo usuario
    
};

/**
 * Verifica si un usuario tiene un permiso específico basado en su ID.
 * 
 * @function tienePermiso
 * @param {Array|null} data - Array de objetos de permisos del usuario, cada uno con una propiedad id_permiso
 * @param {number} permisoId - ID del permiso a verificar
 * @returns {boolean} - Verdadero si el usuario tiene el permiso, falso en caso contrario
 * 
 * @example
 * // Verificar si el usuario puede editar otro usuario
 * if (tienePermiso(permisos, PERMISOS_SISTEMA_MODAL_USUARIO.EDITAR_USUARIO)) {
 *   // Permitir edición
 * }
 */
export const tienePermiso = (data, permisoId) => {
    // Verificación inicial: asegurar que data sea un array válido
    if (!data || !Array.isArray(data)) {
        return false;
    }

    // Verificar que el ID del permiso exista en los permisos válidos del sistema
    // para evitar verificar permisos inexistentes o mal referenciados
    const esPermisoValido = Object.values(PERMISOS_SISTEMA_MODAL_USUARIO).includes(permisoId);

    // Si el permiso no está registrado, mostrar advertencia y denegar acceso
    if (!esPermisoValido) {
        console.warn(`Permiso con ID ${permisoId} no está registrado como válido en el sistema`);
        return false;
    }

    // Buscar si el permiso está en la lista de permisos del usuario
    return data.some(permiso => permiso.id_permiso === permisoId);
};