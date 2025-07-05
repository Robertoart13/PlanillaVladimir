import { SistemLayout } from "../../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../../hooks/useUrlPathSegment";
import { PlanillaLista } from "../../../views/PlanillaViews/lista/PlanillaLista";
import { CrearPlanilla } from "../../../views/PlanillaViews/Crear/CrearPlanilla";
import { EditarPlanilla } from "../../../views/PlanillaViews/Editar/EditarPlanilla";
import { GenerarPlanilla } from "../../../views/PlanillaViews/Generar/GenerarPlanilla";
import { PlanillaListaAplicadas } from "../../../views/PlanillaViews/aplicadas/PlanillaListaAplicadas";
import { VisualizarPlanilla } from "../../../views/PlanillaViews/visualizar/visualizarPlanilla";

import { usePermiso } from "../../../../hooks/usePermisos";
import { TarjetaRow } from "../../../components/TarjetaRow/TarjetaRow";

/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const PlanillaPage = () => {
   const accion = useSegmentoRutaUrl(1);

   // Mapeo de permisos requeridos por acción de ruta
   const permisosPorAccion = {
      lista: 10,
      crear: 12,
      editar: 11,
      generar: 13,
      aplicadas: 14,
      visualizar: 15,
   };

   // Permiso requerido basado en la acción de la URL (por defecto 0)
   const permisoRequerido = permisosPorAccion[accion] || 0;
   const tienePermiso = usePermiso(permisoRequerido);

   // Mientras carga permisos, mostramos un indicador de carga
   if (tienePermiso === undefined) {
      return (
         <SistemLayout>
            <div
               className="d-flex justify-content-center align-items-center"
               style={{ height: "60vh" }}
            >
               <div
                  className="spinner-border text-primary"
                  role="status"
               >
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
                        texto="Lista de Planillas"
                        subtitulo="No tienes permiso para ver esta sección."
                     >
                        <div
                           className="alert alert-danger"
                           role="alert"
                        >
                   No tiene permiso para ver este contenido. Por favor,
                   contacta al administrador del sistema para solicitar acceso.
                        </div>
                     </TarjetaRow>
                  ) : (
                     <>
                        <div className="page-header">
                           <div className="page-block">
                              <div className="row align-items-center">
                                 {accion === "lista" && <PlanillaLista />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "crear" && <CrearPlanilla />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "editar" && <EditarPlanilla />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "generar" && <GenerarPlanilla />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "aplicadas" && <PlanillaListaAplicadas />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "visualizar" && <VisualizarPlanilla />}
                              </div>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
