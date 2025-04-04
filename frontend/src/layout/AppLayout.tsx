
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useSidebar } from "@/context/SidebarContext";

interface AppLayoutProps {
  pageTitle: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ pageTitle }) => {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isExpanded ? "ml-56" : "ml-16"
        }`}
      >
        <Navbar pageTitle={pageTitle} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
