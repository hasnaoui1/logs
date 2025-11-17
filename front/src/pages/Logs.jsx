import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRobots } from "../services/RobotsContext";
import axiosInstance from "../services/axiosInstance";

const levelColors = {
  INFO: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
  WARNING: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
  ERROR: "bg-red-100 text-red-700 ring-1 ring-red-300",
};

function Logs() {
  const { id } = useParams();
  const { robots, getAllRobots, robot, getRobot, activateRobot } = useRobots();
  const [logs, setLogs] = useState([]);
  const [robotFilter, setRobotFilter] = useState(id || "All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [hoveredLog, setHoveredLog] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    getAllRobots();
    if (id) getRobot(id);
  }, [id]);

  useEffect(() => {
    if (robot?.status === false) {
      axiosInstance.post("api/logs/run", false).catch(console.error);
    }
  }, [robot?.status]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const url = `http://localhost:8080/api/logs/stream${token ? `?token=${token}` : ""}`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener("log", (event) => {
      try {
        const newLog = JSON.parse(event.data);
        setLogs((prev) => [...prev, newLog]);
      } catch (err) {
        console.error("Error parsing log:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, []);

  const handleView = async () => {
    try {
      const res = await axiosInstance.post("/api/logs/run", robot.status);
      console.log(res);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleExportLogs = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "logs.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const filteredLogs = logs.filter((log) => {
    const matchRobot = robotFilter === "All" || String(log.robot?.id) === String(robotFilter);
    const matchLevel = levelFilter === "All" || log.type === levelFilter;
    return matchRobot && matchLevel;
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">📡 Live Robot Logs</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleView}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow transition"
          >
            View Logs
          </button>
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow transition"
          >
            Export Logs
          </button>
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-6 items-center mb-6">
        <div>
          <label className="block mb-1 text-sm font-semibold text-gray-700">Log Level</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="All">All</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>

        {id && robot && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <button
              onClick={() => activateRobot(id, robot.status)}
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                robot.status
                  ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                  : "bg-red-100 text-red-700 ring-1 ring-red-300"
              } transition hover:scale-105`}
            >
              {robot.status ? "Active" : "Inactive"}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">Robot ID</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Message</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-200">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No logs match the selected filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr
                  key={index}
                  onMouseEnter={(e) => {
                    setHoveredLog(log);
                    setHoverPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredLog(null)}
                  className="relative"
                >
                  <td className="px-4 py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{log.robot?.id || "N/A"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${levelColors[log.type] || "bg-gray-200 text-gray-600"}`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      
      {hoveredLog && (
        <div
          className="fixed z-50 max-w-md bg-gray-900 text-gray-100 text-xs p-3 rounded-lg shadow-xl font-mono whitespace-pre-wrap transition-opacity duration-150"
          style={{
            top: hoverPos.y + 15,
            left: hoverPos.x + 15,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {JSON.stringify(hoveredLog, null, 2)}
        </div>
      )}
    </div>
  );
}

export default Logs;
