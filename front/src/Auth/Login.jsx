import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import Signup from "./Signup";

function Login() {
  const navigate = useNavigate();

  const [userForm, setUserForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/login", userForm);
      localStorage.setItem("token", res.token);
      navigate("/");
    } catch (err) {
      console.error("login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col"
      >
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <label htmlFor="email" className="text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={userForm.email}
          onChange={handleChange}
          required
          placeholder="you@example.com"
          className="mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label htmlFor="password" className="text-sm mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={userForm.password}
          onChange={handleChange}
          required
          placeholder="••••••••"
          className="mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
