
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/context/SidebarContext";
import { Calendar, LayoutDashboard, LineChart, Settings, Clock, SquareCheckBig, FolderOpen, UsersRound } from "lucide-react";

const Sidebar: React.FC = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={`h-screen bg-sidebar fixed top-0 left-0 z-30 flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border ${isExpanded ? "w-56" : "w-16"
        }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {isExpanded ? (
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-sidebar-foreground">WORKFLOW<span className="text-yellow-500">X.</span></span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center justify-center w-full">
            <span className="text-xl font-bold text-yellow-500">X.</span>
          </Link>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto py-6">
        <nav className="flex-1 px-2 space-y-1">
          <Link
            to="/"
            className={`sidebar-link ${isActiveRoute("/") && "active"}`}
          >
            <LayoutDashboard size={18} />
            {isExpanded && <span>Dashboard</span>}
          </Link>

          {/* <Link
            to="/analytics"
            className={`sidebar-link ${isActiveRoute("/analytics") && "active"}`}
          >
            <LineChart size={18} />
            {isExpanded && <span>Analytics</span>}
          </Link> */}

          <Link
            to="/timesheets"
            className={`sidebar-link ${isActiveRoute("/timesheets") && "active"}`}
          >
            <Clock size={18} />
            {isExpanded && <span>Timesheets</span>}
          </Link>

          <Link
            to="/todo"
            className={`sidebar-link ${isActiveRoute("/todo") && "active"}`}
          >
            <SquareCheckBig size={18} />
            {isExpanded && <span>Todo</span>}
          </Link>

          <Link
            to="/project"
            className={`sidebar-link ${isActiveRoute("/project") && "active"}`}
          >
            <FolderOpen size={18} />
            {isExpanded && <span>Project</span>}
          </Link>

          <Link
            to="/calendar"
            className={`sidebar-link ${isActiveRoute("/calendar") && "active"}`}
          >
            <Calendar size={18} />
            {isExpanded && <span>Calendar</span>}
          </Link>

          <Link
            to="/user"
            className={`sidebar-link ${isActiveRoute("/user") && "active"}`}
          >
            <UsersRound size={18} />
            {isExpanded && <span>User</span>}
          </Link>

          <Link
            to="/settings"
            className={`sidebar-link ${isActiveRoute("/settings") && "active"}`}
          >
            <Settings size={18} />
            {isExpanded && <span>Settings</span>}
          </Link>
        </nav>
      </div>


    </aside>
  );
};

export default Sidebar;
