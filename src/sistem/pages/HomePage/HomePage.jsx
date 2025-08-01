import { SistemLayout } from "../../layout/SistemLayout";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const HomePage = () => {
   const { user } = useSelector((state) => state.auth);
   return (
      <SistemLayout>
         <div className="page-header">
            <div className="page-block">
               <div className="row align-items-center">
                  {/* <div className="col-md-12">
                  <BreadcrumbNavigation />
               </div> */}
                  <div className="col-md-12">
                     <div className="row">
                        {/* --aqui va algo-- */}
                     </div>
                     <div className="page-header-title">
                        <h3 className="mb-0">¡Bienvenido, {user?.name || "Usuario"}!</h3>
                        <p className="text-muted mb-0">
                           Panel de control de implementación del sistema
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </SistemLayout>
   );
};
