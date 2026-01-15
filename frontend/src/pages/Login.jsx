import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config/api";
import { motion } from "framer-motion";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, form);
      login(res.data);
      toast.success("Welcome back!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error("Login error:", err.message);
      toast.error(err?.response?.data?.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <ToastContainer theme="dark" />

      {/* Left Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
        {/* Background blobs for left side */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <Link to="/" className="flex items-center gap-2 mb-8 group">
                <span className="text-2xl">📚</span>
                <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">StudyHub</span>
              </Link>
              <h1 className="text-4xl font-bold text-white mb-3">Welcome back</h1>
              <p className="text-slate-400 text-lg">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all duration-300 flex items-center justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-slate-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Sign up for free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Image/Decoration Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80')] bg-cover bg-center mix-blend-overlay opacity-50" />

        <div className="relative z-10 p-12 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl border border-white/20">
              <span className="text-4xl">🚀</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Master Your Learning Journey</h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              "Success is the sum of small efforts, repeated day in and day out. Start your productive journey today."
            </p>
          </motion.div>
        </div>

        {/* Decorative circles */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>
    </div>
  );
};

export default Login;
