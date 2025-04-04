// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Calendar as CalendarIcon, Clock, Plus, Edit, Trash2, Check, X, MoreHorizontal, Play, Pause } from "lucide-react";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { toast } from "@/components/ui/use-toast";

// const Timesheet = () => {
//     // Tracking states
//     const [date, setDate] = useState<Date>(new Date());
//     const [isTracking, setIsTracking] = useState(false);
//     const [elapsedTime, setElapsedTime] = useState(0);
//     const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
//     const [startedAt, setStartedAt] = useState<Date | null>(null);

//     // Data states
//     const [timeEntries, setTimeEntries] = useState([]);
//     const [projects, setProjects] = useState([]);
//     const [tasks, setTasks] = useState([]);
//     const [filteredTasks, setFilteredTasks] = useState([]);

//     // Form states
//     const [selectedProject, setSelectedProject] = useState("");
//     const [selectedTask, setSelectedTask] = useState("");
//     const [notes, setNotes] = useState("");

//     // Edit states
//     const [isEditing, setIsEditing] = useState(false);
//     const [editingEntry, setEditingEntry] = useState(null);
//     const [editProject, setEditProject] = useState("");
//     const [editTask, setEditTask] = useState("");
//     const [editDate, setEditDate] = useState<Date>(new Date());
//     const [editStartTime, setEditStartTime] = useState("");
//     const [editEndTime, setEditEndTime] = useState("");
//     const [editNotes, setEditNotes] = useState("");

//     // Dialog states
//     const [isDialogOpen, setIsDialogOpen] = useState(false);
//     const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//     const [entryToDelete, setEntryToDelete] = useState(null);

//     // Fetch data on mount
//     useEffect(() => {
//         fetchData();
//     }, []);

//     // Filter tasks based on selected project
//     useEffect(() => {
//         if (selectedProject) {
//             const projectTasks = tasks.filter(task => task.projects === selectedProject);
//             setFilteredTasks(projectTasks);
//         } else {
//             setFilteredTasks([]);
//         }

//         // Reset selected task when project changes
//         setSelectedTask("");
//     }, [selectedProject, tasks]);

//     // Filter tasks for editing
//     useEffect(() => {
//         if (editProject) {
//             const projectTasks = tasks.filter(task => task.projects === editProject);
//             setFilteredTasks(projectTasks);
//         }
//     }, [editProject, tasks]);

//     const fetchData = async () => {
//         try {
//             // Fetch projects
//             const projectsResponse = await axios.get("http://localhost:5000/api/projects", {
//                 withCredentials: true
//             });
//             setProjects(projectsResponse.data);

//             // Fetch tasks
//             const tasksResponse = await axios.get("http://localhost:5000/api/tasks", {
//                 withCredentials: true
//             });
//             setTasks(tasksResponse.data);

//             // Fetch timesheets
//             const timesheetsResponse = await axios.get("http://localhost:5000/api/timesheets", {
//                 withCredentials: true
//             });
//             setTimeEntries(timesheetsResponse.data);
//         } catch (error) {
//             console.error("Error fetching data:", error);
//             toast({
//                 title: "Error",
//                 description: "Failed to load timesheet data",
//                 variant: "destructive",
//             });
//         }
//     };

//     // Add a new time entry
//     const addTimeEntry = async () => {
//         if (!selectedProject || !selectedTask) {
//             toast({
//                 title: "Validation Error",
//                 description: "Please select a project and task",
//                 variant: "destructive",
//             });
//             return;
//         }

//         const now = new Date();
//         const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
//         const endTimeObj = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours by default
//         const endTime = `${endTimeObj.getHours().toString().padStart(2, '0')}:${endTimeObj.getMinutes().toString().padStart(2, '0')}`;

//         try {
//             const selectedProjectObj = projects.find(p => p._id === selectedProject || p.title === selectedProject);
//             const selectedTaskObj = tasks.find(t => t._id === selectedTask || t.title === selectedTask);

