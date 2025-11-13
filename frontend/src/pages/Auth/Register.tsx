// pages/Auth/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Building,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  register as registerUser,
  clearError,
} from "../../store/slices/authSlice";
import { registerSchema, type RegisterFormData } from "../../utils/validation";
// import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import LoadingSpinner from "../../components/ui/Spinner";

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setFocus,
    watch,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "participant",
    },
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log(data);
      
      await dispatch(registerUser(data)).unwrap();
    } catch (err) {
      // Error handled by Redux
      console.log("Error from register onsubmit fn()", err);
    }
  };

  const selectedRole = watch("role");

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-10 w-full">
      <motion.div
        className="max-w-md w-full space-y-8"
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
            Create your account
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Join EPlanner and start planning amazing events
          </motion.p>
        </div>

        <motion.div
          className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Enter your full name"
                />
                {!errors.name && isDirty && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </motion.div>
                )}
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </motion.p>
              )}
            </div>

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

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedRole === "participant"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    value="participant"
                    className="sr-only"
                  />
                  <Users
                    className={`h-6 w-6 mb-2 ${
                      selectedRole === "participant"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium text-sm">Participant</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Join events
                  </span>
                </label>

                <label
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedRole === "organizer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    {...register("role")}
                    type="radio"
                    value="organizer"
                    className="sr-only"
                  />
                  <Building
                    className={`h-6 w-6 mb-2 ${
                      selectedRole === "organizer"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="font-medium text-sm">Organizer</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Create events
                  </span>
                </label>
              </div>
              {errors.role && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.role.message}
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
                  placeholder="Create a password"
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors ${
                    errors.confirmPassword
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword.message}
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
                  : "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Creating account...
                </>
              ) : (
                "Create your account"
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

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
