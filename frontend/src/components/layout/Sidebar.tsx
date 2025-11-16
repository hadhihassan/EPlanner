import { NavLink } from "react-router-dom";
import {
  FiCalendar,
  FiList,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from "react-icons/fi";
import { useAppSelector } from "../../store/hooks";
import { selectUnreadCount } from "../../store/slices/notificationsSlice";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isMobile?: boolean;
}

const Sidebar = ({ collapsed, setCollapsed, isMobile = false }: Props) => {
  const unreadCount = useAppSelector(selectUnreadCount);

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      isActive
        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200"
    }`;

  const iconVariants = {
    active: { scale: 1.1, rotate: 0 },
    inactive: { scale: 1, rotate: 0 },
  };

  const textVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -10 },
  };

  // Sidebar position based on device
  const sidebarVariants = {
    open: { 
      x: 0, 
      width: isMobile ? "260px" : "260px",
      boxShadow: isMobile ? "0 0 50px rgba(0,0,0,0.3)" : "0 0 20px rgba(0,0,0,0.1)"
    },
    closed: { 
      x: isMobile ? "-100%" : 0, 
      width: isMobile ? "260px" : "80px",
      boxShadow: isMobile ? "0 0 50px rgba(0,0,0,0.3)" : "0 0 20px rgba(0,0,0,0.1)"
    }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={collapsed ? "closed" : "open"}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.3 
        }}
        className="bg-white/95 backdrp-blur-xl border-r border-gray-200/60 fixed top-0 left-0 h-full z-50 lg:z-30"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-200/60 bg-gradient-to-r from-white to-gray-50/80">
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiHome className="text-white text-lg" />
                </div>
                <div className="">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    EPlanner
                  </h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Button - Show only when not mobile or when sidebar is open */}
          {(!isMobile || !collapsed) && (
            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(!collapsed)}
              className="p-2.5 rounded-xl border border-gray-200/80 hover:border-blue-300/50 bg-white/80 shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600"
            >
              {collapsed ? (
                <FiChevronRight size={18} />
              ) : (
                <FiChevronLeft size={18} />
              )}
            </motion.button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3 p-5">
          <NavLink 
            to="/dashboard" 
            className={linkClasses}
            onClick={() => isMobile && setCollapsed(true)}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  variants={iconVariants}
                  animate={isActive ? "active" : "inactive"}
                  transition={{ duration: 0.2 }}
                >
                  <FiList size={17} className="flex-shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      variants={textVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      Dashboard
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/calendar" 
            className={linkClasses}
            onClick={() => isMobile && setCollapsed(true)}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  variants={iconVariants}
                  animate={isActive ? "active" : "inactive"}
                  transition={{ duration: 0.2 }}
                >
                  <FiCalendar size={17} className="flex-shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      variants={textVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      Calendar
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>

          <NavLink 
            to="/notifications" 
            className={linkClasses}
            onClick={() => isMobile && setCollapsed(true)}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  variants={iconVariants}
                  animate={isActive ? "active" : "inactive"}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <FiBell size={17} className="flex-shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span
                      variants={textVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.2 }}
                      className="font-medium text-sm"
                    >
                      Notifications
                    </motion.span>
                  )}
                </AnimatePresence>

                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`ml-auto bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ${
                      (collapsed && !isMobile) ? "h-5 w-5 -mr-1" : "h-6 w-6 min-w-[24px]"
                    }`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        </nav>
      </motion.aside>
    </>
  );
};

export default Sidebar;