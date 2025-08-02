import React, { createContext, useContext, useState } from "react";
import axiosInstance from "./axiosInstance";

const RobotsContext = createContext();

export const RobotsProvider = ({ children }) => {
  const [robots, setRobots] = useState([]);
   
  const [robot,setRobot]= useState()

  const token = localStorage.getItem("token")

  const addRobot =() =>{
    
  }

  const getAllRobots = () => {
        axiosInstance.get("/robots/all" , token)
        .then((data)=>{
            setRobots(data)})
        .catch((err)=>{console.log(err.message)})
    


  };

  const getRobot =(id)=>{
    axiosInstance.get(`/robots/${id}`, token)
    .then((data)=>setRobot(data))
    .catch((err)=>console.log(err.message))
  }

 const activateRobot = (id, status) => {
  axiosInstance
    .put(`/robots/changeStatus/${id}/status?status=${!status}`, {})
    .then((data) => setRobot(data))
    .catch((err) => console.log(err.message));
};


  const removeRobot = (id) => {
    setRobots((prev) => prev.filter((robot) => robot.id !== id));
  };

  return (
    <RobotsContext.Provider value={{ robots, getAllRobots, removeRobot , robot ,activateRobot,  getRobot }}>
      {children}
    </RobotsContext.Provider>
  );
};

export const useRobots = () => useContext(RobotsContext);