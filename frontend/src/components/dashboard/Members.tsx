import React, { useState, useEffect } from "react";

const Members: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("today");

  // Fetch members from the backend
  // useEffect(() => {
  //   fetch("http://localhost:5000/api/members")
  //     .then((res) => res.json())
  //     .then((data) => setMembers(data))
  //     .catch((err) => console.error("Error fetching members:", err));
  // }, []);
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve token from storage
  
    fetch("http://localhost:5000/api/members", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` // Attach token
      },
      credentials: "include", 
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Fetched members:", data);
        setMembers(data);
      })
      .catch((err) => console.error("Error fetching members:", err));
  }, []);
  

  // Format time from minutes to HH:MM
  const formatTime = (minutes: number | undefined) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  console.log('members', members);


  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in [animation-delay:600ms]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Members</h3>
        <div className="flex space-x-2">
          <button
            className={`text-xs px-3 py-1.5 rounded transition-colors ${activeTab === "info"
                ? "bg-yellow-50 text-yellow-500"
                : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            onClick={() => setActiveTab("info")}
          >
            Member Info
          </button>
          <button
            className={`text-xs px-3 py-1.5 rounded transition-colors ${activeTab === "today"
                ? "bg-yellow-50 text-yellow-500"
                : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>
          <button
            className={`text-xs px-3 py-1.5 rounded transition-colors ${activeTab === "week"
                ? "bg-yellow-50 text-yellow-500"
                : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            onClick={() => setActiveTab("week")}
          >
            This Week
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member._id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 text-xs font-medium">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.roles}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Creating UI and Research
                </p>
              </div>
            </div>
            <div>
              {activeTab === "today" && (
                <div className="text-sm font-medium">{formatTime(member.timeToday)}</div>
              )}
              {activeTab === "week" && (
                <div className="text-sm font-medium">{formatTime(member.timeThisWeek)}</div>
              )}
              {activeTab === "info" && (
                <div className="text-sm font-medium">{member.projects.length} projects</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
