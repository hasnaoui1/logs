import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useRobots } from '../services/RobotsContext';
import axiosInstance from '../services/axiosInstance';

function Robots() {
  const navigate = useNavigate();
  const { robots, getAllRobots } = useRobots();
  const [modal, setModal] = useState(false);
  const [robot, setRobot] = useState({ name: "", status: false, tasks: 0 });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    getAllRobots();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setRobot((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  const handleStatusChange = (e) => {
    setRobot((prev) => ({ ...prev, status: e.target.value === "1" }));
  };

  const addRobot = (e) => {
    e.preventDefault();
    axiosInstance.post("/robots/add", robot, { token })
      .then(() => {
        getAllRobots();
        setModal(false);
        setRobot({ name: "", status: false, tasks: 0 });
      })
      .catch((err) => console.log(err.message));
  };

  const deleteRobot = (id) => {
    axiosInstance.delete(`/robots/${id}`, { token })
      .then(() => getAllRobots())
      .catch((err) => console.log(err.message));
  };

  const startEdit = (robot) => {
    setEditId(robot.id);
    setEditData({ name: robot.name, status: robot.status, tasks: robot.tasks });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    setEditData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  const handleEditStatus = (e) => {
    setEditData((prev) => ({ ...prev, status: e.target.value === "1" }));
  };

  const updateRobot = (id) => {
    axiosInstance.put(`/robots/${id}`, editData, { token })
      .then(() => {
        getAllRobots();
        setEditId(null);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Navbar />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={() => setModal(false)} className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-xl">&times;</button>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Add New Robot</h2>

            <form onSubmit={addRobot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name</label>
                <input
                  type="text" name="name" value={robot.name} onChange={handleChange} required
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Status</label>
                <select
                  name="status" value={robot.status ? "1" : "2"} onChange={handleStatusChange}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">Active</option>
                  <option value="2">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Tasks Completed</label>
                <input
                  type="number" name="tasks" value={robot.tasks} onChange={handleChange} min={0} required
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800">Robot Status</h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition"
            onClick={() => setModal(true)}
          >
            + Add Robot
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl shadow-lg">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold tracking-wide">ID</th>
                <th className="px-6 py-3 font-semibold tracking-wide">Name</th>
                <th className="px-6 py-3 font-semibold tracking-wide">Status</th>
                <th className="px-6 py-3 font-semibold tracking-wide">Tasks</th>
                <th className="px-6 py-3 font-semibold tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {robots.map((robot) => (
                <tr key={robot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{robot.id}</td>
                  <td className="px-6 py-4">
                    {editId === robot.id ? (
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      robot.name
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {editId === robot.id ? (
                      <select
                        name="status"
                        value={editData.status ? "1" : "2"}
                        onChange={handleEditStatus}
                        className="border rounded px-2 py-1"
                      >
                        <option value="1">Active</option>
                        <option value="2">Inactive</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${robot.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {robot.status ? "Active" : "Inactive"}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {editId === robot.id ? (
                      <input
                        type="number"
                        name="tasks"
                        value={editData.tasks}
                        onChange={handleEditChange}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      robot.tasks
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/logs/${robot.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteRobot(robot.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    
                      {editId === robot.id ? (
                        <>
                          <button onClick={() => updateRobot(robot.id)} className="text-green-600 hover:underline">Save</button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(robot)} className="text-yellow-600 hover:underline">Update</button>
                      )}

                        
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Robots;
