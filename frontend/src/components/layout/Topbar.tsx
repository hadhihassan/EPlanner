import { FiMenu, FiLogOut, FiUser } from "react-icons/fi";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { motion } from "framer-motion";

interface Props {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Topbar = ({ collapsed, setCollapsed }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm sticky top-0 z-20"
    >
      {/* Left Section - Menu Button */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-xl bg-white border border-gray-200/80 hover:border-blue-300/50 shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600 lg:hidden"
        >
          <FiMenu size={20} />
        </motion.button>
        
        {/* Breadcrumb or Page Title */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:block"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-sm text-gray-500">
            Here's what's happening today
          </p>
        </motion.div>
      </div>

      {/* Right Section - User Info & Actions */}
      <div className="flex items-center gap-3">
        {/* User Info */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50/50 px-4 py-2.5 rounded-xl border border-gray-200/60 shadow-sm"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <FiUser className="text-white text-sm" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </motion.div>

        {/* Mobile User Badge */}
        <div className="sm:hidden flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <FiUser className="text-white text-xs" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.name?.split(' ')[0]}
          </span>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(logout())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-50 to-pink-50/80 border border-red-200/60 text-red-600 hover:from-red-100 hover:to-pink-100 hover:shadow-md hover:border-red-300/60 transition-all duration-200 shadow-sm group"
        >
          <FiLogOut 
            size={18} 
            className="group-hover:scale-110 transition-transform duration-200" 
          />
          <span className="font-medium text-sm hidden sm:block">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Topbar;