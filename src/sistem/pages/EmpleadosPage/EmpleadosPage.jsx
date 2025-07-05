

import { SistemLayout } from "../../layout/SistemLayout";
import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { EmpleadoLista } from "../../views/EmpleadoViews/lista/Lista";
import { CrearEmpleado } from "../../views/EmpleadoViews/crear/Crear";
// import { CrearEmpleado } from "../../views/EmpleadoViews/crear/crear";
// import { EditarEmpleado } from "../../views/EmpleadoViews/editar/Editar";;





/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const EmpleadosPage = () => {
   const accion = useSegmentoRutaUrl(1);



   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                 
                     <>
                         {accion === "lista" && <EmpleadoLista />}
                        {accion === "crear" && <CrearEmpleado />}
                        {/* {accion === "editar" && <EditarEmpleado />} */}
                     </>
              
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};