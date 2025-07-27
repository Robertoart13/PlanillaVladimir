import { SistemLayout } from "../../layout/SistemLayout";
import { useSelector } from "react-redux";
asasas
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
                        <div className="col-md-12 col-xxl-4">
                           <a href="">
                              <div className="card statistics-card-1">
                                 <div className="card-body">
                                    <img
                                       src="/img/banner1.svg"
                                       alt="img"
                                       className="img-fluid img-bg"
                                    />
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="avtar"
                                          style={{
                                             backgroundColor: "#000000",
                                             color: "#FFFFFF",
                                             marginRight: "1rem",
                                          }}
                                       >
                                          <i className="ti ti-user"></i>
                                       </div>
                                       <div>
                                          <p className="text-muted mb-0">Empleados Nuevos</p>
                                          <div className="d-flex align-items-end">
                                             {/* Si la cantidad es null o undefined, muestra el loader */}
                                             1
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </a>
                        </div>
                        <div className="col-md-12 col-xxl-4">
                           <a href="">
                              <div className="card statistics-card-1">
                                 <div className="card-body">
                                    <img
                                       src="/img/banner2.svg"
                                       alt="img"
                                       className="img-fluid img-bg"
                                    />
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="avtar"
                                          style={{
                                             backgroundColor: "#000000",
                                             color: "#FFFFFF",
                                             marginRight: "1rem",
                                          }}
                                       >
                                          <i className="ti ti-calendar"></i>
                                       </div>
                                       <div>
                                          <p className="text-muted mb-0">Eventos Pendientes</p>
                                          <div className="d-flex align-items-end">
                                             {/* Si la cantidad es null o undefined, muestra el loader */}
                                             1
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </a>
                        </div>
                        <div className="col-md-12 col-xxl-4">
                           <a href="">
                              <div className="card statistics-card-1">
                                 <div className="card-body">
                                    <img
                                       src="/img/banner2.svg"
                                       alt="img"
                                       className="img-fluid img-bg"
                                    />
                                    <div className="d-flex align-items-center">
                                       <div
                                          className="avtar"
                                          style={{
                                             backgroundColor: "#000000",
                                             color: "#FFFFFF",
                                             marginRight: "1rem",
                                          }}
                                       >
                                          <i className="fas fa-file-alt"></i>
                                       </div>
                                       <div>
                                          <p className="text-muted mb-0">Planillas</p>
                                          <div className="d-flex align-items-end">
                                             {/* Si la cantidad es null o undefined, muestra el loader */}
                                             1
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </a>
                        </div>
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
