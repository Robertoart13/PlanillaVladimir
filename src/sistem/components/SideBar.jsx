import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/auth/authThunk";
import Avatar from "@mui/material/Avatar";
export const SideBar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
   const { user } = useSelector((state) => state.auth);

   const dispatch = useDispatch();

   const handleLogout = () => {
      dispatch(logout());
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

                     <li className="dropdown pc-h-item">
                        <a
                           className="pc-head-link dropdown-toggle arrow-none me-0"
                           data-bs-toggle="dropdown"
                           href="#"
                           role="button"
                           aria-haspopup="false"
                           aria-expanded="false"
                        >
                           <i className="ph-duotone ph-bell"></i>
                           <span className="badge bg-success pc-h-badge">3</span>
                        </a>
                        <div className="dropdown-menu dropdown-notification dropdown-menu-end pc-h-dropdown">
                           <div className="dropdown-header d-flex align-items-center justify-content-between">
                              <h5 className="m-0">Notifications</h5>
                              <ul className="list-inline ms-auto mb-0">
                                 <li className="list-inline-item">
                                    <a
                                       href="../application/mail.html"
                                       className="avtar avtar-s btn-link-hover-primary"
                                    >
                                       <i className="ti ti-link f-18"></i>
                                    </a>
                                 </li>
                              </ul>
                           </div>
                           <div
                              className="dropdown-body text-wrap header-notification-scroll position-relative"
                              style={{ maxHeight: "calc(100vh - 235px)" }}
                           >
                              <ul className="list-group list-group-flush">
                                 <li className="list-group-item">
                                    <p className="text-span">Today</p>
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <img
                                             src="/img/users.png"
                                             alt="user-image"
                                             className="user-avtar avtar avtar-s"
                                          />
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">
                                                   Keefe Bond added new tags to 💪 Design system
                                                </h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">2 min ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             <br />
                                             <span className="text-truncate">
                                                Lorem Ipsum has been the industry's standard dummy
                                                text ever since the 1500s.
                                             </span>
                                          </p>
                                          <span className="badge bg-light-primary border border-primary me-1 mt-1">
                                             web design
                                          </span>
                                          <span className="badge bg-light-warning border border-warning me-1 mt-1">
                                             Dashobard
                                          </span>
                                          <span className="badge bg-light-success border border-success me-1 mt-1">
                                             Design System
                                          </span>
                                       </div>
                                    </div>
                                 </li>
                                 <li className="list-group-item">
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <div className="avtar avtar-s bg-light-primary">
                                             <i className="ph-duotone ph-chats-teardrop f-18"></i>
                                          </div>
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">Message</h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">1 hour ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             <br />
                                             <span className="text-truncate">
                                                Lorem Ipsum has been the industry's standard dummy
                                                text ever since the 1500s.
                                             </span>
                                          </p>
                                       </div>
                                    </div>
                                 </li>
                                 <li className="list-group-item">
                                    <p className="text-span">Yesterday</p>
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <div className="avtar avtar-s bg-light-danger">
                                             <i className="ph-duotone ph-user f-18"></i>
                                          </div>
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">
                                                   Challenge invitation
                                                </h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">12 hour ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             <br />
                                             <span className="text-truncate">
                                                <strong> Jonny aber </strong> invites to join the
                                                challenge
                                             </span>
                                          </p>
                                          <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">
                                             Decline
                                          </button>
                                          <button className="btn btn-sm rounded-pill btn-primary">
                                             Accept
                                          </button>
                                       </div>
                                    </div>
                                 </li>
                                 <li className="list-group-item">
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <div className="avtar avtar-s bg-light-info">
                                             <i className="ph-duotone ph-notebook f-18"></i>
                                          </div>
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">Forms</h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">2 hour ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             Lorem Ipsum is simply dummy text of the printing and
                                             typesetting industry. Lorem Ipsum has been the
                                             industry's standard dummy text ever since the 1500s.
                                          </p>
                                       </div>
                                    </div>
                                 </li>
                                 <li className="list-group-item">
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <img
                                             src="../assets/images/user/avatar-2.jpg"
                                             alt="user-image"
                                             className="user-avtar avtar avtar-s"
                                          />
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">
                                                   Keefe Bond added new tags to 💪 Design system
                                                </h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">2 min ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             <br />
                                             <span className="text-truncate">
                                                Lorem Ipsum has been the industry's standard dummy
                                                text ever since the 1500s.
                                             </span>
                                          </p>
                                          <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">
                                             Decline
                                          </button>
                                          <button className="btn btn-sm rounded-pill btn-primary">
                                             Accept
                                          </button>
                                       </div>
                                    </div>
                                 </li>
                                 <li className="list-group-item">
                                    <div className="d-flex">
                                       <div className="flex-shrink-0">
                                          <div className="avtar avtar-s bg-light-success">
                                             <i className="ph-duotone ph-shield-checkered f-18"></i>
                                          </div>
                                       </div>
                                       <div className="flex-grow-1 ms-3">
                                          <div className="d-flex">
                                             <div className="flex-grow-1 me-3 position-relative">
                                                <h6 className="mb-0 text-truncate">Security</h6>
                                             </div>
                                             <div className="flex-shrink-0">
                                                <span className="text-sm">5 hour ago</span>
                                             </div>
                                          </div>
                                          <p className="position-relative mt-1 mb-2">
                                             Lorem Ipsum is simply dummy text of the printing and
                                             typesetting industry. Lorem Ipsum has been the
                                             industry's standard dummy text ever since the 1500s.
                                          </p>
                                       </div>
                                    </div>
                                 </li>
                              </ul>
                           </div>
                           <div className="dropdown-footer">
                              <div className="row g-3">
                                 <div className="col-6">
                                    <div className="d-grid">
                                       <button className="btn btn-primary">Archive all</button>
                                    </div>
                                 </div>
                                 <div className="col-6">
                                    <div className="d-grid">
                                       <button className="btn btn-outline-secondary">
                                          Mark all as read
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
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
                                          href="#"
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
