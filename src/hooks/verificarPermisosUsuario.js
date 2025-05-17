
import Usuario_ValidarPermisos from "../modules/02-usuarios/Usuario_ValidarPermisos.js";
import { crearRespuestaAccesoDenegado } from "./crearRespuestaAccesoDenegado.js";
import { tienePermisoRequerido } from "./tienePermisoRequerido.js";


/**
 * Verifica si el usuario tiene permisos para ver la lista de permisos del sistema.
 *
 * @param {number} idUsuario - ID del usuario autenticado.
 * @param {Object} database - Conexión a la base de datos.
 * @returns {Promise<Object|null>} - Retorna un objeto de error si el usuario no tiene permisos, o `null` si la validación es exitosa.
 */
export const verificarPermisosUsuario = async (idUsuario, database,idPermiso , Mensaje ) => {
    // Consultar los permisos del usuario en la base de datos
    const resultadoPermisos = await Usuario_ValidarPermisos.obtenerPermisoPorUsuario(
       idUsuario,
       database
    );

    // Verificar si hubo un error al obtener los permisos del usuario
    if (resultadoPermisos.respuesta?.status === 404 || resultadoPermisos?.status === 500) {
       return resultadoPermisos; // Retorna el error recibido si no se encontraron permisos o hubo un fallo en la consulta
    }

    // Comprobar si el usuario tiene el permiso requerido
    if (!tienePermisoRequerido(resultadoPermisos.permisos, idUsuario, idPermiso)) {
       return crearRespuestaAccesoDenegado(
          "Acceso denegado",
          Mensaje
          
       );
    }

    // Si pasa todas las validaciones, retorna null (sin errores)
    return null;
};
