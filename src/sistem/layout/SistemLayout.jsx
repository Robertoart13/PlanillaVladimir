import { NavBar } from "../components/NavBar";
import { SideBar } from "../components/SideBar";
import { useState, useEffect, useRef } from "react";

export const SistemLayout = ({ children }) => {
   const [isMobile, setIsMobile] = useState(window.innerWidth <= 992);
   const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
   const sidebarRef = useRef(null);

   useEffect(() => {
      // Check if we're on mobile view initially
      setIsMobile(window.innerWidth <= 992);

      // Add resize listener
      const handleResize = () => {
         setIsMobile(window.innerWidth <= 992);
      };

      // Add click listener to close sidebar when clicking outside
      const handleClickOutside = (event) => {
         if (
            isMobile &&
            isSidebarOpen &&
            sidebarRef.current &&
            !sidebarRef.current.contains(event.target)
         ) {
            
            setIsSidebarOpen(false);
         }
      };

      window.addEventListener("resize", handleResize);
      document.addEventListener("mousedown", handleClickOutside);

      // Cleanup
      return () => {
         window.removeEventListener("resize", handleResize);
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isMobile, isSidebarOpen]);

   const toggleSidebar = (value) => {
      if (value === 2 && isMobile) {
         // Special case for mobile toggle
         setIsSidebarOpen(true);
      } else {
         setIsSidebarOpen(!isSidebarOpen);
      }
   };

   return (
      <>
         {/* navbar 
          sidebar
          main */}
         <div ref={sidebarRef}>
            <NavBar
               isSidebarOpen={isSidebarOpen}
               isMobile={isMobile}
            />
            <SideBar
               toggleSidebar={toggleSidebar}
               isSidebarOpen={isSidebarOpen}
               isMobile={isMobile}
            />
         </div>
         <main className={`pc-container ${!isSidebarOpen ? "collapsed" : ""}`}>
            <div className="pc-content">
               {children}
               
            </div>
         </main>
      </>
   );
};
