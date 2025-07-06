import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { NavLink, useLocation } from 'react-router-dom';
import { logout } from "../../store/auth/authThunk";
import { useState } from "react";
export const NavBar = ({ isSidebarOpen, isMobile }) => {
   const { user } = useSelector((state) => state.auth);
   const location = useLocation();
   const dispatch = useDispatch();
   const [openSubMenu, setOpenSubMenu] = useState(null);

   const getActiveClass = (path) => {
      const pathSegments = location.pathname.split('/');
      // Solo activar si es exactamente la primera ruta y no hay una segunda ruta específica
      return pathSegments.length === 2 && pathSegments[1] === path.replace('/', '') ? 'active' : '';
   };

   const getActiveClassSecondSegment = (path) => {
      const pathSegments = location.pathname.split('/');
      return pathSegments.length >= 3 && pathSegments[2] === path.replace('/', '') ? 'active' : '';
   };

   const getActiveClassForPlanilla = () => {
      const pathSegments = location.pathname.split('/');
      // Se activa si la primera ruta es 'planilla' y no estamos en 'generar'
      return pathSegments.length >= 2 && pathSegments[1] === 'planilla' && pathSegments[2] !== 'generar' ? 'active' : '';
   };

   const getActiveClassForEmpleados = () => {
      const pathSegments = location.pathname.split('/');
      // Se activa si la primera ruta es 'empleados'
      return pathSegments.length >= 2 && pathSegments[1] === 'empleados' ? 'active' : '';
   };

    // Maneja la apertura/cierre de submenús
    const handleSubMenuToggle = (menu) => {
      setOpenSubMenu((prev) => (prev === menu ? null : menu));
   };


   const handleLogout = () => {
      dispatch(logout({ mensaje: `Se ha cerrado la sesión.` }));
   };


   return (
      <nav
         className={`pc-sidebar ${!isSidebarOpen ? "pc-sidebar-hide" : isMobile ? "mob-sidebar-active" : ""
            }`}
      >
         <div className="navbar-wrapper">
            <div className="m-header">
               <a
                  style={{
                     display: "flex",
                     justifyContent: "center",
                     alignItems: "center",
                     paddingTop: "8%",
                  }}
                  href="/"
                  className="b-brand text-primary"
               >
                  <img
                     src="/img/1.png"
                     style={{ width: "75%", height: "auto" }}
                     alt="Sistema de Planilla"
                     className="logo-lg"
                  />
               </a>
            </div>
            <div
               className={`navbar-content ${isSidebarOpen ? "pc-trigger simplebar-scrollable-y" : ""
                  }`}
            >
               <ul className="pc-navbar">
                  <li className="pc-item pc-caption">
                     <label data-i18n="Navigation">Navigation</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  <li className={`pc-item ${getActiveClass('/')}`}>
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
                     <label data-i18n="Menus">Menus</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  <li className={`pc-item ${getActiveClassForEmpleados()}`}>
                     <NavLink
                        to="/empleados/lista"
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
                     </NavLink>
                  </li>
                  
                  <li className={`pc-item ${getActiveClassForPlanilla()}`}>
                     <NavLink
                        to="/planilla/lista"
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
                     </NavLink>
                  </li>

                  <li className={`pc-item ${getActiveClassSecondSegment('/generar')}`}>
                     <NavLink
                        to="/planilla/generar"
                        className="pc-link"
                     >
                        <span className="pc-micon">
                           <i className="fas fa-file-export"></i>
                        </span>
                        <span
                           className="pc-mtext"
                           data-i18n="Planillas"
                        >
                           Generar Planillas
                        </span>
                     </NavLink>
                  </li>

                                             {/* Submenú Acciones */}
                       <li
                          className={`pc-item pc-submenu ${
                             openSubMenu === "gestion-acciones" ? "open" : ""
                          }`}
                       >
                          <div
                             className="pc-link pc-submenu-toggle d-flex align-items-center justify-content-between"
                             style={{ cursor: "pointer", width: "100%" }}
                             onClick={() => handleSubMenuToggle("gestion-acciones")}
                          >
                             <span className="d-flex align-items-center">
                                <span className="pc-micon">
                                   <i className="fas fa-users-cog"></i>
                                </span>
                                <span
                                   className="pc-mtext"
                                   data-i18n="Acciones"
                                >
                                   Acciones
                                </span>
                             </span>
                             <span className="submenu-arrow ms-auto">
                                <i
                                   className={`fas fa-chevron-${
                                      openSubMenu === "gestion-acciones" ? "down" : "right"
                                   }`}
                                ></i>
                             </span>
                          </div>

                          {openSubMenu === "gestion-acciones" && (
                             <ul
                                className="pc-navbar"
                                style={{ paddingLeft: "10px", margin: 0 }}
                             >
                                <li className="pc-item">
                                   <NavLink
                                      to="/acciones/aumentos/lista"
                                      className="pc-link"
                                   >
                                      <span className="pc-micon">
                                         <i className="fas fa-folder-plus"></i>
                                      </span>
                                      <span
                                         className="pc-mtext"
                                         data-i18n="Aumentos"
                                      >
                                         Aumentos
                                      </span>
                                   </NavLink>
                                </li>
                                <li className="pc-item">
                                   <NavLink
                                       to="/acciones/compensacion-extra/lista"
                                       className="pc-link"
                                    >
                                       <span className="pc-micon">
                                          <i className="fas fa-user-clock"></i>
                                       </span>
                                       <span
                                          className="pc-mtext"
                                          data-i18n="Compensacion Extra"
                                       >
                                          Compensacion Extra
                                       </span>
                                    </NavLink>
                                </li>
                                <li className="pc-item">
                                    <NavLink
                                       to="/acciones/rebajo-compensacion/lista"
                                       className="pc-link"
                                    >
                                       <span className="pc-micon">
                                          <i className="fas fa-folder-minus"></i>
                                       </span>
                                       <span
                                          className="pc-mtext"
                                          data-i18n="Rebajo a Compensacion"
                                       >
                                          Rebajo a Compensacion
                                       </span>
                                    </NavLink>
                                </li>
                                <li className="pc-item">
                                    <NavLink
                                       to="/acciones/compensacion-metrica/lista"
                                       className="pc-link"
                                    >
                                       <span className="pc-micon">
                                          <i className="fas fa-plus-square"></i>
                                       </span>
                                       <span
                                          className="pc-mtext"
                                          data-i18n="Compensacion Metrica"
                                          style={{ textAlign: "center" }}
                                       >
                                          Compensacion por Metrica
                                       </span>
                                    </NavLink>
                                </li>

                                <li className="pc-item">
                                    <NavLink
                                       to="/acciones/dias-uso-personal/lista"
                                       className="pc-link"
                                    >
                                       <span className="pc-micon">
                                          <i className="fas fa-calendar-plus"></i>
                                       </span>
                                       <span
                                          className="pc-mtext"
                                          data-i18n="Compensacion Metrica"
                                          style={{ textAlign: "center" }}
                                       >
                                          Días de Uso Personal
                                       </span>
                                    </NavLink>
                                </li>
                              
                             </ul>
                          )}
                       </li>
                
               </ul>
               <div
                  className="card pc-user-card"
                  style={{ marginTop: "50px" }}
               >
                  <div className="card-body">
                     <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                           <div className="flex-shrink-0">
                              <Avatar
                                 className="user-avtar wid-35 rounded-circle"
                                 style={{ backgroundColor: "black", color: "white" }}
                              >
                                 {user.name
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")}
                              </Avatar>
                           </div>
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
                                    <div className="flex-grow-1 me-1">
                                       <h6 className="mb-0">  {(() => {
                                          const words = user.name.split(' ');
                                          if (words.length <= 2) return user.name;
                                          return words.slice(0, 2).join(' ') + '...';
                                       })()}
                                       </h6>
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
                                       <a className="pc-user-links" onClick={handleLogout}>
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
