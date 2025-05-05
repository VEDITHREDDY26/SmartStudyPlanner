import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login,user } = useContext(AuthContext);

  useEffect(() => {
    if(user) {
      navigate("/dashboard"); // Redirect to dashboard if user is already logged in
    }
  }, [user, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      login(res.data); // saves token + user in context
      toast.success("Login successful!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err.message); // <-- Shows actual message
      console.error(err.stack); // <-- Optional: for full trace
      // res.status(500).json({ message: err.message || "Server Error" });
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center gap-10 mt-7 h-[calc(100vh-2*5rem)] px-4 bg-gray-50">
      <ToastContainer />
      <img
        className="w-1/3 h-auto"
        src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
        alt="Login Illustration"
      />

      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold text-slate-700">Login to Account</h1>

        <form
          onSubmit={handleSubmit}
          className="shadow-2xl flex flex-col justify-center mt-4 items-center border-2 rounded-lg w-96 gap-6 py-7 px-6 bg-white"
        >
          {/* Email */}
          <div className="flex flex-col items-start w-full gap-1">
            <label className="text-sm text-slate-600">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
              className="p-2 outline-none border-2 rounded-lg w-full"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col items-start w-full gap-1">
            <label className="text-sm text-slate-600">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
              className="p-2 outline-none border-2 rounded-lg w-full"
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center w-full text-sm font-semibold text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a
              className="text-blue-600 hover:text-blue-700 hover:underline hover:underline-offset-4"
              href="#"
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="shadow-lg hover:bg-blue-800 w-full h-9 bg-blue-500 rounded-full text-white font-semibold uppercase tracking-wider"
          >
            Login
          </button>

          {/* Register link */}
          <div className="mt-2 font-semibold text-sm text-slate-500 text-center">
            Don&apos;t have an account?{" "}
            <a
              className="text-pink-600 hover:underline hover:underline-offset-4"
              href="/signup"
            >
              Register
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
