import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../components/Navbar';
import RobotStats from '../components/RobotStats';
import Activity from '../components/Activity';
import RecentLogs from '../components/RecentLogs';

function Home() {
  const [user, setUser] = useState(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {

        const res = await axiosInstance.get("/auth/info")
         

        setUser(res); 
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

   fetchUser();
  

  }, []);
  console.log(user)
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
