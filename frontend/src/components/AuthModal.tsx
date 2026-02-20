import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "signup";
  setType: (type: "login" | "signup") => void;
  onLoginSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  type,
  setType,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('=== Auth Submit ===');
    console.log('Type:', type);
    console.log('Form data:', formData);

    try {
      if (type === "signup") {
        console.log('Sending registration request...');
        const res = await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          company_name: "",
        });

        console.log('Registration response:', res);

        if (res.success) {
          toast.success("Account created successfully!");
          onLoginSuccess(res.data?.user || res.user);
          onClose();
        } else {
          toast.error(res.error?.message || "Registration failed");
        }
      } else {
        // Login: use username field which contains email or username
        const loginPayload = {
          identifier: formData.username, // Login form uses 'username' field for email/username
          password: formData.password,
        };
        console.log('Sending login request with payload:', loginPayload);
        const res = await api.login(loginPayload);

        console.log('Login response:', res);

        if (res.success) {
          toast.success("Logged in successfully!");
          onLoginSuccess(res.data?.user || res.user);
          onClose();
        } else {
          toast.error(res.error?.message || "Login failed");
        }
      }
    } catch (error: any) {
      // Only show user-facing errors, not auth token errors
      if (error.name !== 'AuthenticationError' && error.code !== 'TOKEN_MISSING') {
        console.error('Auth error:', error);
      }
      toast.error(error.message || "Connection error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-void-light border border-white/10 p-8 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Animated Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold font-heading mb-2">
              {type === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400 mb-8">
              {type === "login"
                ? "Sign in to access your AI shopping insights."
                : "Join ShopSense AI and transform your shopping experience."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {type === "signup" && (
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-void border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={type === "login" ? "text" : "email"}
                  name={type === "login" ? "username" : "email"}
                  placeholder={
                    type === "login" ? "Username or Email" : "Email Address"
                  }
                  value={type === "login" ? formData.username : formData.email}
                  onChange={handleChange}
                  className="w-full bg-void border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-void border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  required
                />
              </div>

              {type === "signup" && (
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirm Password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full bg-void border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    required
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full glow-button py-3 rounded-lg font-semibold text-void flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {type === "login" ? "Sign In" : "Get Started"}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {type === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setType("signup")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setType("login")}
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
