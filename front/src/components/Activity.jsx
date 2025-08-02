import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axiosInstance from '../services/axiosInstance';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

function Activity() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axiosInstance.get("/api/logs/all", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const logs = res;

        const pastWeek = Array.from({ length: 7 }).map((_, i) => {
          const day = subDays(new Date(), 6 - i); 
          return {
            date: day,
            label: i === 6 ? 'today' : i === 5 ? 'yesterday' : `${6 - i} days ago`,
            count: logs.filter(log =>
              isSameDay(parseISO(log.timestamp), day)
            ).length
          };
        });

        // Prepare chart data
        const chartData = pastWeek.map(d => ({
          day: d.label,
          value: d.count
        }));

        setData(chartData);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-full bg-white shadow rounded-xl max-w-screen-xl mx-auto p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h2>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#374151"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#374151', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Activity;
