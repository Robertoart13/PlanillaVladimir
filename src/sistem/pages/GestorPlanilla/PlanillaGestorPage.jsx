import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";

import { SistemLayout } from "../../layout/SistemLayout";
import { GenerarAplicadas } from "../../views/PlanillaViews/GenerarAplicadas/GenerarAplicadas";
import { PLanillaEmpleados } from "../../views/PlanillaViews/GenerarAplicadas/PLanillaEmpleados";
import { PLanillasAplicadas } from "../../views/PlanillaViews/lista/PLanillasAplicadas";


/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const PlanillaGestorPage = () => {
   const accion = useSegmentoRutaUrl(1);
   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                  <div className="page-header">
                     <div className="page-block">
                        <div className="row align-items-center">
                           {accion === "planillas-aplicadas" && <GenerarAplicadas />}
                           {accion === "planillas-empleados" && <PLanillasAplicadas/>}   
                           {accion === "planillas-empleadosLista" && <PLanillaEmpleados/>}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
