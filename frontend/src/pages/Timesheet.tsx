import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Edit, Trash2, MapPin, Camera, Play, Pause } from "lucide-react";
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

// Define interfaces for verification responses
interface LocationVerificationResponse {
  verified: boolean;
  message?: string;
}

interface FaceVerificationResponse {
  verified: boolean;
  message?: string;
}

interface TimesheetEntry {
  _id: string;
  userId: string;
  memberId?: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  notes?: string;
  locationVerified?: boolean;
  faceVerified?: boolean;
}

interface User {
  _id: string;
  name: string;
}

const Timesheet = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimesheetEntry[]>([]);

  // Replace projects and tasks with users
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimesheetEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verification states
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [isVerifyingFace, setIsVerifyingFace] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [locationData, setLocationData] = useState<{ latitude: number, longitude: number } | null>(null);
  const [activeTrackingUser, setActiveTrackingUser] = useState("");

  // Video refs for face recognition
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // API URLs
  const USER_API_URL = "http://localhost:5000/api/members";
  const TIMESHEET_API_URL = "http://localhost:5000/api/timesheets";
  const VERIFICATION_API_URL = "http://localhost:5000/api/verification";

  const handleError = (error: any, operation: string) => {
    console.error(`Error in ${operation}:`, error);
    toast({
      title: "Error",
      description: `An error occurred while ${operation}. Your time tracking data is saved.`,
      variant: "destructive"
    });
  };

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

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Add this useEffect to warn users before leaving the page while tracking
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isTracking) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTracking]);

  // Add state persistence with localStorage
  useEffect(() => {
    const savedTrackingData = localStorage.getItem('timeTrackingData');
    if (savedTrackingData) {
      const data = JSON.parse(savedTrackingData);
      if (data.isTracking) {
        setIsTracking(true);
        setElapsedTime(data.elapsedTime);
        setStartTime(data.startTime);
        setActiveTrackingUser(data.activeTrackingUser);
        setSelectedUser(data.activeTrackingUser);
        setLocationVerified(data.locationVerified);
        setFaceVerified(data.faceVerified);

        // Restore the timer
        const savedStartTime = new Date(data.trackingStartTimestamp);
        const currentTime = new Date();
        const elapsed = Math.floor((currentTime.getTime() - savedStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);

        // Start the interval
        const id = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
        setIntervalId(id);
      }
    }
  }, []);

  // Save tracking state when it changes
  useEffect(() => {
    if (isTracking) {
      const trackingData = {
        isTracking,
        elapsedTime,
        startTime,
        activeTrackingUser,
        locationVerified,
        faceVerified,
        trackingStartTimestamp: new Date().getTime() - (elapsedTime * 1000) // Calculate when tracking started
      };
      localStorage.setItem('timeTrackingData', JSON.stringify(trackingData));
    } else {
      localStorage.removeItem('timeTrackingData');
    }
  }, [isTracking, elapsedTime, startTime, activeTrackingUser, locationVerified, faceVerified]);

  // Auto-save tracking state periodically
  useEffect(() => {
    let autoSaveInterval: NodeJS.Timeout;

    if (isTracking) {
      autoSaveInterval = setInterval(() => {
        const trackingData = {
          isTracking,
          elapsedTime,
          startTime,
          activeTrackingUser,
          locationVerified,
          faceVerified,
          trackingStartTimestamp: new Date().getTime() - (elapsedTime * 1000)
        };
        localStorage.setItem('timeTrackingData', JSON.stringify(trackingData));
      }, 30000); // Auto-save every 30 seconds
    }

    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [isTracking, elapsedTime, startTime, activeTrackingUser, locationVerified, faceVerified]);

  const resetVerification = () => {
    setLocationVerified(false);
    setFaceVerified(false);
    setVerificationError("");
    setIsVerifyingLocation(false);
    setIsVerifyingFace(false);
    setLocationData(null);

    // Stop camera if it's running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Calculate duration from start and end times
  const calculateDuration = (start: string, end: string): string => {
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

  // Save time entry
  const saveTimeEntry = async (entryDataParam = null) => {
    const entryData = entryDataParam || {
      userId: selectedUser,
      userName: users.find((u) => u._id === selectedUser)?.name || "",
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
      duration: calculateDuration(startTime, endTime),
      locationVerified,
      faceVerified,
      location: locationData
    };

    if (!entryData.userId || !entryData.startTime || !entryData.endTime) {
      toast({ title: "Missing Info", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(TIMESHEET_API_URL, entryData, { withCredentials: true });
      setTimeEntries((entries) => [...entries, response.data.newEntry]);
      toast({ title: "Added", description: "New time entry created successfully" });
    } catch (error: any) {
      console.error("Save error details:", error.response?.data || error.message || error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to save time entry", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete time entry
  const deleteEntry = async (id: string) => {
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

  const confirmDelete = (entry: TimesheetEntry) => {
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Safely format time display
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return "--:--";

    try {
      // Check if the time already includes "AM" or "PM"
      if (timeString.includes("AM") || timeString.includes("PM") ||
        timeString.includes("am") || timeString.includes("pm")) {
        return timeString; // Already formatted correctly
      }

      // For 24-hour format (HH:MM)
      if (timeString.match(/^\d{1,2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0);
        return format(date, "hh:mm a");
      }

      // Try standard date-time parsing
      return format(new Date(`1970-01-01T${timeString}`), "hh:mm a");
    } catch (error) {
      console.error("Error formatting time:", timeString, error);
      return timeString; // Return the original string if parsing fails
    }
  };

  // Start the verification process
  const initiateVerification = () => {
    if (!selectedUser) {
      toast({ title: "Select User", description: "Please select a user before starting time tracking", variant: "destructive" });
      return;
    }

    resetVerification();
    setShowVerificationDialog(true);
    verifyLocation();
  };

  // Location verification
  const verifyLocation = () => {
    setIsVerifyingLocation(true);
    setVerificationError("");

    if (!navigator.geolocation) {
      setVerificationError("Geolocation is not supported by your browser");
      setIsVerifyingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setLocationData({ latitude, longitude });

          // Make API call to server to verify location
          const response = await axios.post<LocationVerificationResponse>(
            `${VERIFICATION_API_URL}/location`,
            { latitude, longitude },
            { withCredentials: true }
          );

          if (response.data.verified) {
            setLocationVerified(true);
            toast({ title: "Location Verified", description: response.data.message || "Your location has been verified" });
            // Proceed to face verification
            startFaceVerification();
          } else {
            setVerificationError(response.data.message || "Failed to verify location");
            setIsVerifyingLocation(false);
          }
        } catch (error: any) {
          console.error("Location verification error:", error);
          setVerificationError(error.response?.data?.message || "Failed to verify location");
          setIsVerifyingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setVerificationError(`Location access denied: ${error.message}`);
        setIsVerifyingLocation(false);
      }
    );
  };

  // Face verification
  const startFaceVerification = () => {
    setIsVerifyingFace(true);
    setIsVerifyingLocation(false);

    // Access webcam
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch((error) => {
          console.error("Camera access error:", error);
          setVerificationError("Camera access denied. Please allow camera access to verify your identity.");
          setIsVerifyingFace(false);
        });
    } else {
      setVerificationError("Your browser doesn't support camera access");
      setIsVerifyingFace(false);
    }
  };

  // Capture photo and verify face
  const captureAndVerifyFace = async () => {
    if (!videoRef.current || !selectedUser) return;

    try {
      // Create a canvas to capture the photo
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not get canvas context");
      }

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg");

      // Convert base64 to blob for uploading
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Create form data for the API call
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");
      formData.append("userId", selectedUser);

      // Send to backend for verification
      const verificationResponse = await axios.post<FaceVerificationResponse>(
        `${VERIFICATION_API_URL}/face`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (verificationResponse.data.verified) {
        setFaceVerified(true);
        toast({ title: "Identity Verified", description: verificationResponse.data.message || "Your identity has been confirmed" });

        // Complete verification process
        completeVerification();
      } else {
        setVerificationError(verificationResponse.data.message || "Face verification failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Face verification error:", error);
      setVerificationError(error.response?.data?.message || "Failed to verify identity");
    }
  };

  // Complete the verification process and start the timer
  const completeVerification = () => {
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setShowVerificationDialog(false);

    // Start the timer
    const now = new Date();
    setStartTime(format(now, "HH:mm"));
    setIsTracking(true);
    setActiveTrackingUser(selectedUser); // Add this line
    const id = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    setIntervalId(id);

    toast({
      title: "Time Tracking Started",
      description: "Your location and identity have been verified"
    });
  };

  const stopTimer = () => {
    setIsTracking(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const now = new Date();
    const endTimeFormatted = format(now, "HH:mm");
    setEndTime(endTimeFormatted);

    // Clear localStorage
    localStorage.removeItem('timeTrackingData');

    // Automatically save the entry when stopping
    const userObj = users.find((u) => u._id === activeTrackingUser);
    const entryData = {
      userId: activeTrackingUser,
      userName: userObj?.name || "",
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime: endTimeFormatted,
      duration: calculateDuration(startTime, endTimeFormatted),
      locationVerified,
      faceVerified,
      location: locationData
    };

    saveTimeEntry(entryData);

    // Reset tracking state
    setActiveTrackingUser("");
    setElapsedTime(0);
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Select value={selectedUser} onValueChange={setSelectedUser} disabled={isTracking}>
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
                onClick={isTracking ? stopTimer : initiateVerification}
                disabled={isTracking ? false : !selectedUser}
              >
                {isTracking ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </div>
          </div>
          {isTracking && activeTrackingUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              Currently tracking time for: {users.find(u => u._id === activeTrackingUser)?.name}
            </div>
          )}
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
                      <TableCell>{formatTimeDisplay(entry.startTime)}</TableCell>
                      <TableCell>{formatTimeDisplay(entry.endTime)}</TableCell>
                      <TableCell>{entry.duration}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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

      {/* Add this near the top of your component to show recovery status */}
      {isTracking && activeTrackingUser && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
              <div>
                <span className="font-medium">Currently tracking time for: </span>
                {users.find(u => u._id === activeTrackingUser)?.name}
              </div>
              <div className="text-sm text-blue-600">
                Time tracking data is being saved automatically
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={(open) => {
        if (!open) resetVerification();
        setShowVerificationDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Identity & Location</DialogTitle>
            <DialogDescription>
              You must be in Ahmedabad and verify your identity to start time tracking.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            {/* Verification status indicators */}
            <div className="grid grid-cols-2 w-full gap-4">
              <div className={`flex items-center p-3 rounded-md border ${locationVerified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <MapPin className={locationVerified ? "text-green-500" : "text-gray-400"} size={18} />
                <span className="ml-2">Location</span>
                {locationVerified && <span className="ml-auto text-green-500 text-sm">Verified</span>}
              </div>

              <div className={`flex items-center p-3 rounded-md border ${faceVerified ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <Camera className={faceVerified ? "text-green-500" : "text-gray-400"} size={18} />
                <span className="ml-2">Identity</span>
                {faceVerified && <span className="ml-auto text-green-500 text-sm">Verified</span>}
              </div>
            </div>

            {/* Error message */}
            {verificationError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md w-full">
                {verificationError}
              </div>
            )}

            {/* Location verification section */}
            {isVerifyingLocation && (
              <div className="flex flex-col items-center space-y-3 w-full">
                <div className="animate-pulse flex space-x-2 items-center">
                  <MapPin className="text-blue-500" />
                  <span>Verifying your location...</span>
                </div>
              </div>
            )}

            {/* Face verification section */}
            {isVerifyingFace && (
              <div className="flex flex-col items-center space-y-3 w-full">
                <div className="w-full h-64 bg-gray-100 rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button onClick={captureAndVerifyFace} className="gap-2">
                  <Camera size={16} />
                  Verify Identity
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {locationVerified && faceVerified && (
              <Button onClick={completeVerification}>
                Start Tracking
              </Button>
            )}
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