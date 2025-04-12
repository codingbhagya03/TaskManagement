import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, Plus, MoreHorizontal, Play, Pause, Edit, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

const Timesheet = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timeEntries, setTimeEntries] = useState([]);

  // Replace projects and tasks with users
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API URLs
  const USER_API_URL = "http://localhost:5000/api/members";
  const TIMESHEET_API_URL = "http://localhost:5000/api/timesheets";

  const fetchUsers = async () => {
    try {
      const response = await axios.get(USER_API_URL, { withCredentials: true });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Fetch Timesheets
  const fetchTimesheets = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(TIMESHEET_API_URL, { withCredentials: true });
      setTimeEntries(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load timesheets", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTimesheets();
  }, []);

  const resetForm = () => {
    setSelectedUser("");
    setStartTime("");
    setEndTime("");
    setIsEditing(false);
    setEditingEntry(null);
  };

  // Calculate duration from start and end times
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";

    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    let hours = endHour - startHour;
    let minutes = endMin - startMin;

    if (minutes < 0) {
      hours--;
      minutes += 60;
    }

    if (hours < 0) {
      hours += 24; // Assuming work doesn't span multiple days
    }

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  // Add a new time entry or update existing one
  const saveTimeEntry = async () => {
    if (!selectedUser || !startTime || !endTime) {
      toast({ title: "Missing Info", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const userObj = users.find((u) => u._id === selectedUser);
    const entryData = {
      userId: selectedUser,
      userName: userObj?.name || "",
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime), // Calculate duration before saving
    };

    try {
      setIsLoading(true);
      let response;
      if (isEditing && editingEntry) {
        response = await axios.put(`${TIMESHEET_API_URL}/${editingEntry._id}`, entryData, { withCredentials: true });
        setTimeEntries((entries) => entries.map((entry) => (entry._id === editingEntry._id ? response.data.entry : entry)));
        toast({ title: "Updated", description: "Time entry updated successfully" });
      } else {
        response = await axios.post(TIMESHEET_API_URL, entryData, { withCredentials: true });
        setTimeEntries((entries) => [...entries, response.data.newEntry]);
        toast({ title: "Added", description: "New time entry created successfully" });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Save error details:", error.response?.data || error.message || error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to save time entry", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit existing entry
  const editEntry = (entry) => {
    setEditingEntry(entry);
    setSelectedUser(entry.userId);
    setDate(new Date(entry.date));
    setStartTime(entry.startTime);
    setEndTime(entry.endTime);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // Delete time entry
  const deleteEntry = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`${TIMESHEET_API_URL}/${id}`, { withCredentials: true });
      setTimeEntries(entries => entries.filter(entry => entry._id !== id));
      setShowDeleteConfirm(false);
      setEntryToDelete(null);

      toast({
        title: "Entry deleted",
        description: "Time entry was removed successfully"
      });
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    const now = new Date();
    setStartTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    setIsTracking(true);
    const id = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const stopTimer = () => {
    setIsTracking(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const now = new Date();
    setEndTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Timesheet</h1>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">New Entry</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-mono text-lg w-24">{formatTime(elapsedTime)}</div>
              <Button
                variant={isTracking ? "destructive" : "default"}
                size="icon"
                onClick={isTracking ? stopTimer : startTimer}
                disabled={isTracking ? false : !selectedUser}
              >
                {isTracking ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Time Entries</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchTimesheets} disabled={isLoading}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No time entries found. Start tracking your time!
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries.map((entry) => (
                    <TableRow key={entry._id}>
                      <TableCell>{entry.userName}</TableCell>
                      <TableCell>{format(new Date(entry.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{entry.startTime}</TableCell>
                      <TableCell>{entry.endTime}</TableCell>
                      <TableCell>{entry.duration}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => editEntry(entry)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => confirmDelete(entry)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Time Entry" : "Add New Time Entry"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the information for this time entry"
                : "Fill in the details to add a new time entry"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Date</label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">User</label>
              <div className="col-span-3">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Start Time</label>
              <div className="col-span-3">
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">End Time</label>
              <div className="col-span-3">
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveTimeEntry} disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Entry" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteEntry(entryToDelete?._id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Timesheet;