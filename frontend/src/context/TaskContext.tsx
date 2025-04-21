import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/api/tasks";
const API_URL_PROJECTS = "http://localhost:5000/api/projects";
const API_URL_MEMBERS = "http://localhost:5000/api/members"; // Added API for members

interface TaskError {
  message: string;
  code?: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  project: string;
  assignedUser: string;
  status: string;
}

export interface Project {
  _id: string;
  name: string;
  color?: string;
  startDate: string;
  endDate: string;
  status: string;
  budget: number;
  description: string;
  teamMembers: string;
}

export interface Member {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  projects: string[];
  timeToday?: number;
  timeThisWeek?: number;
}

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  members: Member[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  addTask: (task: Omit<Task, "_id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, "_id">) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (member: Omit<Member, "_id">) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  isLoading: boolean;
  error: TaskError | null;
  clearError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]); // Added members state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TaskError | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // const token = localStorage.getItem("token"); // Retrieve the token
        const token = Cookies.get("token"); // Get the "token" cookie

console.log("Token from cookies:", token);
        const headers = token ? { Authorization: `Bearer ${token}` } : {}; // Set Authorization header
  
        const [tasksResponse, projectsResponse, membersResponse] = await Promise.all([
          axios.get(API_URL, { headers , withCredentials: true}),
          axios.get(API_URL_PROJECTS, { headers, withCredentials: true }),
          axios.get(API_URL_MEMBERS, { headers, withCredentials: true }),
        ]);
  
        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
        setMembers(membersResponse.data);
      } catch (err: any) {
        setError({
          message: "Failed to fetch data",
          code: err.response?.status?.toString(),
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const getHeaders = () => {
    // const token = localStorage.getItem("token");
    const token = Cookies.get("token"); // Get the "token" cookie

console.log("Token from cookies:", token);
    return token ? { Authorization: `Bearer ${token}`,"Content-Type": "application/json" } : {};
  };
  
  // Task Operations
  const addTask = async (task: Omit<Task, "_id">) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await axios.post(API_URL, task, { headers: getHeaders() });
      setTasks((prev) => [...prev, response.data]);
    } catch (err: any) {
      setError({ message: "Failed to add task", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTask = async (id: string, updates: Partial<Task>) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await axios.put(`${API_URL}/${id}`, updates, { headers: getHeaders() });
      setTasks((prev) => prev.map((task) => (task._id === id ? response.data : task)));
    } catch (err: any) {
      setError({ message: "Failed to update task", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTask = async (id: string) => {
    setIsLoading(true);
    clearError();
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err: any) {
      setError({ message: "Failed to delete task", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Project Operations
  const addProject = async (project: Omit<Project, "_id">) => {
    setIsLoading(true);
    clearError();

    console.log('project',project);
    console.log('API_URL_PROJECTS',API_URL_PROJECTS);
    
    try {
      // const response = await axios.post(API_URL_PROJECTS, project, { headers: getHeaders() });
      const response = await axios.post(API_URL_PROJECTS, project, { 
        headers: getHeaders(),
        withCredentials: true });

      setProjects((prev) => [...prev, response.data]);
    } catch (err: any) {
      setError({ message: "Failed to add project", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await axios.put(`${API_URL_PROJECTS}/${id}`, updates, { headers: getHeaders() });
      setProjects((prev) => prev.map((p) => (p._id === id ? response.data : p)));
    } catch (err: any) {
      setError({ message: "Failed to update project", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
};


  const deleteProject = async (id: string) => {
    setIsLoading(true);
    clearError();
    try {
      await axios.delete(`${API_URL_PROJECTS}/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      setError({ message: "Failed to delete project", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Member Operations
  const addMember = async (member: Omit<Member, "_id">) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await axios.post(API_URL_MEMBERS, member);
      setMembers((prev) => [...prev, response.data]);
    } catch (err: any) {
      setError({ message: "Failed to add member", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    setIsLoading(true);
    clearError();
    try {
      const response = await axios.put(`${API_URL_MEMBERS}/${id}`, updates);
      setMembers((prev) => prev.map((m) => (m._id === id ? response.data : m)));
    } catch (err: any) {
      setError({ message: "Failed to update member", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    setIsLoading(true);
    clearError();
    try {
      await axios.delete(`${API_URL_MEMBERS}/${id}`);
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (err: any) {
      setError({ message: "Failed to delete member", code: err.response?.status?.toString() });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, projects, setProjects,members, addTask, updateTask, deleteTask, addProject, updateProject, deleteProject, addMember, updateMember, deleteMember, isLoading, error, clearError }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}