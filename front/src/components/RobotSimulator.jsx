import React, { useEffect, useState } from "react";
import { useRobots } from "../services/RobotsContext";
import axiosInstance from "../services/axiosInstance";

export default function RobotSimulator({ onLog, robotId }) {
  const { robot ,getRobot } = useRobots();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [taskId, setTaskId] = useState(1);
  const [orientation, setOrientation] = useState("right");
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [stuckAttempts, setStuckAttempts] = useState(0);
  const gridSize = 10;
  const API_URL = "http://localhost:8080/api/logs";
  const ROBOT_ID = robotId || 1; // Use prop or default to 1

  const circuit = [
    { x: 2, y: 2 },
    { x: 7, y: 2 },
    { x: 7, y: 7 },
    { x: 2, y: 7 },
    { x: 0, y: 0 },
  ];

  const obstacles = [
    { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 4, y: 2 },
    { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 6, y: 5 },
    { x: 6, y: 1 }, { x: 8, y: 3 },
  ];

  const sendLogToBackend = async (log) => {
    if (!robot?.status) return; // Only send logs if robot is active
    try {
      await axiosInstance.post(`${API_URL}`, {
        robotId: ROBOT_ID,
        type: log.type,
        message: log.message,
        timestamp: log.timestamp
        // metadata: log.metadata // Uncomment if Log entity supports metadata
      });
    } catch (e) {
      console.error("Error sending log to backend:", e);
    }
  };

  useEffect(() => {
    getRobot(ROBOT_ID)
    if (!robot?.status) return; // Only run simulation if robot is active

    const interval = setInterval(() => {
      let { x, y } = position;
      let logType = "INFO";
      let message = "";
      let metadata = { batteryLevel, position: { x, y }, orientation, waypoint: circuit[currentWaypointIndex] };

      const batteryDrain = Math.random() * 0.3 + 0.2;
      const newBatteryLevel = Math.max(0, batteryLevel - batteryDrain);
      if (newBatteryLevel < 20 && batteryLevel >= 20) {
        logType = "WARNING";
        message = `Low battery: ${newBatteryLevel.toFixed(1)}% at (${x}, ${y})`;
      }
      setBatteryLevel(newBatteryLevel);
      metadata.batteryLevel = newBatteryLevel;

      if (isStuck) {
        const alternativeDirections = ["up", "down", "left", "right"].filter(
          (dir) => dir !== orientation
        );
        const recoveryDirection = alternativeDirections[Math.floor(Math.random() * alternativeDirections.length)];

        let newX = x;
        let newY = y;
        switch (recoveryDirection) {
          case "up": newY = Math.max(0, y - 1); break;
          case "down": newY = Math.min(gridSize - 1, y + 1); break;
          case "left": newX = Math.max(0, x - 1); break;
          case "right": newX = Math.min(gridSize - 1, x + 1); break;
        }

        const isObstacle = obstacles.some((obs) => obs.x === newX && obs.y === newY);
        const isBoundary = newX === x && newY === y;

        if (!isObstacle && !isBoundary) {
          setPosition({ x: newX, y: newY });
          setOrientation(recoveryDirection);
          setIsStuck(false);
          setStuckAttempts(0);
          logType = "INFO";
          message = `Recovered from stuck state, moved ${recoveryDirection} to (${newX}, ${newY})`;
        } else {
          setStuckAttempts(stuckAttempts + 1);
          logType = "ERROR";
          message = `Still stuck at (${x}, ${y}) after attempt ${stuckAttempts + 1}: Tried ${recoveryDirection}`;
          if (stuckAttempts >= 3) {
            message = `Critical: Robot stuck at (${x}, ${y}) after ${stuckAttempts + 1} attempts`;
            metadata.critical = true;
          }
        }
      } else {
        const target = circuit[currentWaypointIndex];
        const dx = target.x - x;
        const dy = target.y - y;
        let direction = null;

        if (Math.abs(dx) > Math.abs(dy)) {
          direction = dx > 0 ? "right" : "left";
        } else if (dy !== 0) {
          direction = dy > 0 ? "down" : "up";
        }

        if (direction) {
          setOrientation(direction);
          let newX = x;
          let newY = y;
          switch (direction) {
            case "up": newY = Math.max(0, y - 1); break;
            case "down": newY = Math.min(gridSize - 1, y + 1); break;
            case "left": newX = Math.max(0, x - 1); break;
            case "right": newX = Math.min(gridSize - 1, x + 1); break;
          }

          const isObstacle = obstacles.some((obs) => obs.x === newX && obs.y === newY);
          const isBoundary = newX === x && newY == y;
          const moved = newX !== x || newY !== y;

          if (isObstacle) {
            logType = "WARNING";
            message = `Obstacle detected at (${newX}, ${newY}) while moving ${direction}`;
            setIsStuck(true);
            metadata.obstacle = { x: newX, y: newY };
          } else if (isBoundary) {
            logType = "ERROR";
            message = `Cannot move ${direction} from (${x}, ${y}): Boundary reached`;
            setIsStuck(true);
          } else if (moved) {
            setPosition({ x: newX, y: newY });
            message = `Moved ${direction} to (${newX}, ${newY}) toward waypoint ${taskId}`;
          }
        }

        if (x === target.x && y === target.y) {
          logType = "INFO";
          message = `Reached waypoint ${taskId} at (${x}, ${y})`;
          setTaskId(taskId + 1);
          const nextIndex = (currentWaypointIndex + 1) % circuit.length;
          setCurrentWaypointIndex(nextIndex);
          metadata.waypoint = circuit[nextIndex];
        }
      }

      if (Math.random() < 0.15) {
        const sensorType = ["lidar", "ultrasonic", "camera"][Math.floor(Math.random() * 3)];
        const sensorValue = (Math.random() * 100).toFixed(1);
        logType = Math.random() < 0.1 ? "WARNING" : "INFO";
        message = `Sensor ${sensorType} reading: ${sensorValue} at (${x}, ${y})`;
        metadata.sensor = { type: sensorType, value: sensorValue };
      }

      if (Math.random() < 0.05) {
        const conditions = ["rain detected", "dust detected", "uneven terrain"];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        logType = "WARNING";
        message = `Environmental issue: ${condition} at (${x}, ${y})`;
        metadata.condition = condition;
      }

      const log = {
        type: logType,
        message,
        timestamp: new Date().toISOString(),
        metadata: { ...metadata, position: { x, y }, isStuck }
      };

      onLog(log);
      sendLogToBackend(log);
    }, 1500);

    return () => clearInterval(interval);
  }, [position, batteryLevel, taskId, currentWaypointIndex, isStuck, stuckAttempts, robot?.status, onLog, robotId]);

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-10 gap-1 w-[400px] h-[400px] bg-gray-200 p-2 rounded-xl">
        {[...Array(gridSize * gridSize)].map((_, i) => {
          const cellX = i % gridSize;
          const cellY = Math.floor(i / gridSize);
          const isBot = position.x === cellX && position.y === cellY;
          const isObstacle = obstacles.some((obs) => obs.x === cellX && obs.y === cellY);
          const isWaypoint = circuit.some((wp, idx) => wp.x === cellX && wp.y === cellY && idx === currentWaypointIndex);
          const isCircuitPoint = circuit.some((wp) => wp.x === cellX && wp.y === cellY);
          return (
            <div
              key={i}
              className={`w-10 h-10 rounded border flex items-center justify-center
                ${isBot ? (isStuck ? "bg-red-500 text-white" : "bg-indigo-500 text-white") : 
                isObstacle ? "bg-gray-700" : 
                isWaypoint ? "bg-green-300" : 
                isCircuitPoint ? "bg-green-100" : "bg-white"}`}
            >
              {isBot && (
                <span className="text-xs">
                  {orientation === "up" ? "↑" : orientation === "down" ? "↓" : orientation === "left" ? "←" : "→"}
                </span>
              )}
              {isCircuitPoint && !isBot && !isObstacle && !isWaypoint && (
                <span className="text-xs text-green-600">•</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-sm space-y-1">
        <div>Battery: {batteryLevel.toFixed(1)}%</div>
        <div>Position: ({position.x}, {position.y})</div>
        <div>Current Waypoint: ({circuit[currentWaypointIndex].x}, {circuit[currentWaypointIndex].y})</div>
        <div>Orientation: {orientation}</div>
        <div>Status: {isStuck ? `Stuck (${stuckAttempts} attempts)` : robot?.status ? "Moving" : "Inactive"}</div>
      </div>
    </div>
  );
}