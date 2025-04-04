
// import React from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Switch } from "@/components/ui/switch";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useTheme } from "@/context/ThemeContext";
// import { Clock, Bell, Globe, Shield, Users } from "lucide-react";

// const Settings = () => {
//   const { theme } = useTheme();

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Settings</h1>
//         <Button>Save Changes</Button>
//       </div>

//       <Tabs defaultValue="account" className="w-full">
//         <TabsList className="grid grid-cols-5 w-full mb-6">
//           <TabsTrigger value="account">Account</TabsTrigger>
//           <TabsTrigger value="appearance">Appearance</TabsTrigger>
//           <TabsTrigger value="notifications">Notifications</TabsTrigger>
//           <TabsTrigger value="privacy">Privacy</TabsTrigger>
//           <TabsTrigger value="integrations">Integrations</TabsTrigger>
//         </TabsList>

//         <TabsContent value="account" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Profile Information</CardTitle>
//               <CardDescription>
//                 Update your account details and profile information.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="firstName">First Name</Label>
//                   <Input id="firstName" defaultValue="Manjay" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastName">Last Name</Label>
//                   <Input id="lastName" defaultValue="Gupta" />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email Address</Label>
//                 <Input id="email" type="email" defaultValue="manjay.gupta@example.com" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="title">Job Title</Label>
//                 <Input id="title" defaultValue="UX/UI Designer" />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="bio">Bio</Label>
//                 <Textarea 
//                   id="bio" 
//                   rows={4} 
//                   defaultValue="UX/UI Designer with 5+ years of experience in creating user-centered designs for web and mobile applications."
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Password</CardTitle>
//               <CardDescription>
//                 Update your password to keep your account secure.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="currentPassword">Current Password</Label>
//                 <Input id="currentPassword" type="password" />
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="newPassword">New Password</Label>
//                   <Input id="newPassword" type="password" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm New Password</Label>
//                   <Input id="confirmPassword" type="password" />
//                 </div>
//               </div>
//               <Button size="sm">Update Password</Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Danger Zone</CardTitle>
//               <CardDescription>
//                 Permanently delete your account and all associated data.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-md">
//                 <h3 className="text-lg font-medium text-red-700 dark:text-red-400">Delete Account</h3>
//                 <p className="text-sm text-red-600 dark:text-red-300 mt-1 mb-4">
//                   Once you delete your account, there is no going back. All data will be permanently removed.
//                 </p>
//                 <Button variant="destructive" size="sm">Delete Account</Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="appearance" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Theme Preferences</CardTitle>
//               <CardDescription>
//                 Customize the appearance of the application.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-2">
//                 <Label>Color Theme</Label>
//                 <div className="flex items-center space-x-4">
//                   <div className={`p-4 border rounded-md cursor-pointer ${theme === 'light' ? 'ring-2 ring-primary' : ''}`}>
//                     <div className="w-16 h-16 bg-white border"></div>
//                     <p className="text-center mt-2 text-sm">Light</p>
//                   </div>
//                   <div className={`p-4 border rounded-md cursor-pointer ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`}>
//                     <div className="w-16 h-16 bg-gray-900 border"></div>
//                     <p className="text-center mt-2 text-sm">Dark</p>
//                   </div>
//                   <div className="p-4 border rounded-md cursor-pointer">
//                     <div className="w-16 h-16 bg-gradient-to-b from-white to-gray-900 border"></div>
//                     <p className="text-center mt-2 text-sm">System</p>
//                   </div>
//                 </div>
//               </div>
//               <Separator />
//               <div className="space-y-4">
//                 <Label>Accent Color</Label>
//                 <div className="grid grid-cols-5 gap-4">
//                   <div className="p-4 border rounded-md cursor-pointer ring-2 ring-primary">
//                     <div className="w-full h-6 bg-yellow-500 rounded-md"></div>
//                     <p className="text-center mt-2 text-sm">Yellow</p>
//                   </div>
//                   <div className="p-4 border rounded-md cursor-pointer">
//                     <div className="w-full h-6 bg-blue-500 rounded-md"></div>
//                     <p className="text-center mt-2 text-sm">Blue</p>
//                   </div>
//                   <div className="p-4 border rounded-md cursor-pointer">
//                     <div className="w-full h-6 bg-green-500 rounded-md"></div>
//                     <p className="text-center mt-2 text-sm">Green</p>
//                   </div>
//                   <div className="p-4 border rounded-md cursor-pointer">
//                     <div className="w-full h-6 bg-purple-500 rounded-md"></div>
//                     <p className="text-center mt-2 text-sm">Purple</p>
//                   </div>
//                   <div className="p-4 border rounded-md cursor-pointer">
//                     <div className="w-full h-6 bg-red-500 rounded-md"></div>
//                     <p className="text-center mt-2 text-sm">Red</p>
//                   </div>
//                 </div>
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label htmlFor="densityToggle">Compact Mode</Label>
//                   <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
//                 </div>
//                 <Switch id="densityToggle" />
//               </div>
//               <Separator />
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <Label htmlFor="animationsToggle">Interface Animations</Label>
//                   <p className="text-sm text-muted-foreground">Show animations and transitions</p>
//                 </div>
//                 <Switch id="animationsToggle" defaultChecked />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="notifications" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Notification Preferences</CardTitle>
//               <CardDescription>
//                 Manage how you receive notifications.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Bell size={20} />
//                     <div>
//                       <Label htmlFor="taskNotifications">Task Notifications</Label>
//                       <p className="text-sm text-muted-foreground">Get notified about task updates and deadlines</p>
//                     </div>
//                   </div>
//                   <Switch id="taskNotifications" defaultChecked />
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Users size={20} />
//                     <div>
//                       <Label htmlFor="teamNotifications">Team Notifications</Label>
//                       <p className="text-sm text-muted-foreground">Get notified about team activities and mentions</p>
//                     </div>
//                   </div>
//                   <Switch id="teamNotifications" defaultChecked />
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Globe size={20} />
//                     <div>
//                       <Label htmlFor="systemNotifications">System Notifications</Label>
//                       <p className="text-sm text-muted-foreground">Get notified about system updates and maintenance</p>
//                     </div>
//                   </div>
//                   <Switch id="systemNotifications" />
//                 </div>
//               </div>

