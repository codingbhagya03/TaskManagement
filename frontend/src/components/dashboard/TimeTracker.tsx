
import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";

const TimeTracker: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  const formatTime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-lg font-semibold">
        {isActive ? "Recording time..." : "Start Time Tracker"}
      </div>
      
      <button
        onClick={toggleTimer}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all transform hover:scale-105 ${
          isActive
            ? "bg-red-500 text-white"
            : "bg-yellow-500 text-black"
        }`}
      >
        {isActive ? (
          <div className="w-4 h-4 rounded bg-white"></div>
        ) : (
          <Play size={24} fill="black" />
        )}
      </button>
      
      {isActive && (
        <div className="text-lg font-semibold animate-pulse">
          {formatTime()}
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
