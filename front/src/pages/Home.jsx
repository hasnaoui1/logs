import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../components/Navbar';
import RobotLogs from './Logs';
import RobotStats from '../components/RobotStats';
import Activity from '../components/Activity';
import RecentLogs from '../components/RecentLogs';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axiosInstance.get("/info", {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });

        setUser(res); 
        console.log(res)
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Navbar />

      
      <RobotStats/>
      <Activity/>
      <RecentLogs/>


    </div>
  );
}

export default Home;
