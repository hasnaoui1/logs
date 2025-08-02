import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./Auth/Signup";
import Login from "./Auth/Login";
import Home from "./pages/Home";
import Robots from "./pages/Robots";
import Logs from "./pages/Logs";
import RobotSimulator from "./components/RobotSimulator";
import Account from "./pages/Account";

export default function AppRoutes() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/robots"
          element={
            <ProtectedRoute>
              <Robots />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logs/:id"
          element={
            <ProtectedRoute>
              <Logs />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/account" element = {<Account/>} />
      </Routes>
    </BrowserRouter>
  );
}