import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

function Navbar() {
  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Robots", path: "/robots" },
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

  const notificationIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  return (
    <nav className="bg-white shadow">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-black">Robots</div>
        <ul className="hidden md:flex space-x-6 items-center">
          {/* Notification Bell */}
          <li className="relative" ref={notifRef}>
            <button
              className="relative focus:outline-none"
              onClick={() => setShowNotifications((prev) => !prev)}
              aria-label="Notifications"
              style={{ paddingRight: "8px" }}
            >
              <span className="relative inline-block">
                {notificationIcon}
                {notifications.length > 0 && (
                  <span
                    className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full shadow"
                    style={{ minWidth: "20px", minHeight: "20px" }}
                  >
                    {notifications.length}
                  </span>
                )}
              </span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
                <div className="px-4 py-2 border-b font-semibold text-gray-700 flex justify-between items-center">
                  Notifications
                  <button
                    className="text-xs text-blue-600 hover:underline"
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </button>
                </div>
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-4 text-gray-400 text-center">No notifications</li>
                  ) : (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`px-4 py-3 border-b last:border-b-0 flex items-start gap-2 ${
                          notif.type === "error"
                            ? "bg-red-50"
                            : notif.type === "warning"
                            ? "bg-yellow-50"
                            : "bg-blue-50"
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mt-2 ${
                            notif.type === "error"
                              ? "bg-red-500"
                              : notif.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          }`}
                        ></span>
                        <div>
                          <div
                            onClick={() => markRead(notif.id)}
                            className="text-sm text-gray-800 cursor-pointer hover:underline"
                          >
                            {notif.message}
                          </div>
                          <div className="text-xs text-gray-500">{notif.time || notif.createdAt}</div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </li>
          {/* Navigation Items */}
          {navItems.map((item, index) =>
            item.label === "Settings" ? (
              <li key={index} className="relative" ref={dropdownRef}>
                <button
                  className="text-gray-700 hover:text-blue-500 hover:underline transition-colors duration-200"
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  {item.label}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Account
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <li key={index}>
                <Link
                  to={item.path}
                  className="text-gray-700 hover:text-blue-500 hover:underline transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;