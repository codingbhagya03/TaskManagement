import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { SquarePen, Trash } from "lucide-react";
import SelectReact from "react-select";

const API_URL = "http://localhost:5000/api/tasks";
const STATUS_URL = "http://localhost:5000/api/tasks/statuses";
const USERS_API_URL = "http://localhost:5000/api/members";

interface Task {
  _id?: string;
  title: string;
  projects: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
  assignedUsers: string[];
  createdAt?: string;
}

interface User {
  _id?: string;
  name: string;
  roles: string[];
  email: string;
  timeToday?: number;
  timeThisWeek?: number;
}

const TaskManager: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<{ _id: string, name: string }[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState<User[]>([]); // State to store users from API
  const [userOptions, setUserOptions] = useState<{ value: string, label: string }[]>([]); // Options for React Select
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchTasks();
    fetchProjects();
    fetchStatuses();
    fetchUsers(); 
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });
      if (!response.data.isAuthenticated) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setTasks(response.data);
    } catch (error) {
      setError("Failed to fetch tasks");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects", {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setProjects(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(STATUS_URL, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setStatuses(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statuses",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USERS_API_URL, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data);
      
      // Create options for React Select
      const options = response.data.map((user: User) => ({
        value: user.name,
        label: user.name
      }));
      setUserOptions(options);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTask) {
      setIsLoading(true);
      setError(null);
      try {
        const config = {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        if (currentTask._id) {
          await axios.put(`${API_URL}/${currentTask._id}`, currentTask, config);
        } else {
          await axios.post(API_URL, currentTask, config);
        }
        await fetchTasks();
        setOpen(false);
        setCurrentTask(null);
      } catch (error) {
        setError("Error saving task");
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      await fetchTasks();
    } catch (error) {
      setError("Error deleting task");
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case "starting":
        return tasks.filter(task => task.status.toLowerCase() === "starting");
      case "pending":
        return tasks.filter(task => task.status.toLowerCase() === "pending");
      case "completed":
        return tasks.filter(task => task.status.toLowerCase() === "completed");
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div>
      <h1>Task Manager</h1>
      <Card className="p-3 max-w-7xl mx-auto mt-6">
        <CardHeader></CardHeader>

        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="starting">Starting</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button className="me-7"
              onClick={() => {
                setCurrentTask({
                  title: "",
                  projects: "",
                  status: "Pending",
                  priority: "medium",
                  assignedUsers: [], // Initialize as empty array
                  startDate: "",
                  dueDate: ""
                });
                setOpen(true);
              }}
            >
              Add Task
            </Button>
          </div>

          {isLoading && <div className="text-center py-4">Loading tasks...</div>}
          {error && <div className="text-red-500 py-4">{error}</div>}

          {!isLoading && !error && filteredTasks.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              {activeTab === "all" 
                ? "No tasks available. Click \"Add Task\" to create one." 
                : `No ${activeTab} tasks available.`}
            </p>
          )}

          {!isLoading && !error && filteredTasks.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned Users</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map(task => (
                  <TableRow key={task._id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.projects}</TableCell>
                    <TableCell>
                      <span className={`status-badge ${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                    <TableCell>
                      {task.assignedUsers && task.assignedUsers.length > 0 
                        ? task.assignedUsers.join(", ") 
                        : "Unassigned"}
                    </TableCell>
                    <TableCell>{task.dueDate || "N/A"}</TableCell>
                    <TableCell className="space-x-2">
                      <div className="flex gap-4">
                        <SquarePen size={18} onClick={() => {
                          setCurrentTask(task); setOpen(true);
                        }}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                        <Trash size={18} onClick={() => handleDelete(task._id!)}
                          className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentTask?._id ? "Edit Task" : "New Task"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  type="text"
                  value={currentTask?.title || ""}
                  onChange={e => setCurrentTask({ ...currentTask, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={currentTask?.projects || ""}
                  onValueChange={value => setCurrentTask({ ...currentTask, projects: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project._id} value={project.name}>{project.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={currentTask?.status || "Pending"}
                  onValueChange={value => setCurrentTask({ ...currentTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={currentTask?.priority || "Medium"}
                  onValueChange={value => setCurrentTask({ ...currentTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={currentTask?.dueDate || ""}
                  onChange={e => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Assigned Users</Label>
                <SelectReact
                  isMulti
                  name="assignedUsers"
                  options={userOptions}
                  value={userOptions.filter(option => 
                    currentTask?.assignedUsers?.includes(option.value)
                  )}
                  onChange={(selectedOptions) => {
                    const assignedUsers = selectedOptions.map(option => option.value);
                    setCurrentTask({ ...currentTask, assignedUsers });
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : (currentTask?._id ? "Update Task" : "Add Task")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default TaskManager;