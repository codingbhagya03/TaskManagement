import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import Select from "react-select";

const ROLES_API_URL = "http://localhost:5000/api/members/roles";

const Settings = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [user, setUser] = useState({ fullName: "", email: "", roles: [] });
  const [loading, setLoading] = useState(true);
  const [roleOptions, setRoleOptions] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");

  // Fetch user details and roles on component mount and poll for updates
  useEffect(() => {
    fetchUserData();
    fetchRoles();

    const interval = setInterval(() => {
      fetchUserData();
      fetchRoles();
    }, 30000); // Poll every 30 seconds to ensure synchronization

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      const authRes = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });
      if (authRes.data.isAuthenticated) {
        const userRes = await axios.get(`http://localhost:5000/api/users/${authRes.data.userId}`, { withCredentials: true });
        console.log("User data from server:", userRes.data); // Debugging
        
        // Make sure roles is always an array
        const roles = Array.isArray(userRes.data.roles) ? userRes.data.roles : [];
        
        setUser({ 
          fullName: userRes.data.name || '', 
          email: userRes.data.email || '',
          roles: roles 
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showToast("Error loading user data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get(ROLES_API_URL, { withCredentials: true });
      console.log("Roles data from server:", response.data); // Debugging
      
      if (Array.isArray(response.data)) {
        const formattedRoles = response.data.map((role) => ({
          value: role,
          label: role
        }));
        setRoleOptions(formattedRoles);
      } else {
        console.error("Roles data is not an array:", response.data);
        showToast("Invalid roles data format", "error");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      showToast("Error loading available roles", "error");
    }
  };

  // Function to show toast notifications
  const showToast = (message, type = "default") => {
    toast({
      title: type === "error" ? "Error" : "Success",
      description: message,
      variant: type === "error" ? "destructive" : "default",
      duration: 10000, // 10 seconds
    });
  };

  // Handle input change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle role selection change
  const handleRoleChange = (selectedOptions) => {
    const roles = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setUser({ ...user, roles });
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      // First, get the current user ID
      const authRes = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });
      if (authRes.data.isAuthenticated) {
        // Include userId in the update request
        await axios.put(`http://localhost:5000/api/users/update`,
          { ...user, userId: authRes.data.userId },
          { withCredentials: true }
        );
        showToast("Profile updated successfully!");
      } else {
        showToast("You must be logged in to update your profile.", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      showToast(`Failed to update profile: ${error.response?.data?.message || error.message}`, "error");
    }
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.id]: e.target.value });
    setPasswordError("");
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    // Validate password is not empty
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    try {
      // Get the user ID first
      const authRes = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });

      if (!authRes.data.isAuthenticated) {
        setPasswordError("You must be logged in to update your password");
        return;
      }

      await axios.put(
        "http://localhost:5000/api/users/password",
        {
          ...passwordData,
          userId: authRes.data.userId
        },
        { withCredentials: true }
      );

      showToast("Password updated successfully!");
      // Clear password fields
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      const errorMessage = error.response?.data?.message || "Failed to update password";
      setPasswordError(errorMessage);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmed) {
      try {
        // Get the user ID first
        const authRes = await axios.get("http://localhost:5000/check-auth", { withCredentials: true });

        if (!authRes.data.isAuthenticated) {
          showToast("You must be logged in to delete your account", "error");
          return;
        }

        // Since axios.delete doesn't allow a request body in the same way as put/post,
        // we need to use a different approach
        await axios.delete("http://localhost:5000/api/users/delete", {
          withCredentials: true,
          data: { userId: authRes.data.userId }
        });

        showToast("Account deleted successfully");
        // Redirect to login or home page
        window.location.href = "/login";
      } catch (error) {
        console.error("Error deleting account:", error);
        showToast("Failed to delete account: " + (error.response?.data?.message || error.message), "error");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-1 w-full mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details and profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="fullName" value={user.fullName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={user.email} onChange={handleChange} />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="roles">User Roles</Label>
                    <Select
                      isMulti
                      name="roles"
                      options={roleOptions}
                      value={roleOptions.filter((option) => 
                        user.roles && Array.isArray(user.roles) && user.roles.includes(option.value)
                      )}
                      onChange={handleRoleChange}
                    />
                  </div> */}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordError && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                      {passwordError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleUpdatePassword}>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                  <CardDescription>Permanently delete your account and all associated data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-md">
                    <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1 mb-4">
                      Once you delete your account, there is no going back. All data will be permanently removed.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;