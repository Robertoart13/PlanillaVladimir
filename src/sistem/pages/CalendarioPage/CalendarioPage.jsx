import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { VerCalendario } from "../../views/CalendarioViews/ver/VerCalendario";
import { CrearEvento } from "../../views/CalendarioViews/crear/CrearEvento";
import { EditarEvento } from "../../views/CalendarioViews/editar/EditarEvento";
import { ClanedarioPlanilla } from "../../views/CalendarioViews/planilla/ClanedarioPlanilla";



export const CalendarioPage = () => {
   const accion = useSegmentoRutaUrl(1);



   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">{accion === "ver" && <VerCalendario />}</div>
               <div className="row align-items-center">{accion === "crear" && <CrearEvento />}</div>
               <div className="row align-items-center">{accion === "editar" && <EditarEvento />}</div>
               <div className="row align-items-center">{accion === "planilla" && <ClanedarioPlanilla />}</div>
            </div>
         </div>
      </SistemLayout>
   );
};
