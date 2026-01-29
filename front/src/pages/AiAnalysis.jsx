import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import axiosInstance from "../services/axiosInstance";
import Swal from 'sweetalert2';

export default function AiAnalysis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      Swal.fire("Error", "Please upload a file first", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post("/api/ai/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      let rawText = typeof response === 'string' ? response : JSON.stringify(response);
      let data;

      try {
        // Find the first '{' and last '}' to extract the JSON object
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonString = rawText.substring(firstBrace, lastBrace + 1);
          data = JSON.parse(jsonString);
        } else {
          throw new Error("No JSON object found in response");
        }
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Raw text:", rawText);
        data = { 
          error: "Failed to parse AI response", 
          details: "The AI response was not in a valid JSON format. Raw response: " + rawText.substring(0, 200) + "..."
        };
      }
      
      if (data.error) {
        Swal.fire("Analysis Error", data.details || data.error, "error");
        setResult(null);
      } else {
        setResult(data);
        Swal.fire("Success", "Analysis Complete!", "success");
      }

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };
  const renderContent = (content) => {
    if (!content) return null;
    if (typeof content === 'object') {
      return (
        <pre className="text-xs bg-gray-50 p-2 rounded border border-gray-100 overflow-x-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }
    return content;
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
    <Navbar/>
    
    <div className="p-8 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="mb-12 text-center">
        <div className="inline-block p-2 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
          Intelligent Diagnostics
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
          Log Analysis Dashboard
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Upload robot logs to generate instant, AI-powered insights, error detection, and performance recommendations.
        </p>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Upload Source</h3>
            <p className="text-sm text-gray-500 mb-4">Select a JSON or Text log file to begin.</p>
            
            <div className="group relative border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-400 transition-all duration-300 p-8 text-center cursor-pointer">
               <input
                type="file"
                onChange={handleFileChange}
                accept=".json,.txt,.log"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
               <div className="mb-3 inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </div>
               <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                 {file ? file.name : "Click or Drag File Here"}
               </p>
               <p className="text-xs text-gray-400 mt-1">.json, .txt, .log supported</p>
            </div>
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] active:translate-y-[0px] ${
              loading 
              ? 'bg-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30'
            }`}
          >
            {loading ? (
                <div className="flex items-center justify-center gap-3">
                   <svg className="animate-spin h-5 w-5 text-white/90" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   <span>Analyzing Logs...</span>
                </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 <span>Start Analysis</span>
              </div>
            )}
          </button>
          
          {result && (
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "analysis-report.json";
                a.click();
              }}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition border border-gray-200 shadow-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Download JSON Report
            </button>
          )}
        </div>

        {/* RIGHT COL: RESULTS DISPLAY */}
        <div className="lg:col-span-2">
          {!result ? (
             <div className="h-full min-h-[400px] border border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center text-gray-400 p-8 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="max-w-md mx-auto">Upload a log file from the left panel to generate a comprehensive system health report using Gemini 2.5 Flash.</p>
             </div>
          ) : (
              <div className="space-y-6 animate-fade-in-up">
                  
                  {/* STATS ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Sessions Card */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <h4 className="text-gray-900 font-bold text-lg">Sessions Activity</h4>
                        </div>
                        <div className="prose prose-sm prose-blue text-gray-600 whitespace-pre-wrap">
                          {renderContent(result.sessions)}
                        </div>
                     </div>

                     {/* Performance Card */}
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                         <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           </div>
                           <h4 className="text-gray-900 font-bold text-lg">System Performance</h4>
                        </div>
                        <div className="prose prose-sm prose-amber text-gray-600 whitespace-pre-wrap">
                          {renderContent(result.performance)}
                        </div>
                     </div>
                  </div>

                   {/* ERRORS ROW */}
                  <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 z-0"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                           </div>
                           <h4 className="text-red-900 font-bold text-lg">Critical Faults Analysis</h4>
                        </div>
                        <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed p-4 bg-red-50/50 rounded-lg border border-red-50">
                            {renderContent(result.errors) || "No critical faults detected in the logs."}
                        </div>
                      </div>
                  </div>

                  {/* FIXES ROW */}
                  <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12 z-0"></div>
                       <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <h4 className="text-emerald-900 font-bold text-lg">Recommended Fixes</h4>
                        </div>
                        <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed p-4 bg-emerald-50/50 rounded-lg border border-emerald-50">
                            {renderContent(result.suggestedFixes) || "System is operating within normal parameters. No fixes required."}
                        </div>
                      </div>
                  </div>

              </div>
          )}
        </div>

      </div>
    
      <div className="mt-12 border-t border-gray-200 pt-6 text-center">
         <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Powered by Gemini AI • Logistics 4.0 Analysis</span>
      </div>

    </div>
    </div>
    </>
  );
}
