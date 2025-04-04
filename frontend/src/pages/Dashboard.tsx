
import React from "react";
import Stats from "@/components/dashboard/Stats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Projects from "@/components/dashboard/Projects";
import Members from "@/components/dashboard/Members";
import TodoList from "@/components/dashboard/TodoList";
import TimeTracker from "@/components/dashboard/TimeTracker";
import { Progress } from "@radix-ui/react-progress"; 

const Dashboard: React.FC = () => {
  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    year: "numeric",
  });
  
  const formattedTime = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="space-y-8">
      <h1>Dashboard</h1>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">Today</h2>
          <p className="text-lg text-muted-foreground">
            {formattedDate} | {formattedTime}
          </p>
        </div>
        
        <TimeTracker />
      </div>
      {/* Add Progress Bar for Today's Goal */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Today's Goal</h3>
        <Progress value={60} max={100} className="w-full h-2 bg-gray-200 rounded-full">
          <span className="sr-only">60% complete</span>
        </Progress>
        <p className="text-sm">60% of your daily goal has been completed.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
          <h4 className="text-xl font-semibold">Completed Tasks</h4>
          <p className="text-2xl font-bold">35</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
          <h4 className="text-xl font-semibold">Active Users</h4>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
          <h4 className="text-xl font-semibold">Ongoing Projects</h4>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
          <h4 className="text-xl font-semibold">Pending Tasks</h4>
          <p className="text-2xl font-bold">8</p>
        </div>
      </div>  {/* Add Recent Activity */}
      <RecentActivity />
      <Stats />
      
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity />
        <Projects />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Members />
        <TodoList />
      </div>
    </div>
  );
};

export default Dashboard;
