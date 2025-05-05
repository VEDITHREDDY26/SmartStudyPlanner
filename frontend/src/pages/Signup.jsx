import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/signup", form);
      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex justify-center items-center gap-10 mt-7 h-[calc(100vh-2*5rem)] px-4 bg-gray-50">
      <ToastContainer />
      <img
        className="w-1/3 h-auto"
        src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
        alt="Signup Illustration"
      />

      <div className="flex flex-col justify-center items-center">
        <h1 className="text-2xl font-semibold text-slate-700 mb-2">Create an Account</h1>

        <form
          onSubmit={handleSubmit}
          className="shadow-2xl flex flex-col justify-center items-center border-2 rounded-lg w-96 gap-6 py-7 px-6 bg-white"
        >
          {/* Name */}
          <div className="flex flex-col items-start w-full gap-1">
            <label className="text-sm text-slate-600">Username (Optional)</label>
            <input
              className="p-2 outline-none border-2 rounded-lg w-full"
              type="text"
              name="name"
              placeholder="Enter username (optional)"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col items-start w-full gap-1">
            <label className="text-sm text-slate-600">Email</label>
            <input
              className="p-2 outline-none border-2 rounded-lg w-full"
              type="email"
              name="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col items-start w-full gap-1">
            <label className="text-sm text-slate-600">Password</label>
            <input
              className="p-2 outline-none border-2 rounded-lg w-full"
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Register button */}
          <button
            type="submit"
            className="shadow-lg hover:bg-blue-800 w-full h-9 bg-blue-500 rounded-full text-white font-semibold uppercase tracking-wider"
          >
            Register
          </button>

          {/* Login link */}
          <div className="mt-2 font-semibold text-sm text-slate-500 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-600 hover:underline hover:underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
