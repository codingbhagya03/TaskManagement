import React, { useEffect, useState } from "react";
import { Calendar, Clock, Folder } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Stats: React.FC = () => {
  const [projectCount, setProjectCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const navigate = useNavigate();

  // Fetch the number of projects
  const fetchProjectCount = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects", { withCredentials: true });
      setProjectCount(response.data.length);  // Assuming response is an array of projects
    } catch (error) {
      console.error("Error fetching project count:", error);
    }
  };

  const fetchUserCount = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/members", { withCredentials: true });
      setUserCount(response.data.length);  // Assuming response is an array of projects
    } catch (error) {
      console.error("Error fetching project count:", error);
    }
  };

  const fetchTaskCount = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/tasks", { withCredentials: true });
      setTaskCount(response.data.length);  // Assuming response is an array of projects
    } catch (error) {
      console.error("Error fetching project count:", error);
    }
  };

  useEffect(() => {
    fetchProjectCount(); // Fetch the project count when the component mounts
    fetchTaskCount();
    fetchUserCount();
  }, []);

  // Format time from minutes to HH:MM:SS
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const secs = 0; // We don't track seconds in our data
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="stat-card animate-fade-in [animation-delay:100ms]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Users</h3>
          <div className="relative">
            <button className="text-black font-bold focus:outline-none" onClick={() => navigate("/user")}>:</button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-4xl font-bold">{userCount < 10 ? `0${userCount}` : userCount}</p>
          <div className="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
            <Folder size={28} className="text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="stat-card animate-fade-in [animation-delay:200ms]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Tasks</h3>
          <div className="relative">
            <button className="text-black font-bold focus:outline-none" onClick={() => navigate("/todo")}>:</button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-4xl font-bold">{taskCount < 10 ? `0${taskCount}` : taskCount}</p>
          <div className="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
            <Folder size={28} className="text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="stat-card animate-fade-in [animation-delay:300ms]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-700">Projects</h3>
          <div className="relative">
            <button className="text-black font-bold focus:outline-none" onClick={() => navigate("/project")}>:</button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-4xl font-bold">{projectCount < 10 ? `0${projectCount}` : projectCount}</p>
          <div className="w-12 h-12 rounded-md bg-yellow-50 flex items-center justify-center">
            <Folder size={28} className="text-yellow-500" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
