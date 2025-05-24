export const SideBar = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
    return (
        <>
            <header className="pc-header">
                <div className="header-wrapper">
                    <div className="me-auto pc-mob-drp">
                        <ul className="list-unstyled">
                            <li className="pc-h-item pc-sidebar-collapse">
                                <a href="#" className="pc-head-link ms-0" id="sidebar-hide" onClick={(e) => {
                                    e.preventDefault();
                                    toggleSidebar(1);
                                }}>
                                    <i className="ti ti-menu-2"></i>
                                </a>
                            </li>
                            <li className="pc-h-item pc-sidebar-popup">
                                <a href="#" className="pc-head-link ms-0" id="mobile-collapse" onClick={(e) => {
                                    e.preventDefault();
                                    toggleSidebar(2);
                                }}>
                                    <i className="ti ti-menu-2"></i>
                                </a>
                            </li>
                            <li className="dropdown pc-h-item d-inline-flex d-md-none">
                                <a
                                    className="pc-head-link dropdown-toggle arrow-none m-0"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="false"
                                    aria-expanded="false"
                                >
                                    <i className="ph-duotone ph-magnifying-glass"></i>
                                </a>
                                <div className="dropdown-menu pc-h-dropdown drp-search">
                                    <form className="px-3">
                                        <div className="mb-0 d-flex align-items-center">
                                            <input type="search" className="form-control border-0 shadow-none" placeholder="Search..." />
                                            <button className="btn btn-light-secondary btn-search">Search</button>
                                        </div>
                                    </form>
                                </div>
                            </li>
                            <li className="pc-h-item d-none d-md-inline-flex">
                                <form className="form-search">
                                    <i className="ph-duotone ph-magnifying-glass icon-search"></i>
                                    <input type="search" className="form-control" placeholder="Search..." />

                                    <button className="btn btn-search" style={{padding: 0}}   ><kbd>ctrl+k</kbd></button>    
                                </form>
                            </li>
                        </ul>
                    </div>
                    <div className="ms-auto">
                        <ul className="list-unstyled">
                            <li className="dropdown pc-h-item d-none d-md-inline-flex">
                                <a
                                    className="pc-head-link dropdown-toggle arrow-none me-0"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="false"
                                    aria-expanded="false"
                                >
                                    <i className="ph-duotone ph-circles-four"></i>
                                </a>
                                <div className="dropdown-menu dropdown-qta dropdown-menu-end pc-h-dropdown">
                                    <div className="overflow-hidden">
                                        <div className="qta-links m-n1">
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-shopping-cart"></i>
                                                <span>E-commerce</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-lifebuoy"></i>
                                                <span>Helpdesk</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-scroll"></i>
                                                <span>Invoice</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-books"></i>
                                                <span>Online Courses</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-envelope-open"></i>
                                                <span>Mail</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-identification-badge"></i>
                                                <span>Membership</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-chats-circle"></i>
                                                <span>Chat</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-currency-circle-dollar"></i>
                                                <span>Plans</span>
                                            </a>
                                            <a href="#!" className="dropdown-item">
                                                <i className="ph-duotone ph-user-circle"></i>
                                                <span>Users</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            <li className="dropdown pc-h-item d-none d-md-inline-flex">
                                <a
                                    className="pc-head-link dropdown-toggle arrow-none me-0"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="false"
                                    aria-expanded="false"
                                >
                                    <i className="ph-duotone ph-sun-dim"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-moon"></i>
                                        <span>Dark</span>
                                    </a>
                                    <a href="#!" className="dropdown-item" >
                                        <i className="ph-duotone ph-sun-dim"></i>
                                        <span>Light</span>
                                    </a>
                                    <a href="#!" className="dropdown-item" >
                                        <i className="ph-duotone ph-cpu"></i>
                                        <span>Default</span>
                                    </a>
                                </div>
                            </li>
                            <li className="dropdown pc-h-item d-none d-md-inline-flex">
                                <a
                                    className="pc-head-link head-link-primary dropdown-toggle arrow-none me-0"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="false"
                                    aria-expanded="false"
                                >
                                    <i className="ph-duotone ph-translate"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end pc-h-dropdown lng-dropdown">
                                    <a href="#!" className="dropdown-item" data-lng="en">
                                        <span>
                                            English
                                            <small>(UK)</small>
                                        </span>
                                    </a>
                                    <a href="#!" className="dropdown-item" data-lng="fr">
                                        <span>
                                            français
                                            <small>(French)</small>
                                        </span>
                                    </a>
                                    <a href="#!" className="dropdown-item" data-lng="ro">
                                        <span>
                                            Română
                                            <small>(Romanian)</small>
                                        </span>
                                    </a>
                                    <a href="#!" className="dropdown-item" data-lng="cn">
                                        <span>
                                            中国人
                                            <small>(Chinese)</small>
                                        </span>
                                    </a>
                                </div>
                            </li>
                            <li className="pc-h-item">
                                <a className="pc-head-link pct-c-btn" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_pc_layout">
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
                                    <i className="ph-duotone ph-diamonds-four"></i>
                                </a>
                                <div className="dropdown-menu dropdown-menu-end pc-h-dropdown">
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-user"></i>
                                        <span>My Account</span>
                                    </a>
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-gear"></i>
                                        <span>Settings</span>
                                    </a>
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-lifebuoy"></i>
                                        <span>Support</span>
                                    </a>
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-lock-key"></i>
                                        <span>Lock Screen</span>
                                    </a>
                                    <a href="#!" className="dropdown-item">
                                        <i className="ph-duotone ph-power"></i>
                                        <span>Logout</span>
                                    </a>
                                </div>
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
                                                <a href="../application/mail.html" className="avtar avtar-s btn-link-hover-primary">
                                                    <i className="ti ti-link f-18"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="dropdown-body text-wrap header-notification-scroll position-relative" style={{maxHeight: "calc(100vh - 235px)"}}>   
                                        <ul className="list-group list-group-flush">
                                            <li className="list-group-item">
                                                <p className="text-span">Today</p>
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0">
                                                        <img src="../assets/images/user/avatar-2.jpg" alt="user-image" className="user-avtar avtar avtar-s" />
                                                    </div>
                                                    <div className="flex-grow-1 ms-3">
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1 me-3 position-relative">
                                                                <h6 className="mb-0 text-truncate">Keefe Bond added new tags to 💪 Design system</h6>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <span className="text-sm">2 min ago</span>
                                                            </div>
                                                        </div>
                                                        <p className="position-relative mt-1 mb-2"
                                                        ><br /><span className="text-truncate"
                                                        >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                                            ></p
                                                        >
                                                        <span className="badge bg-light-primary border border-primary me-1 mt-1">web design</span>
                                                        <span className="badge bg-light-warning border border-warning me-1 mt-1">Dashobard</span>
                                                        <span className="badge bg-light-success border border-success me-1 mt-1">Design System</span>
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
                                                        <p className="position-relative mt-1 mb-2"
                                                        ><br /><span className="text-truncate"
                                                        >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                                            ></p
                                                        >
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
                                                                <h6 className="mb-0 text-truncate">Challenge invitation</h6>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <span className="text-sm">12 hour ago</span>
                                                            </div>
                                                        </div>
                                                        <p className="position-relative mt-1 mb-2"
                                                        ><br /><span className="text-truncate"><strong> Jonny aber </strong> invites to join the challenge</span></p
                                                        >
                                                        <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">Decline</button>
                                                        <button className="btn btn-sm rounded-pill btn-primary">Accept</button>
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
                                                        <p className="position-relative mt-1 mb-2"
                                                        >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                                                            dummy text ever since the 1500s.</p
                                                        >
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="list-group-item">
                                                <div className="d-flex">
                                                    <div className="flex-shrink-0">
                                                        <img src="../assets/images/user/avatar-2.jpg" alt="user-image" className="user-avtar avtar avtar-s" />
                                                    </div>
                                                    <div className="flex-grow-1 ms-3">
                                                        <div className="d-flex">
                                                            <div className="flex-grow-1 me-3 position-relative">
                                                                <h6 className="mb-0 text-truncate">Keefe Bond added new tags to 💪 Design system</h6>
                                                            </div>
                                                            <div className="flex-shrink-0">
                                                                <span className="text-sm">2 min ago</span>
                                                            </div>
                                                        </div>
                                                        <p className="position-relative mt-1 mb-2"
                                                        ><br /><span className="text-truncate"
                                                        >Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</span
                                                            ></p
                                                        >
                                                        <button className="btn btn-sm rounded-pill btn-outline-secondary me-2">Decline</button>
                                                        <button className="btn btn-sm rounded-pill btn-primary">Accept</button>
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
                                                        <p className="position-relative mt-1 mb-2"
                                                        >Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                                                            dummy text ever since the 1500s.</p
                                                        >
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="dropdown-footer">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="d-grid"><button className="btn btn-primary">Archive all</button></div>
                                            </div>
                                            <div className="col-6">
                                                <div className="d-grid"><button className="btn btn-outline-secondary">Mark all as read</button></div>
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
                                    <img src="../assets/images/user/avatar-2.jpg" alt="user-image" className="user-avtar" />
                                </a>
                                <div className="dropdown-menu dropdown-user-profile dropdown-menu-end pc-h-dropdown">
                                    <div className="dropdown-header d-flex align-items-center justify-content-between">
                                        <h5 className="m-0">Profile</h5>
                                    </div>
                                    <div className="dropdown-body">
                                        <div className="profile-notification-scroll position-relative" style={{maxHeight: "calc(100vh - 225px)"}}> 
                                            <ul className="list-group list-group-flush w-100">
                                                <li className="list-group-item">
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-shrink-0">
                                                            <img src="../assets/images/user/avatar-2.jpg" alt="user-image" className="wid-50 rounded-circle" />
                                                        </div>
                                                        <div className="flex-grow-1 mx-3">
                                                            <h5 className="mb-0">Carson Darrin</h5>
                                                            <a className="link-primary" href="mailto:carson.darrin@company.io">carson.darrin@company.io</a>
                                                        </div>
                                                        <span className="badge bg-primary">PRO</span>
                                                    </div>
                                                </li>
                                                <li className="list-group-item">
                                                    <a href="#" className="dropdown-item">
                                                        <span className="d-flex align-items-center">
                                                            <i className="ph-duotone ph-key"></i>
                                                            <span>Change password</span>
                                                        </span>
                                                    </a>
                                                    
                                                </li>
                                                <li className="list-group-item">
                                                    <a href="#" className="dropdown-item">
                                                        <span className="d-flex align-items-center">
                                                            <i className="ph-duotone ph-user-circle"></i>
                                                            <span>Edit profile</span>
                                                        </span>
                                                    </a>
                                                    
                                                    <a href="#" className="dropdown-item">
                                                        <span className="d-flex align-items-center">
                                                            <i className="ph-duotone ph-bell"></i>
                                                            <span>Notifications</span>
                                                        </span>
                                                    </a>
                                                    <a href="#" className="dropdown-item">
                                                        <span className="d-flex align-items-center">
                                                            <i className="ph-duotone ph-gear-six"></i>
                                                            <span>Settings</span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li className="list-group-item">
                                                    
                                                    <a href="#" className="dropdown-item">
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
    )
}

