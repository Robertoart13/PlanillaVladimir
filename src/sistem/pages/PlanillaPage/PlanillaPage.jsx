

import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { PlanillaLista } from "../../views/PlanillaViews/lista/PlanillaLista";
import { CrearPlanilla } from "../../views/PlanillaViews/Crear/CrearPlanilla";
import { EditarPlanilla } from "../../views/PlanillaViews/Editar/EditarPlanilla";
import { GenerarPlanilla } from "../../views/PlanillaViews/Generar/GenerarPlanilla";
import { PlanillaListaAplicadas } from "../../views/PlanillaViews/aplicadas/PlanillaListaAplicadas";
import { VisualizarPlanilla } from "../../views/PlanillaViews/visualizar/visualizarPlanilla";



export const PlanillaPage = () => {
   const accion = useSegmentoRutaUrl(1);



   return (
      <SistemLayout>
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
      </SistemLayout>
   );
};
