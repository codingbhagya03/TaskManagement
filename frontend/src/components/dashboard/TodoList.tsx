
import React from "react";
import { useTaskContext } from "@/context/TaskContext";

const TodoList: React.FC = () => {
  const { tasks } = useTaskContext();
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Format time from minutes to HH:MM
  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in [animation-delay:700ms]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">To Do</h3>
        <div className="flex space-x-2">
          <button className="text-xs text-yellow-500 px-2 py-1 rounded bg-yellow-50">
            To Dos
          </button>
          <button className="text-xs text-muted-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">
            Time
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-sm border border-yellow-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-transparent"></div>
              </div>
              <p className="text-sm font-medium">{task.title}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">{formatTime(task.timeSpent)}</div>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${task.timeEstimate ? (task.timeSpent || 0) / task.timeEstimate * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button className="w-full py-2 text-center text-sm text-yellow-500 font-medium rounded-md border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors">
          View Reports
        </button>
      </div>
    </div>
  );
};

export default TodoList;
