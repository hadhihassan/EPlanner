// pages/Auth/Login.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login, clearError } from "../../store/slices/authSlice";
import { loginSchema, type LoginFormData } from "../../utils/validation";
// import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import LoadingSpinner from "../../components/ui/Spinner";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(login(data)).unwrap();
    } catch (err) {
      // Error handled by Redux
      console.log("eeror submting form in login", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        className="max-w-xl w-full space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">E</span>
            </div>
          </motion.div>
          <motion.h2
            className="mt-6 text-3xl font-extrabold text-gray-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome back
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Sign in to your EPlanner account
          </motion.p>
        </div>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                    errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Enter your email"
                />
                {!errors.email && isDirty && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                    errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!isValid || loading}
              whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: isValid && !loading ? 0.98 : 1 }}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                !isValid || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in to your account"
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
