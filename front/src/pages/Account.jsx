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

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Account Settings</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="mt-1 w-full px-4 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 w-full px-4 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Your Robots</h2>
        <button
          onClick={handleDeleteAllRobots}
          className="mb-4 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
        >
          Delete All Robots
        </button>

        {robots?.length === 0 ? (
          <p className="text-gray-500">No robots found.</p>
        ) : (
          <ul className="space-y-2">
            {robots.map((robot) => (
              <li
                key={robot.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded border"
              >
                <span>
                  <strong>ID:</strong> {robot.id} — <strong>Name:</strong> {robot.name}
                </span>
                <button
                  onClick={() => handleDeleteLogsForRobot(robot.id)}
                  className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
                >
                  Delete Logs
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
export default Account;