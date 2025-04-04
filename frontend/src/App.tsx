
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { TaskProvider } from "@/context/TaskContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import AppLayout from "@/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Todo from "@/pages/Todo";
import Project from "@/pages/Project";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
// import Analytics from "@/pages/Analytics";
import Timesheet from "@/pages/Timesheet";
import TaskCalendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/pages/ProtectedRoute";
import User from "./pages/User";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <TaskProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Authentication routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Protected App routes */}
                    <Route path="/" element={<ProtectedRoute><AppLayout pageTitle="Dashboard" /></ProtectedRoute>}>
                      <Route index element={<Dashboard />} />
                      <Route path="todo" element={<Todo />} />
                      <Route path="project" element={<Project />} />
                      <Route path="profile" element={<Profile />} />
                      {/* <Route path="analytics" element={<Analytics />} /> */}
                      <Route path="timesheets" element={<Timesheet />} />
                      <Route path="calendar" element={<TaskCalendar />} />
                      <Route path="user" element={<User />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
  
                    {/* Not found route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </TaskProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

export default App;
