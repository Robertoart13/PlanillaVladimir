

import { useSegmentoRutaUrl } from "../../../hooks/useUrlPathSegment";
import { SistemLayout } from "../../layout/SistemLayout";
import { CrearAumento } from "../../views/AccionesViews/Aumentos/Crear/CrearAumento";
import { AumentosLista } from "../../views/AccionesViews/Aumentos/Lista/AumentosLista";
import { CrearBonificaciones } from "../../views/AccionesViews/Bonificaciones/Crear/CrearBonificaciones";
import { BonificacionesLista } from "../../views/AccionesViews/Bonificaciones/Lista/BonificacionesLista";
import { CrearDeduccion } from "../../views/AccionesViews/Deducciones/Crear/CrearDeduccion";
import { DeduccionesLista } from "../../views/AccionesViews/Deducciones/Lista/DeduccionesLista";
import { CrearHoraExtra } from "../../views/AccionesViews/Horas-extra/Crear/CrearHoraExtra";
import { HorasExtraLista } from "../../views/AccionesViews/Horas-extra/Lista/HorasExtraLista";

/**
 * Página para gestionar empresas.
 * Muestra la lista, creación o edición según la ruta y verifica permisos.
 */
export const AccionesPage = () => {
   const accion = useSegmentoRutaUrl(1);
   const accion2 = useSegmentoRutaUrl(2);


 
   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                 
                     <>
                        <div className="page-header">
                           <div className="page-block">
                            {accion === "aumentos" && (
                              <div className="row align-items-center">
                                 {accion2 === "lista" && <AumentosLista />}
                                 {accion2 === "crear" && <CrearAumento />}
                                
                              </div>
                           )}
                           {accion === "compensacion-extra" && (
                              <div className="row align-items-center">
                                 {accion2 === "lista" && <HorasExtraLista />}
                                 {accion2 === "crear" && <CrearHoraExtra />}
                              </div>
                           )}
                           {accion === "rebajo-compensacion" && (
                              <div className="row align-items-center">
                                 {accion2 === "lista" && <DeduccionesLista />}
                                 {accion2 === "crear" && <CrearDeduccion />}
                              </div>
                           )}
                           {accion === "compensacion-metrica" && (
                              <div className="row align-items-center">
                                 {accion2 === "lista" && <BonificacionesLista />}
                                 {accion2 === "crear" && <CrearBonificaciones />}
                              </div>
                           )}
                           </div>
                        </div>
                     </>
             
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};