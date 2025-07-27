import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth/authThunk";
import Avatar from "@mui/material/Avatar";
export const SideBar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
   const { user } = useSelector((state) => state.auth);

   const dispatch = useDispatch();

   const handleLogout = () => {
      dispatch(logout({ mensaje: `Se ha cerrado la sesión.` }));
   };
   return (
      <>
         <header className="pc-header">
            <div className="header-wrapper">
               <div className="me-auto pc-mob-drp">
                  <ul className="list-unstyled">
                     <li className="pc-h-item pc-sidebar-collapse">
                        <a
                           href="#"
                           className="pc-head-link ms-0"
                           id="sidebar-hide"
                           onClick={(e) => {
                              e.preventDefault();
                              toggleSidebar(1);
                           }}
                        >
                           <i className="ti ti-menu-2"></i>
                        </a>
                     </li>
                     <li className="pc-h-item pc-sidebar-popup">
                        <a
                           href="#"
                           className="pc-head-link ms-0"
                           id="mobile-collapse"
                           onClick={(e) => {
                              e.preventDefault();
                              toggleSidebar(2);
                           }}
                        >
                           <i className="ti ti-menu-2"></i>
                        </a>
                     </li>
                  </ul>
               </div>
               <div className="ms-auto">
                  <ul className="list-unstyled">
                     <li className="pc-h-item">
                        <a
                           className="pc-head-link pct-c-btn"
                           href="#"
                           data-bs-toggle="offcanvas"
                           data-bs-target="#offcanvas_pc_layout"
                        >
                           <i className="ph-duotone ph-gear-six"></i>
                        </a>
                     </li>

                     
                     <li className="dropdown pc-h-item header-user-profile">
                        <a
                           className="pc-head-link dropdown-toggle arrow-none me-0"
                           data-bs-toggle="dropdown"
                           href="#"
                           role="button"
                           aria-haspopup="false"
                           data-bs-auto-close="outside"
                           aria-expanded="false"
                        >
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
                        </a>
                        <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                           <div className="dropdown-header d-flex align-items-center justify-content-between">
                              <h5 className="m-0">Profile</h5>
                           </div>
                           <div className="dropdown-body">
                              <div
                                 className="profile-notification-scroll position-relative"
                                 style={{ maxHeight: "calc(100vh - 225px)" }}
                              >
                                 <ul className="list-group list-group-flush w-100">
                                    <li className="list-group-item">
                                       <div className="d-flex align-items-center">
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
                                          <div className="flex-grow-1 mx-3">
                                             <h5 className="mb-0">{user.name}</h5>
                                             <a
                                                className="link-primary"
                                                href="mailto:carson.darrin@company.io"
                                             >
                                                {user.email}
                                             </a>
                                          </div>
                                          <span className="badge bg-primary">PRO</span>
                                       </div>
                                    </li>
                                    <li className="list-group-item">
                                       <a
                                          href="#"
                                          className="dropdown-item"
                                       >
                                          <span className="d-flex align-items-center">
                                             <i className="ph-duotone ph-key"></i>
                                             <span>Change password</span>
                                          </span>
                                       </a>
                                    </li>
                                    <li className="list-group-item">
                                       <a
                                          href="#"
                                          className="dropdown-item"
                                       >
                                          <span className="d-flex align-items-center">
                                             <i className="ph-duotone ph-user-circle"></i>
                                             <span>Edit profile</span>
                                          </span>
                                       </a>

                                       <a
                                          href="#"
                                          className="dropdown-item"
                                       >
                                          <span className="d-flex align-items-center">
                                             <i className="ph-duotone ph-bell"></i>
                                             <span>Notifications</span>
                                          </span>
                                       </a>
                                       <a
                                          href="#"
                                          className="dropdown-item"
                                       >
                                          <span className="d-flex align-items-center">
                                             <i className="ph-duotone ph-gear-six"></i>
                                             <span>Settings</span>
                                          </span>
                                       </a>
                                    </li>
                                    <li className="list-group-item">
                                       <a
                                          onClick={handleLogout}
                                          className="dropdown-item"
                                       >
                                          <span className="d-flex align-items-center">
                                             <i className="ph-duotone ph-power"></i>
                                             <span>Logout</span>
                                          </span>
                                       </a>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
         </header>
      </>
   );
};
