import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useRobots } from '../services/RobotsContext';
import axiosInstance from '../services/axiosInstance';

function Robots() {
  const navigate = useNavigate();
  const { robots, getAllRobots } = useRobots();
  const [modal, setModal] = useState(false);
  const [robot, setRobot] = useState({ name: "", status: false, sessionCount: 0 });
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
        setRobot({ name: "", status: false, sessionCount: 0 });
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
    setEditData({ name: robot.name, status: robot.status, sessionCount: robot.sessionCount });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none"></div>
      
      <Navbar />

      {/* Add Robot Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200">
              <button 
                onClick={() => setModal(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add New Robot</h2>
              </div>

              <form onSubmit={addRobot} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Robot Name</label>
                  <input
                    type="text" 
                    name="name" 
                    value={robot.name} 
                    onChange={handleChange} 
                    required
                    placeholder="Enter robot name"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status" 
                    value={robot.status ? "1" : "2"} 
                    onChange={handleStatusChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  >
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Count</label>
                  <input
                    type="number" 
                    name="sessionCount" 
                    value={robot.sessionCount} 
                    onChange={handleChange} 
                    min={0} 
                    required
                    placeholder="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg transition duration-200 transform hover:scale-[1.02]"
                >
                  Add Robot
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
           
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Robot Management</h1>
              <p className="text-gray-600 text-sm">Manage and monitor your robots</p>
            </div>
          </div>
          
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
            onClick={() => setModal(true)}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Robot
            </span>
          </button>
        </div>

        {/* Robots Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 text-left font-semibold">ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Sessions</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {robots.map((robot) => (
                  <tr key={robot.id} className="hover:bg-blue-50 transition duration-150">
                    <td className="px-6 py-4 text-gray-600 font-mono">{robot.id}</td>
                    
                    <td className="px-6 py-4">
                      {editId === robot.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">{robot.name}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editId === robot.id ? (
                        <select
                          name="status"
                          value={editData.status ? "1" : "2"}
                          onChange={handleEditStatus}
                          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1">Active</option>
                          <option value="2">Inactive</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          robot.status 
                            ? 'bg-green-100 text-green-700 ring-1 ring-green-300' 
                            : 'bg-red-100 text-red-700 ring-1 ring-red-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${robot.status ? 'bg-green-500' : 'bg-red-500'} ${robot.status ? 'animate-pulse' : ''}`}></span>
                          {robot.status ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editId === robot.id ? (
                        <input
                          type="number"
                          name="sessionCount"
                          value={editData.sessionCount}
                          onChange={handleEditChange}
                          className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-700">{robot.sessionCount || 0}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/logs/${robot.id}`)}
                          className="text-blue-600 hover:text-blue-500 font-medium transition duration-150"
                        >
                          Logs
                        </button>
                        
                        <button
                          onClick={() => navigate(`/sessions/${robot.id}`)}
                          className="text-indigo-600 hover:text-indigo-500 font-medium transition duration-150"
                        >
                          Sessions
                        </button>
                        
                        {editId === robot.id ? (
                          <>
                            <button 
                              onClick={() => updateRobot(robot.id)} 
                              className="text-green-600 hover:text-green-500 font-medium transition duration-150"
                            >
                              Save
                            </button>
                            <button 
                              onClick={cancelEdit} 
                              className="text-gray-500 hover:text-gray-400 font-medium transition duration-150"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => startEdit(robot)} 
                            className="text-yellow-600 hover:text-yellow-500 font-medium transition duration-150"
                          >
                            Edit
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteRobot(robot.id)}
                          className="text-red-600 hover:text-red-500 font-medium transition duration-150"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Robots;