//             const newEntry = {
//                 projectId: selectedProjectObj?._id || selectedProject,
//                 projectName: selectedProjectObj?.title || selectedProject,
//                 taskId: selectedTaskObj?._id || selectedTask,
//                 taskName: selectedTaskObj?.title || selectedTask,
//                 date: format(date, "yyyy-MM-dd"),
//                 startTime: currentTime,
//                 endTime: endTime,
//                 duration: "2h 00m",
//                 notes: notes
//             };

//             const response = await axios.post("http://localhost:5000/api/timesheets", newEntry, {
//                 withCredentials: true
//             });

//             if (response.data && response.data.newEntry) {
//                 setTimeEntries((prevEntries) => [...prevEntries, response.data.newEntry]);

//                 // Clear form
//                 setSelectedProject("");
//                 setSelectedTask("");
//                 setNotes("");

//                 toast({
//                     title: "Success",
//                     description: "Time entry added successfully",
//                 });
//             }
//         } catch (error) {
//             console.error("Error adding time entry:", error);
//             toast({
//                 title: "Error",
//                 description: "Failed to add time entry",
//                 variant: "destructive",
//             });
//         }
//     };

//     // Update a time entry
//     const updateTimeEntry = async () => {
//         if (!editingEntry || !editProject || !editTask) {
//             toast({
//                 title: "Validation Error",
//                 description: "Please fill in all required fields",
//                 variant: "destructive",
//             });
//             return;
//         }

//         try {
//             // Calculate duration from start and end times
//             const [startHour, startMin] = editStartTime.split(":").map(Number);
//             const [endHour, endMin] = editEndTime.split(":").map(Number);

//             let hours = endHour - startHour;
//             let minutes = endMin - startMin;

//             if (minutes < 0) {
//                 hours--;
//                 minutes += 60;
//             }

//             if (hours < 0) {
//                 hours += 24; // Assuming work doesn't span multiple days
//             }

//             const duration = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

//             const selectedProjectObj = projects.find(p => p._id === editProject || p.title === editProject);
//             const selectedTaskObj = tasks.find(t => t._id === editTask || t.title === editTask);

//             const updatedEntry = {
//                 projectId: selectedProjectObj?._id || editProject,
//                 projectName: selectedProjectObj?.title || editProject,
//                 taskId: selectedTaskObj?._id || editTask,
//                 taskName: selectedTaskObj?.title || editTask,
//                 date: format(editDate, "yyyy-MM-dd"),
//                 startTime: editStartTime,
//                 endTime: editEndTime,
//                 duration: duration,
//                 notes: editNotes
//             };

//             const response = await axios.put(`http://localhost:5000/api/timesheets/${editingEntry._id}`, updatedEntry, {
//                 withCredentials: true
//             });

//             if (response.data && response.data.entry) {
//                 // Update local state
//                 setTimeEntries(prevEntries =>
//                     prevEntries.map(entry =>
//                         entry._id === editingEntry._id ? response.data.entry : entry
//                     )
//                 );

//                 // Close dialog and reset form
//                 setIsDialogOpen(false);
//                 setEditingEntry(null);

//                 toast({
//                     title: "Success",
//                     description: "Time entry updated successfully",
//                 });
//             }
//         } catch (error) {
//             console.error("Error updating time entry:", error);
//             toast({
//                 title: "Error",
//                 description: "Failed to update time entry",
//                 variant: "destructive",
//             });
//         }
//     };

//     // Delete a time entry
//     const deleteTimeEntry = async () => {
//         if (!entryToDelete) return;

//         try {
//             await axios.delete(`http://localhost:5000/api/timesheets/${entryToDelete._id}`, {
//                 withCredentials: true
//             });

//             // Update local state
//             setTimeEntries(prevEntries =>
//                 prevEntries.filter(entry => entry._id !== entryToDelete._id)
//             );

//             // Close dialog
//             setIsDeleteDialogOpen(false);
//             setEntryToDelete(null);

