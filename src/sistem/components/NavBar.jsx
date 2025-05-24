export const NavBar = ({ isSidebarOpen, isMobile }) => {
   return (
      <nav className={`pc-sidebar ${!isSidebarOpen ? "pc-sidebar-hide" : (isMobile ? "mob-sidebar-active" : "")}`}>
         <div className="navbar-wrapper">
            <div className="m-header">
               <a
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" , paddingTop: "8%" }}
                  href="/"
                  className="b-brand text-primary"
               >
        
                     <img
                        src="/img/1.png"
                        style={{ width: "75%", height: "auto"  }}
                        alt="Sistema de Planilla"
                        className="logo-lg"
                     />
          

               </a>
            </div>
            <div className={`navbar-content ${isSidebarOpen ? "pc-trigger simplebar-scrollable-y" : ""}`}>
               <ul className="pc-navbar">
                  <li className="pc-item pc-caption">
                     <label data-i18n="Navigation">Navigation</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  <li className="pc-item" >
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-home"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Inicio"
                        >
                           Inicio
                        </span>
                     </a>
                  </li>


                  <li className="pc-item pc-caption">
                     <label data-i18n="Navigation">Menus</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  <li className="pc-item" >
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-users"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Empleados"
                        >
                           Empleados
                        </span>
                     </a>
                  </li>
                  <li className="pc-item">
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-user-circle"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Clientes"
                        >
                           Clientes
                        </span>
                     </a>
                  </li>
                  <li className="pc-item">
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-file-alt"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Planillas"
                        >
                           Planillas
                        </span>
                     </a>
                  </li>
                  <li className="pc-item">
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-calendar-alt"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Calendario"
                        >
                           Calendario
                        </span>
                     </a>
                  </li>
               </ul>
               <div className="card pc-user-card" style={{  marginTop: "50px" }}>
                  <div className="card-body">
                     <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                           <img
                           
                              src="/img/users.png"
                              alt="user-image"
                              className="user-avtar wid-35 rounded-circle"
                           />
                        </div>
                        <div className="flex-grow-1 ms-3">
                           <div className="dropdown">
                              <a
                                 href="#"
                                 className="arrow-none dropdown-toggle"
                                 data-bs-toggle="dropdown"
                                 aria-expanded="false"
                                 data-bs-offset="0,20"
                              >
                                 <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 me-2">
                                       <h6 className="mb-0">Jonh Smith</h6>
                                       <small>Administrator</small>
                                    </div>
                                    <div className="flex-shrink-0">
                                       <div className="btn btn-icon btn-link-secondary avtar">
                                          <i className="ph-duotone ph-windows-logo"></i>
                                       </div>
                                    </div>
                                 </div>
                              </a>
                              <div className="dropdown-menu">
                                 <ul>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-user"></i>
                                          <span>My Account</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-gear"></i>
                                          <span>Settings</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-lock-key"></i>
                                          <span>Lock Screen</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-power"></i>
                                          <span>Cerrar Sesión</span>
                                       </a>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </nav>
   );
};
