import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../../store/auth/authThunk";
import { useEffect, useState } from "react";
import { Permisos_Thunks } from "../../store/Permisos/Permisos_Thunks";

/**
 * Componente NavBar
 * Barra lateral de navegación para el sistema.
 *
 * @param {Object} props
 * @param {boolean} props.isSidebarOpen - Indica si la barra lateral está abierta.
 * @param {boolean} props.isMobile - Indica si es vista móvil.
 */
export const NavBar = ({ isSidebarOpen, isMobile }) => {
   const { user } = useSelector((state) => state.auth);
   const { listaPermisos } = useSelector((state) => state.permisos);

   const location = useLocation();
   const dispatch = useDispatch();
   const [openSubMenu, setOpenSubMenu] = useState(null);

   useEffect(() => {
      const fetchPermisos = async () => {
         await dispatch(Permisos_Thunks("permisos/select"));
      };

      fetchPermisos();
   }, [dispatch]);

   /**
    * Verifica si el usuario tiene un permiso específico
    * @param {number} permisoId - ID del permiso a verificar
    * @returns {boolean} - true si tiene permiso, false si no
    */
   const tienePermiso = (permisoId) => {
      if (!listaPermisos || !Array.isArray(listaPermisos)) return false;
      return listaPermisos.some((permiso) => permiso.id_perm_usuario_perm === permisoId);
   };

   /**
    * Retorna la clase 'active' si la ruta coincide con la actual.
    * @param {string} path
    */
   const getActiveClass = (path) => {
      if (path === "/") {
         return location.pathname === "/" ? "active" : "";
      }
      return location.pathname === path ? "active" : "";
   };

   /**
    * Cierra la sesión del usuario.
    */
   const handleLogout = () => {
      dispatch(logout({ mensaje: "Se ha cerrado la sesión." }));
   };

   /**
    * Renderiza un ítem del menú de navegación.
    * @param {Object} item
    */
   const MenuItem = ({ to, icon, label, i18n }) => (
      <li className={`pc-item ${getActiveClass(to)}`}>
         <Link
            to={to}
            className="pc-link"
            onClick={() => {
               // Si el submenú está abierto y el menú no es parte de Gestión de Planillas, ciérralo
               if (openSubMenu === "gestion-planillas" && !to.startsWith("/planilla/")) {
                  setOpenSubMenu(null);
               }
               // Si el menú es /planilla/lista, también cierra el submenú
               if (openSubMenu === "gestion-planillas" && to === "/planilla/lista") {
                  setOpenSubMenu(null);
               }
            }}
         >
            <span className="pc-micon">
               <i className={icon}></i>
            </span>
            <span
               className="pc-mtext"
               data-i18n={i18n || label}
            >
               {label}
            </span>
         </Link>
      </li>
   );

   /**
    * Obtiene las iniciales del usuario.
    */
   const getUserInitials = () =>
      user?.name
         ?.split(" ")
         .slice(0, 2)
         .map((n) => n[0])
         .join("") || "";

   /**
    * Obtiene el nombre corto del usuario.
    */
   const getShortUserName = () => {
      const words = user?.name?.split(" ") || [];
      return words.length <= 2 ? user.name : words.slice(0, 2).join(" ") + "...";
   };

   // Maneja la apertura/cierre de submenús
   const handleSubMenuToggle = (menu) => {
      setOpenSubMenu((prev) => (prev === menu ? null : menu));
   };

   return (
      <nav
         className={`pc-sidebar ${
            !isSidebarOpen ? "pc-sidebar-hide" : isMobile ? "mob-sidebar-active" : ""
         }`}
      >
         <div className="navbar-wrapper">
            {/* Logo */}
            <div className="m-header">
               <Link
                  to="/"
                  className="b-brand text-primary"
                  style={{
                     display: "flex",
                     justifyContent: "center",
                     alignItems: "center",
                     paddingTop: "8%",
                  }}
               >
                  <img
                     src="/img/1.png"
                     alt="Sistema de Planilla"
                     className="logo-lg"
                     style={{ width: "75%", height: "auto" }}
                  />
               </Link>
            </div>

            <div
               className={`navbar-content ${
                  isSidebarOpen ? "pc-trigger simplebar-scrollable-y" : ""
               }`}
            >
               <ul className="pc-navbar">
                  {/* Sección de navegación */}
                  <li className="pc-item pc-caption">
                     <label data-i18n="Navigation">Navegación</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  <MenuItem
                     to="/"
                     icon="fas fa-home"
                     label="Inicio"
                     i18n="Inicio"
                  />
                  {/* Sección de menús */}{" "}
                  <li className="pc-item pc-caption">
                     <label data-i18n="Menus">Menús</label>
                     <i className="ph-duotone ph-gauge"></i>
                  </li>
                  {tienePermiso(1) && (
                     <MenuItem
                        to="/empleados/lista"
                        icon="fas fa-users"
                        label="Empleados"
                        i18n="Empleados"
                     />
                  )}
                  {tienePermiso(4) && (
                     <MenuItem
                        to="/empresas/lista"
                        icon="fas fa-toolbox"
                        label="Empresas"
                        i18n="Empresas"
                     />
                  )}
                  <MenuItem
                     to="/clientes/lista"
                     icon="fas fa-user-circle"
                     label="Clientes"
                     i18n="Clientes"
                  />
                  <MenuItem
                     to="/calendario/ver"
                     icon="fas fa-calendar-alt"
                     label="Mi Calendario"
                     i18n="Calendario"
                  />
                  <MenuItem
                     to="/planilla/lista"
                     icon="fas fa-file-alt"
                     label="Planillas"
                     i18n="Planillas"
                  />
                  {/* Submenú Gestión de Planillas */}
                  <li
                     className={`pc-item pc-submenu ${
                        openSubMenu === "gestion-planillas" ? "open" : ""
                     }`}
                  >
                     <div
                        className="pc-link pc-submenu-toggle d-flex align-items-center justify-content-between"
                        style={{ cursor: "pointer", width: "100%" }}
                        onClick={() => handleSubMenuToggle("gestion-planillas")}
                     >
                        <span className="d-flex align-items-center">
                           <span className="pc-micon">
                              <i className="fas fa-file-powerpoint"></i>
                           </span>
                           <span
                              className="pc-mtext"
                              data-i18n="Gestión de Planillas"
                           >
                              Gestión de Planillas
                           </span>
                        </span>
                        <span className="submenu-arrow ms-auto">
                           <i
                              className={`fas fa-chevron-${
                                 openSubMenu === "gestion-planillas" ? "down" : "right"
                              }`}
                           ></i>
                        </span>
                     </div>
                     {openSubMenu === "gestion-planillas" && (
                        <ul
                           className="pc-navbar"
                           style={{ paddingLeft: "10px", margin: 0 }}
                        >
                           <MenuItem
                              to="/planilla/generar"
                              icon="fas fa-plus-circle"
                              label="Generar Planilla"
                              i18n="Generar Planilla"
                           />
                           <MenuItem
                              to="/planilla/listaGeneradas"
                              icon="fas fa-list"
                              label="Planillas Aplicadas"
                              i18n="Planillas Aplicadas"
                           />
                        </ul>
                     )}
                  </li>
               </ul>

               {/* Tarjeta de usuario */}
               <div
                  className="card pc-user-card"
                  style={{ marginTop: "50px" }}
               >
                  <div className="card-body">
                     <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                           <Avatar
                              className="user-avtar wid-35 rounded-circle"
                              style={{ backgroundColor: "black", color: "white" }}
                           >
                              {getUserInitials()}
                           </Avatar>
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
                                       <h6 className="mb-0">{getShortUserName()}</h6>
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
                                          <span>Mi Cuenta</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-gear"></i>
                                          <span>Configuración</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a className="pc-user-links">
                                          <i className="ph-duotone ph-lock-key"></i>
                                          <span>Bloquear Pantalla</span>
                                       </a>
                                    </li>
                                    <li>
                                       <a
                                          className="pc-user-links"
                                          onClick={handleLogout}
                                       >
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
