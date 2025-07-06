

import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { SistemLayout } from "../../layout/SistemLayout";
import { CrearPlanilla } from "../../views/PlanillaViews/Crear/CrearPlanilla";
import { GenerarPlanilla } from "../../views/PlanillaViews/Generar/GenerarPlanilla";
import { PlanillaLista } from "../../views/PlanillaViews/lista/PlanillaLista";
import { EditarPlanilla } from "../../views/PlanillaViews/Editar/EditarPlanilla";

/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const PlanillaPage = () => {
   const accion = useSegmentoRutaUrl(1);


 
   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                 
                     <>
                        <div className="page-header">
                           <div className="page-block">
                              <div className="row align-items-center">
                                 {accion === "lista" && <PlanillaLista />}
                                 <div className="row align-items-center">
                                    {accion === "crear" && <CrearPlanilla />}
                                 </div>
                                 <div className="row align-items-center">
                                 {accion === "generar" && <GenerarPlanilla />}
                              </div>
                              <div className="row align-items-center">
                                 {accion === "editar" && <EditarPlanilla />}
                              </div>
                              </div>
                             
                           
                           </div>
                        </div>
                     </>
             
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};