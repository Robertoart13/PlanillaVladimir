import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { EmpresaLista } from "../../views/EmpresaViews/lista/lista";
import { CrearEmpresa } from "../../views/EmpresaViews/crear/crear";
import { EditarEmpresa } from "../../views/EmpresaViews/editar/Editar";

export const EmpresasPage = () => {
   const accion = useSegmentoRutaUrl(1);


   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                  {accion === "lista" && <EmpresaLista />}
                  {accion === "crear" && <CrearEmpresa />}
                  {accion === "editar" && <EditarEmpresa />}
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
