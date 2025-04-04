
import React from "react";
import Stats from "@/components/dashboard/Stats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Projects from "@/components/dashboard/Projects";
import Members from "@/components/dashboard/Members";
import TodoList from "@/components/dashboard/TodoList";
import TimeTracker from "@/components/dashboard/TimeTracker";

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
