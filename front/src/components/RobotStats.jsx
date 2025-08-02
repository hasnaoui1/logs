import React, { useContext, useEffect } from 'react';
import { RobotsProvider, useRobots } from '../services/RobotsContext';
import { useLogs } from '../services/LogsContext';

function RobotStats() {

  const {robots , getAllRobots}= useRobots()

  const {logs, getLogs} = useLogs()
  
  useEffect(()=>{
    getAllRobots()
    getLogs()
   
  },[])
 
  const stats = [
    { label: 'Total Robots', value: robots.length },
    { label: 'Active Robots', value: robots.filter(r=> r.status===true).length },
    { label: 'Tasks Completed', value:  robots.reduce((sum, r) => sum + (r.tasks || 0), 0) },
    { label: 'Errors Detected', value: logs.filter(l=>l.type=="ERROR").length },
  ];  

  

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-1 min-w-[200px] bg-white shadow-sm border border-gray-200 rounded-xl p-4"
          >
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </h3>
            <p className="text-2xl font-semibold text-black">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RobotStats;
