

import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { PlanillaLista } from "../../views/PlanillaViews/lista/PlanillaLista";




export const PlanillaPage = () => {
   const accion = useSegmentoRutaUrl(1);



   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">{accion === "lista" && <PlanillaLista />}</div>
               {/* <div className="row align-items-center">{accion === "crear" && <CrearEvento />}</div>
               <div className="row align-items-center">{accion === "editar" && <EditarEvento />}</div> */}
            </div>
         </div>
      </SistemLayout>
   );
};
