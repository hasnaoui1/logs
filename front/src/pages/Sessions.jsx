import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axiosInstance from '../services/axiosInstance';

const levelColors = {
  INFO: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
  WARNING: "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300",
  ERROR: "bg-red-100 text-red-700 ring-1 ring-red-300",
};

function Sessions() {
  const navigate = useNavigate();
  const { robotId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [robot, setRobot] = useState(null);

  useEffect(() => {
    fetchSessions();
    if (robotId) {
      fetchRobot();
    }
  }, [robotId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const endpoint = robotId 
        ? `/api/sessions/robot/${robotId}` 
        : '/api/sessions';
      const data = await axiosInstance.get(endpoint);
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRobot = async () => {
    try {
      const data = await axiosInstance.get(`/robots/${robotId}`);
      setRobot(data);
    } catch (err) {
      console.error('Failed to fetch robot:', err.message);
    }
  };

  const handleViewSession = async (session) => {
    setSelectedSession(session);
    // Logs are already included in the session object
    setSessionLogs(session.logs || []);
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
    setSessionLogs([]);
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return 'N/A';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}m`;
    }
    return `${diffMins}m`;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.08),rgba(255,255,255,0))] pointer-events-none"></div>
      
      <Navbar />

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-pulse"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      selectedSession.active 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Session #{selectedSession.id}</h2>
                      <p className="text-gray-500">
                        {selectedSession.robot?.name || 'Unknown Robot'} • {selectedSession.logCount || 0} logs
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Session Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                    <p className={`text-sm font-semibold ${selectedSession.active ? 'text-green-600' : 'text-gray-600'}`}>
                      {selectedSession.active ? '🟢 Active' : '⚫ Ended'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Started</p>
                    <p className="text-sm font-medium text-gray-700">{formatDateTime(selectedSession.startTime)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Ended</p>
                    <p className="text-sm font-medium text-gray-700">
                      {selectedSession.active ? 'Still running' : formatDateTime(selectedSession.endTime)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDuration(selectedSession.startTime, selectedSession.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logs List */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Logs</h3>
                
                {sessionLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 font-medium">No logs recorded in this session</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessionLogs.map((log, index) => (
                      <div 
                        key={log.id || index} 
                        className="flex items-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition duration-150"
                      >
                        <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${levelColors[log.type] || 'bg-gray-200 text-gray-600'}`}>
                          {log.type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 break-words">{log.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateTime(log.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {robotId && robot ? `${robot.name} Sessions` : 'All Sessions'}
              </h1>
              <p className="text-gray-600 text-sm">
                {robotId ? 'View session history for this robot' : 'View all robot sessions and their logs'}
              </p>
            </div>
          </div>
          
          {robotId && (
            <button
              onClick={() => navigate('/sessions')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200"
            >
              View All Sessions
            </button>
          )}
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No Sessions Found</h3>
            <p className="text-gray-400">Sessions will appear here when you start a robot</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Session Header */}
                <div className={`p-4 ${session.active ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Session #{session.id}</h3>
                        <p className="text-white/80 text-sm">{session.robot?.name || 'Unknown Robot'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      session.active 
                        ? 'bg-white/20 text-white animate-pulse' 
                        : 'bg-white/20 text-white/90'
                    }`}>
                      {session.active ? '● LIVE' : 'ENDED'}
                    </span>
                  </div>
                </div>

                {/* Session Body */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Started</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDateTime(session.startTime)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Duration</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDuration(session.startTime, session.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">{session.logCount || 0} logs</span>
                    </div>
                    
                    <button
                      onClick={() => handleViewSession(session)}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;