//             toast({
//                 title: "Success",
//                 description: "Time entry deleted successfully",
//             });
//         } catch (error) {
//             console.error("Error deleting time entry:", error);
//             toast({
//                 title: "Error",
//                 description: "Failed to delete time entry",
//                 variant: "destructive",
//             });
//         }
//     };

//     // Open edit dialog with entry data
//     const openEditDialog = (entry) => {
//         setEditingEntry(entry);
//         setEditProject(entry.projectId || entry.project);
//         setEditTask(entry.taskId || entry.task);
//         setEditDate(new Date(entry.date));
//         setEditStartTime(entry.startTime);
//         setEditEndTime(entry.endTime);
//         setEditNotes(entry.notes || "");
//         setIsDialogOpen(true);
//     };

//     // Open delete confirmation dialog
//     const openDeleteDialog = (entry) => {
//         setEntryToDelete(entry);
//         setIsDeleteDialogOpen(true);
//     };

//     const formatTime = (seconds: number) => {
//         const hours = Math.floor(seconds / 3600);
//         const minutes = Math.floor((seconds % 3600) / 60);
//         const secs = seconds % 60;
//         return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     };

//     const startTimer = () => {
//         if (!selectedProject || !selectedTask) {
//             toast({
//                 title: "Validation Error",
//                 description: "Please select a project and task before starting the timer",
//                 variant: "destructive",
//             });
//             return;
//         }

//         setIsTracking(true);
//         setStartedAt(new Date());
//         const id = setInterval(() => {
//             setElapsedTime(prev => prev + 1);
//         }, 1000);
//         setIntervalId(id);
//     };

//     const stopTimer = async () => {
//         if (!startedAt) return;

//         setIsTracking(false);
//         if (intervalId) {
//             clearInterval(intervalId);
//             setIntervalId(null);
//         }

//         // Only save time entry if we tracked for at least 1 minute
//         if (elapsedTime > 60) {
//             const endTime = new Date();
//             const hours = Math.floor(elapsedTime / 3600);
//             const minutes = Math.floor((elapsedTime % 3600) / 60);
//             const duration = `${hours}h ${minutes.toString().padStart(2, '0')}m`;

//             // Format times as HH:MM
//             const startTimeStr = `${startedAt.getHours().toString().padStart(2, '0')}:${startedAt.getMinutes().toString().padStart(2, '0')}`;
//             const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

//             const selectedProjectObj = projects.find(p => p._id === selectedProject || p.title === selectedProject);
//             const selectedTaskObj = tasks.find(t => t._id === selectedTask || t.title === selectedTask);

//             try {
//                 const newEntry = {
//                     projectId: selectedProjectObj?._id || selectedProject,
//                     projectName: selectedProjectObj?.title || selectedProject,
//                     taskId: selectedTaskObj?._id || selectedTask,
//                     taskName: selectedTaskObj?.title || selectedTask,
//                     date: format(date, "yyyy-MM-dd"),
//                     startTime: startTimeStr,
//                     endTime: endTimeStr,
//                     duration: duration,
//                     notes: notes
//                 };

//                 const response = await axios.post("http://localhost:5000/api/timesheets", newEntry, {
//                     withCredentials: true
//                 });

//                 if (response.data && response.data.newEntry) {
//                     setTimeEntries((prevEntries) => [...prevEntries, response.data.newEntry]);

//                     toast({
//                         title: "Time Entry Created",
//                         description: `Tracked ${duration} for ${selectedProjectObj?.title || selectedProject}`,
//                     });
//                 }
//             } catch (error) {
//                 console.error("Error adding time entry:", error);
//                 toast({
//                     title: "Error",
//                     description: "Failed to save tracked time",
//                     variant: "destructive",
//                 });
//             }
//         }

//         // Reset timer and states
//         setElapsedTime(0);
//         setStartedAt(null);
//     };

//     return (
//         <div className="space-y-6 animate-fade-in">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <h1 className="text-2xl font-bold">Timesheet</h1>
//                 <div className="flex items-center gap-3">
//                     <Popover>
//                         <PopoverTrigger asChild>
//                             <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
//                                 <CalendarIcon className="mr-2 h-4 w-4" />
//                                 {format(date, "PPP")}
//                             </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0">
//                             <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
//                         </PopoverContent>
//                     </Popover>
//                     <Button onClick={addTimeEntry} className="gap-2">
//                         <Plus size={16} />
//                         <span className="hidden sm:inline">New Entry</span>
//                     </Button>
//                 </div>
//             </div>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>Time Tracker</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
//                         <div className="md:col-span-2">
//                             <Select value={selectedProject} onValueChange={setSelectedProject} disabled={isTracking}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select Project" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {projects.length > 0 ? (
//                                         projects.map(project => (
//                                             <SelectItem key={project._id} value={project._id || project.title}>
//                                                 {project.title}
//                                             </SelectItem>
//                                         ))
//                                     ) : (
//                                         <>
//                                             <SelectItem value="Website Redesign">Website Redesign</SelectItem>
//                                             <SelectItem value="Mobile App">Mobile App</SelectItem>
//                                             <SelectItem value="Dashboard">Dashboard</SelectItem>
//                                         </>
//                                     )}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="md:col-span-2">
//                             {selectedProject ? (
//                                 <Select value={selectedTask} onValueChange={setSelectedTask} disabled={isTracking}>
//                                     <SelectTrigger>
//                                         <SelectValue placeholder="Select Task" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         {filteredTasks.length > 0 ? (
//                                             filteredTasks.map(task => (
//                                                 <SelectItem key={task._id} value={task._id || task.title}>
//                                                     {task.title}
//                                                 </SelectItem>
//                                             ))
//                                         ) : (
//                                             <SelectItem value="No tasks available">No tasks available</SelectItem>
//                                         )}
//                                     </SelectContent>
//                                 </Select>
//                             ) : (
//                                 <Input
//                                     placeholder="Select a project first"
//                                     disabled={true}
//                                 />
//                             )}
//                         </div>
//                         <div className="md:col-span-1">
//                             <Input
//                                 value={notes}
//                                 onChange={(e) => setNotes(e.target.value)}
//                                 placeholder="Notes (optional)"
//                                 disabled={isTracking}
//                             />
//                         </div>
//                         <div className="flex items-center gap-3 md:col-span-1">
//                             <div className="font-mono text-lg w-24">{formatTime(elapsedTime)}</div>
//                             <Button
//                                 variant={isTracking ? "destructive" : "default"}
//                                 size="icon"
//                                 onClick={isTracking ? stopTimer : startTimer}
//                             >
//                                 {isTracking ? <Pause size={16} /> : <Play size={16} />}
//                             </Button>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Card>
//                 <CardHeader>
//                     <CardTitle>Recent Time Entries</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Project</TableHead>
//                                 <TableHead>Task</TableHead>
//                                 <TableHead>Date</TableHead>
//                                 <TableHead>Duration</TableHead>
//                                 <TableHead>Time</TableHead>
//                                 <TableHead>Notes</TableHead>
//                                 <TableHead className="w-[100px] text-right">Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {timeEntries.length > 0 ? (
//                                 timeEntries.map((entry: any) => (
//                                     <TableRow key={entry._id}>
//                                         <TableCell className="font-medium">
//                                             {entry.projectName || entry.project}
//                                         </TableCell>
//                                         <TableCell>
//                                             {entry.taskName || entry.task}
//                                         </TableCell>
//                                         <TableCell>
//                                             {new Date(entry.date).toLocaleDateString()}
//                                         </TableCell>
//                                         <TableCell>{entry.duration}</TableCell>
//                                         <TableCell>{`${entry.startTime} - ${entry.endTime}`}</TableCell>
//                                         <TableCell>{entry.notes}</TableCell>
//                                         <TableCell className="text-right">
//                                             <div className="flex justify-end gap-2">
//                                                 <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
//                                                     <Edit size={16} />
//                                                 </Button>
//                                                 <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(entry)}>
//                                                     <Trash2 size={16} />
//                                                 </Button>
//                                             </div>
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={7} className="text-center py-6">
//                                         No time entries found. Start tracking your time!
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>

