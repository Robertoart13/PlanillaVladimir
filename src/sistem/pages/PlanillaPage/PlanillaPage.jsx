

import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { PlanillaLista } from "../../views/PlanillaViews/lista/PlanillaLista";
import { CrearPlanilla } from "../../views/PlanillaViews/Crear/CrearPlanilla";
import { EditarPlanilla } from "../../views/PlanillaViews/Editar/EditarPlanilla";



export const PlanillaPage = () => {
   const accion = useSegmentoRutaUrl(1);



   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">{accion === "lista" && <PlanillaLista />}</div>
               <div className="row align-items-center">{accion === "crear" && <CrearPlanilla />}</div>   
               <div className="row align-items-center">{accion === "editar" && <EditarPlanilla />}</div>
            </div>
         </div>
      </SistemLayout>
   );
};
