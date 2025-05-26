import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { ClienteLista } from "../../views/ClienteViews/lista/Lista";
import { CrearCliente } from "../../views/ClienteViews/crear/Crear";
import { EditarCliente } from "../../views/ClienteViews/editar/Editar";

export const ClientesPage = () => {   
   const accion = useSegmentoRutaUrl(1);


   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                  {accion === "lista" && <ClienteLista />}
                  {accion === "crear" && <CrearCliente />}
                  {accion === "editar" && <EditarCliente />}
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
