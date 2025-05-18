import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";
import { useState } from "react";

export const SistemLayout = ({ children }) => {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
   };

   return (
        <>
          {/* navbar 
          sidebar
          main */}
          <NavBar isSidebarOpen={isSidebarOpen} />
          <SideBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className={`pc-container ${!isSidebarOpen ? "collapsed" : ""}`}>
            <div className="pc-content">
              {children}
            </div>
          </main>
        </>
   );
};
