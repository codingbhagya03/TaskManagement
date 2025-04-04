import React, { useEffect, useState } from "react";
import { LogOut, PanelRight } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface NavbarProps {
  pageTitle: string;
}

const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState({ fullName: "", email: "", roles: [] as string[] });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authRes = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });
        
        if (authRes.data.isAuthenticated) {
          console.log("User authenticated:", authRes.data);
          
          // Fetch user details from users API
          const userRes = await axios.get(`http://localhost:5000/api/users/${authRes.data.userId}`, { withCredentials: true });
          console.log("User details fetched:", userRes.data);
          
          // Fetch roles from members API
          try {
            const memberRes = await axios.get(`http://localhost:5000/api/members/roles`, { withCredentials: true });
            console.log("Roles fetched:", memberRes.data);
            
            setUser({
              fullName: userRes.data.name,
              email: userRes.data.email,
              // Use roles from the members/roles API
              roles: memberRes.data || []
            });
          } catch (memberError) {
            console.error("Error fetching roles:", memberError);
            // Fallback to empty roles array if fetch fails
            setUser({
              fullName: userRes.data.name,
              email: userRes.data.email,
              roles: []
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
      localStorage.removeItem("token");
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Function to generate user initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="sticky top-0 z-20 w-full h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 transition-all duration-300">
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="w-full p-2 flex items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
        >
          <PanelRight size={18} />
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border hover:bg-secondary transition-colors duration-200 relative"
        >
          <LogOut size={18} />
        </button>
        
        {/* Theme Toggle Button */}
        <ThemeToggle />
        
        {/* User Info */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/settings")} >
          {user.fullName && (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium">{user.fullName}</div>
                <div className="text-xs text-muted-foreground truncate w-14">{user.roles && user.roles.length > 0 ? user.roles.join(", ") : "No Role Found"}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 font-medium border-2 border-yellow-500">
                {getInitials(user.fullName)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;