//               <div className="space-y-4 pt-4">
//                 <h3 className="text-lg font-medium">Email Notification Frequency</h3>
//                 <div className="space-y-2">
//                   <Select defaultValue="daily">
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select frequency" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="realtime">Real-time</SelectItem>
//                       <SelectItem value="hourly">Hourly Digest</SelectItem>
//                       <SelectItem value="daily">Daily Digest</SelectItem>
//                       <SelectItem value="weekly">Weekly Digest</SelectItem>
//                       <SelectItem value="never">Never</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-muted-foreground">
//                     Choose how often you receive email notifications for activities.
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="privacy" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Privacy Settings</CardTitle>
//               <CardDescription>
//                 Control your privacy and security preferences.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Shield size={20} />
//                     <div>
//                       <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
//                       <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
//                     </div>
//                   </div>
//                   <Switch id="twoFactorAuth" />
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Users size={20} />
//                     <div>
//                       <Label htmlFor="profileVisibility">Profile Visibility</Label>
//                       <p className="text-sm text-muted-foreground">Control who can see your profile information</p>
//                     </div>
//                   </div>
//                   <Select defaultValue="team">
//                     <SelectTrigger className="w-[160px]">
//                       <SelectValue placeholder="Select visibility" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="public">Public</SelectItem>
//                       <SelectItem value="team">Team Only</SelectItem>
//                       <SelectItem value="private">Private</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-start gap-3">
//                     <Clock size={20} />
//                     <div>
//                       <Label htmlFor="activityTracking">Activity Tracking</Label>
//                       <p className="text-sm text-muted-foreground">Allow system to track your activity for better insights</p>
//                     </div>
//                   </div>
//                   <Switch id="activityTracking" defaultChecked />
//                 </div>
//               </div>

//               <div className="space-y-4 pt-4">
//                 <h3 className="text-lg font-medium">Data Management</h3>
//                 <div className="space-y-2">
//                   <p className="text-sm text-muted-foreground">
//                     Download a copy of your personal data or request data deletion.
//                   </p>
//                   <div className="flex gap-3">
//                     <Button variant="outline" size="sm">Download Data</Button>
//                     <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
//                       Request Deletion
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="integrations" className="space-y-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Integrations</CardTitle>
//               <CardDescription>
//                 Connect third-party services to enhance your workflow.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
//                       <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M18.5 12.5H16.5C15.9477 12.5 15.5 12.9477 15.5 13.5V15.5C15.5 16.0523 15.9477 16.5 16.5 16.5H18.5C19.0523 16.5 19.5 16.0523 19.5 15.5V13.5C19.5 12.9477 19.0523 12.5 18.5 12.5Z" stroke="currentColor" strokeWidth="1.5" />
//                         <path d="M7.5 7.5H5.5C4.94772 7.5 4.5 7.94772 4.5 8.5V10.5C4.5 11.0523 4.94772 11.5 5.5 11.5H7.5C8.05228 11.5 8.5 11.0523 8.5 10.5V8.5C8.5 7.94772 8.05228 7.5 7.5 7.5Z" stroke="currentColor" strokeWidth="1.5" />
//                         <path d="M7 15L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="font-medium">Slack</h3>
//                       <p className="text-sm text-muted-foreground">Get task notifications in your Slack workspace</p>
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm">Connect</Button>
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
//                       <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="1.5" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="font-medium">Google Calendar</h3>
//                       <p className="text-sm text-muted-foreground">Sync tasks with your Google Calendar</p>
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm" className="text-green-600">Connected</Button>
//                 </div>
//                 <Separator />
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
//                       <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z" stroke="currentColor" strokeWidth="1.5" />
//                         <path d="M7 13.0001L8.5 14.5001L10 13.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M14 13.0001L15.5 14.5001L17 13.0001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M8.5 14.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                         <path d="M15.5 14.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="font-medium">GitHub</h3>
//                       <p className="text-sm text-muted-foreground">Link tasks to GitHub issues and PRs</p>
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm">Connect</Button>
//                 </div>
//               </div>

//               <div className="space-y-4 pt-4">
//                 <h3 className="text-lg font-medium">API Access</h3>
//                 <div className="space-y-2">
//                   <p className="text-sm text-muted-foreground">
//                     Generate API tokens to integrate with custom services or applications.
//                   </p>
//                   <Button size="sm">Generate API Token</Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default Settings;

