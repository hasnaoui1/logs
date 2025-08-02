import React, { useEffect } from 'react';
import { useLogs } from '../services/LogsContext';

const getLevelBadge = (level) => {
  const base = 'px-2 py-1 rounded text-xs font-semibold';
  switch (level) {
    case 'INFO':
      return <span className={`${base} bg-blue-200 text-blue-800`}>INFO</span>;
    case 'WARNING':
      return <span className={`${base} bg-yellow-200 text-yellow-800`}>WARN</span>;
    case 'ERROR':
      return <span className={`${base} bg-red-200 text-red-800`}>ERROR</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-600`}>{level}</span>;
  }
};

function RecentLogs() {
  const { logs, getLogs } = useLogs();

  useEffect(()=>{
    getLogs();
    
  },[])

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-screen-xl mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Recent Logs</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Robot ID</th>
              <th className="px-4 py-2">Message</th>
              <th className="px-4 py-2">Level</th>
            </tr>
          </thead>
           <tbody>
            {[...logs]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 6)
              .map((log, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">
                {new Date(log.timestamp).toLocaleString()}
              </td>

                  <td className="px-4 py-2">{log.robot?.id}</td>
                  <td className="px-4 py-2">{log.message}</td>
                  <td className="px-4 py-2">{getLevelBadge(log.type)}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentLogs;