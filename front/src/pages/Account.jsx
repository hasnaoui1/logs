import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

function Account() {
  const [user, setUser] = useState({});
  const [robots, setRobots] = useState([]);
  const [formData, setFormData] = useState({ username: "", email: "" });

  const userId = user?.id || localStorage.getItem("userId");

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/info", token);
      console.log(res)
      setUser(res);
      setFormData({ username: res.username || "", email: res.email || "" });
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  };

  useEffect(() => {
    fetchUser();

    if (userId) {
      axiosInstance.get(`/api/users/${userId}`).then((res) => {
        setUser(res);
        setFormData({ username: res.username || "", email: res.email || "" });
      });
    }

    axiosInstance.get("/robots/all").then((res) => setRobots(res));
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/users/${userId}`, formData);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handleDeleteAllRobots = async () => {
    if (!window.confirm("Are you sure you want to delete ALL robots?")) return;

    for (const robot of robots) {
      await axiosInstance.delete(`/robots/${robot.id}`);
    }
    setRobots([]);
    alert("All robots deleted.");
  };

  const handleDeleteLogsForRobot = async (robotId) => {
    if (!window.confirm(`Delete all logs for Robot ${robotId}?`)) return;

    await axiosInstance.delete(`/api/logs/robot/${robotId}`); 
    alert(`Logs deleted for robot ${robotId}`);
  };

  return(
    <div className="min-h-screen bg-[#f5f7fa] p-6">
  <div className="relative max-w-4xl mx-auto mt-8">
    {/* Header */}
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-12 h-12 bg-[#1f2937] rounded-xl flex items-center justify-center shadow-md">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-[#1f2937]">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile and robots</p>
      </div>
    </div>

    {/* Profile Section */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <svg className="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-[#1f2937]">Profile Information</h2>
      </div>

      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-[#2563eb]"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#2563eb] hover:bg-[#1e40af] text-white font-medium rounded-lg shadow transition"
        >
          Update Profile
        </button>
      </form>
    </div>

    {/* Robots Section */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <h2 className="text-xl font-semibold text-[#1f2937]">Your Robots</h2>
        </div>

        <button
          onClick={handleDeleteAllRobots}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-[#dc2626] font-medium rounded-lg border border-red-300 transition"
        >
          Delete All Robots
        </button>
      </div>

      {robots?.length === 0 ? (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-600 font-medium">No robots found</p>
          <p className="text-gray-400 text-sm">Add robots to get started</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {robots.map((robot) => (
            <li
              key={robot.id}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#2563eb] rounded-lg flex items-center justify-center shadow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[#1f2937] font-medium">{robot.name}</p>
                  <p className="text-gray-500 text-sm">ID: {robot.id}</p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteLogsForRobot(robot.id)}
                className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-[#b45309] font-medium rounded-lg border border-yellow-300 transition"
              >
                Delete Logs
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
</div>

  );
}

export default Account;