import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signup from "./Auth/Signup";
import Login from "./Auth/Login";
import Home from "./pages/Home";
import Robots from "./pages/Robots";
import Logs from "./pages/Logs";
import Sessions from "./pages/Sessions";
import Account from "./pages/Account";
import AiAnalysis from "./pages/AiAnalysis";

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
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:robotId"
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/account" element = {<Account/>} />
        <Route path="/ai" element ={<AiAnalysis/>} />
      </Routes>
    </BrowserRouter>
  );
}