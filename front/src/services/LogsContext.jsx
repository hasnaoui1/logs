import React, { createContext, useContext, useState } from 'react';
import axiosInstance from './axiosInstance';

const LogsContext = createContext();

export const LogsProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);

  const token = localStorage.getItem("token");

  const getLogs = () => {
    axiosInstance.get("/api/logs/all", {token})
      .then((data) => setLogs(data))
      .catch((err) => console.log(err.message));
  };

  return (
    <LogsContext.Provider value={{ logs, getLogs }}>
      {children}
    </LogsContext.Provider>
  );
};

export const useLogs = () => useContext(LogsContext);