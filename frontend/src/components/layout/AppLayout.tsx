import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen and auto-collapse sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Sidebar with proper mobile handling */}
      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <motion.div
        animate={{ 
          marginLeft: isMobile ? "0" : (collapsed ? "80px" : "260px")
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 25,
          duration: 0.3
        }}
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      >
        <Topbar 
          collapsed={collapsed} 
          setCollapsed={toggleSidebar} 
        />

        <main 
          className="p-4 sm:p-6 flex-1 overflow-auto bg-gray-50"
          onClick={closeSidebar}
        >
          <Outlet />
        </main>
      </motion.div>

      {/* Mobile Overlay - Only show when sidebar is open on mobile */}
      <AnimatePresence>
        {isMobile && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;