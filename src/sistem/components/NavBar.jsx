export const NavBar = ({ isSidebarOpen, isMobile }) => {
   return (
      <nav className={`pc-sidebar ${!isSidebarOpen ? "pc-sidebar-hide" : (isMobile ? "mob-sidebar-active" : "")}`}>
         <div className="navbar-wrapper">
            <div className="m-header">
               <a
                  href="../dashboard/index.html"
                  className="b-brand text-primary"
               >
                  <center>
                  <img
                     src="/img/2.png"
                     style={{ width: "100px", height: "100px" }}
                     alt="Sistema de Planilla"
                     className="logo-lg"
                  />
                  <span className="badge bg-brand-color-2 rounded-pill ms-1 theme-version">
                     v1.1.0
                  </span>
                  </center>
               </a>
            </div>
            <div className={`navbar-content ${isSidebarOpen ? "pc-trigger simplebar-scrollable-y" : ""}`}>
               <ul className="pc-navbar">
                  <li className="pc-item pc-caption">
                     <label data-i18n="Navigation">Navigation</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>

                  <li className="pc-item">
                     <a
                        href="../other/sample-page.html"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="ph-duotone ph-user-list"></i>  
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Sample Page"
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
                           <i className="ph-duotone ph-users"></i>  
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Sample Page"
                        >
                           Clientes
                        </span>
                     </a>
                  </li>
               </ul>
               <div className="card nav-action-card bg-gray-400">
                  <div
                     className="card-body"
                     style={{ backgroundImage: "url('../assets/images/layout/nav-card-bg.svg')" }}
                  >
                     <h5 className="text-dark">Sistema de Planilla</h5>
                     <p className="text-dark text-opacity-75">
                        Gestor de empleados y planillas y reportes
                     </p>
                  </div>
               </div>
            </div>
            <div className="card pc-user-card">
               <div className="card-body">
                  <div className="d-flex align-items-center">
                     <div className="flex-shrink-0">
                        <img
                           src="../assets/images/user/avatar-1.jpg"
                           alt="user-image"
                           className="user-avtar wid-45 rounded-circle"
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
      </nav>
   );
};
