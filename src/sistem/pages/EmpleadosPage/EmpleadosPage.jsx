

import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { EmpleadoLista } from "../../views/EmpleadoViews/lista/lista";
import { CrearEmpleado } from "../../views/EmpleadoViews/crear/crear";
import { EditarEmpleado } from "../../views/EmpleadoViews/editar/Editar";;




import { usePermiso } from "../../../hooks/usePermisos";
import { TarjetaRow } from "../../components/TarjetaRow/TarjetaRow";

/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const EmpleadosPage = () => {
   const accion = useSegmentoRutaUrl(1);

   // Mapeo de permisos requeridos por acción de ruta
   const permisosPorAccion = {
      lista: 4,
      crear: 6,
      editar: 5,
   };

   // Permiso requerido basado en la acción de la URL (por defecto 0)
   const permisoRequerido = permisosPorAccion[accion] || 0;
   const tienePermiso = usePermiso(permisoRequerido);

   // Mientras carga permisos, mostramos un indicador de carga
   if (tienePermiso === undefined) {
      return (
         <SistemLayout>
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
               <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando permisos...</span>
               </div>
            </div>
         </SistemLayout>
      );
   }

   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                  {!tienePermiso ? (
                     <TarjetaRow
                        texto="Lista de Empleados"
                        subtitulo="No tienes permiso para ver esta sección."
                     >
                        <div
                           className="alert alert-danger"
                           role="alert"
                        >
                           No tiene permiso para ver lista de empleados del sistema. Por favor, contacta al
                           administrador del sistema para solicitar acceso.
                        </div>
                     </TarjetaRow>
                  ) : (
                     <>
                         {accion === "lista" && <EmpleadoLista />}
                        {accion === "crear" && <CrearEmpleado />}
                        {accion === "editar" && <EditarEmpleado />}
                     </>
                  )}
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