//             {/* Edit Dialog */}
//             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//                 <DialogContent className="sm:max-w-[500px]">
//                     <DialogHeader>
//                         <DialogTitle>Edit Time Entry</DialogTitle>
//                     </DialogHeader>
//                     <div className="grid gap-4 py-4">
//                         <div className="grid gap-2">
//                             <Label htmlFor="project">Project</Label>
//                             <Select value={editProject} onValueChange={setEditProject}>
//                                 <SelectTrigger id="project">
//                                     <SelectValue placeholder="Select Project" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {projects.length > 0 ? (
//                                         projects.map(project => (
//                                             <SelectItem key={project._id} value={project._id || project.title}>
//                                                 {project.title}
//                                             </SelectItem>
//                                         ))
//                                     ) : (
//                                         <>
//                                             <SelectItem value="Website Redesign">Website Redesign</SelectItem>
//                                             <SelectItem value="Mobile App">Mobile App</SelectItem>
//                                             <SelectItem value="Dashboard">Dashboard</SelectItem>
//                                         </>
//                                     )}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="grid gap-2">
//                             <Label htmlFor="task">Task</Label>
//                             <Select value={selectedTask} onValueChange={setSelectedTask} disabled={!selectedProject}>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder="Select Task" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {filteredTasks.map((task) => (
//                                         <SelectItem key={task._id} value={task._id}>
//                                             {task.name}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                             <div className="grid gap-2">
//                                 <Label htmlFor="date">Date</Label>
//                                 <Popover>
//                                     <PopoverTrigger asChild>
//                                         <Button
//                                             id="date"
//                                             variant="outline"
//                                             className="w-full justify-start text-left font-normal"
//                                         >
//                                             <CalendarIcon className="mr-2 h-4 w-4" />
//                                             {format(editDate, "PPP")}
//                                         </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent className="w-auto p-0">
//                                         <Calendar
//                                             mode="single"
//                                             selected={editDate}
//                                             onSelect={(date) => date && setEditDate(date)}
//                                             initialFocus
//                                         />
//                                     </PopoverContent>
//                                 </Popover>
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="startTime">Start Time</Label>
//                                 <Input
//                                     id="startTime"
//                                     type="time"
//                                     value={editStartTime}
//                                     onChange={(e) => setEditStartTime(e.target.value)}
//                                 />
//                             </div>
//                             <div className="grid gap-2">
//                                 <Label htmlFor="endTime">End Time</Label>
//                                 <Input
//                                     id="endTime"
//                                     type="time"
//                                     value={editEndTime}
//                                     onChange={(e) => setEditEndTime(e.target.value)}
//                                 />
//                             </div>
//                         </div>
//                         <div className="grid gap-2">
//                             <Label htmlFor="notes">Notes</Label>
//                             <Textarea
//                                 id="notes"
//                                 value={editNotes}
//                                 onChange={(e) => setEditNotes(e.target.value)}
//                                 placeholder="Add any notes about this time entry"
//                             />
//                         </div>
//                     </div>
//                     <DialogFooter>
//                         <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                             Cancel
//                         </Button>
//                         <Button onClick={updateTimeEntry}>Save Changes</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             {/* Delete Confirmation Dialog */}
//             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//                 <AlertDialogContent>
//                     <AlertDialogHeader>
//                         <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//                         <AlertDialogDescription>
//                             This action cannot be undone. This will permanently delete the time entry
//                             from your timesheet.
//                         </AlertDialogDescription>
//                     </AlertDialogHeader>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction onClick={deleteTimeEntry} className="bg-red-600 hover:bg-red-700">
//                             Delete
//                         </AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>
//         </div>
//     );
// };

// export default Timesheet;