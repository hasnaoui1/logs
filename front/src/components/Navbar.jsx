import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

function Navbar() {
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Robots", path: "/robots" },
    { label: "Sessions", path: "/sessions" },
    { label: "Ai Analysis", path: "/ai" },
    { label: "Settings", path: "/settings" },
  ];

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications from backend
  const fetchNotifications = () => {
    const token = localStorage.getItem("token");
    axiosInstance
      .get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((data) => setNotifications(data.filter((n) => !n.read)))
      .catch((err) => console.log(err.message));
  };

  // Mark all notifications as read
  const clearAllNotifications = async () => {
    try {
      await axiosInstance.put("/notifications/mark-all-read");
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err.message);
    }
  };

  // Mark a single notification as read
  const markRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Robot Logs</span>
          </div>

          {/* Navigation Items */}
          <ul className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) =>
              item.label === "Settings" ? (
                <li key={index} className="relative" ref={dropdownRef}>
                  <button
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200 font-medium"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.label}
                    </span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                      <Link
                        to="/account"
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <span className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Account
                        </span>
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition duration-150"
                        onClick={handleLogout}
                      >
                        <span className="flex items-center gap-3">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                </li>
              ) : (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200 font-medium block"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}

            {/* Notification Bell */}
            <li className="relative ml-2" ref={notifRef}>
              <button
                className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                onClick={() => setShowNotifications((prev) => !prev)}
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <span className="font-semibold text-gray-900">Notifications</span>
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition duration-150"
                      onClick={clearAllNotifications}
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-8 text-gray-500 text-center text-sm">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        No new notifications
                      </li>
                    ) : (
                      notifications.map((notif) => (
                        <li
                          key={notif.id}
                          className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition duration-150 cursor-pointer ${
                            notif.type === "error"
                              ? "bg-red-50/30"
                              : notif.type === "warning"
                              ? "bg-yellow-50/30"
                              : "bg-blue-50/30"
                          }`}
                          onClick={() => markRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notif.type === "error"
                                  ? "bg-red-500"
                                  : notif.type === "warning"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                              }`}
                            ></span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-800 leading-relaxed">
                                {notif.message}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {notif.time || notif.createdAt}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;