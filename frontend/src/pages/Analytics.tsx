
// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// const Analytics = () => {
//   const [timeRange, setTimeRange] = useState("week");

//   // Task completion data
//   const taskData = [
//     { name: "Mon", completed: 5, pending: 2 },
//     { name: "Tue", completed: 8, pending: 3 },
//     { name: "Wed", completed: 6, pending: 4 },
//     { name: "Thu", completed: 9, pending: 2 },
//     { name: "Fri", completed: 7, pending: 1 },
//     { name: "Sat", completed: 4, pending: 2 },
//     { name: "Sun", completed: 3, pending: 1 },
//   ];

//   // Task distribution data
//   const distributionData = [
//     { name: "Development", value: 40 },
//     { name: "Design", value: 25 },
//     { name: "Research", value: 15 },
//     { name: "Meetings", value: 20 },
//   ];

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

//   return (
//     <div className="space-y-6 animate-fade-in">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
//         <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
//           <TabsList className="grid grid-cols-3 w-full sm:w-[300px]">
//             <TabsTrigger value="week">This Week</TabsTrigger>
//             <TabsTrigger value="month">This Month</TabsTrigger>
//             <TabsTrigger value="year">This Year</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="stat-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base font-medium">Total Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">127</div>
//             <p className="text-sm text-muted-foreground mt-1">
//               <span className="text-green-500">↑ 14%</span> from last {timeRange}
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card className="stat-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base font-medium">Completed Tasks</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">95</div>
//             <p className="text-sm text-muted-foreground mt-1">
//               <span className="text-green-500">↑ 7%</span> from last {timeRange}
//             </p>
//           </CardContent>
//         </Card>
        
//         <Card className="stat-card">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base font-medium">Completion Rate</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">74.8%</div>
//             <p className="text-sm text-muted-foreground mt-1">
//               <span className="text-red-500">↓ 2%</span> from last {timeRange}
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>Task Completion</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={350}>
//               <BarChart
//                 data={taskData}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="completed" stackId="a" fill="#FFBA00" />
//                 <Bar dataKey="pending" stackId="a" fill="#99700" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Task Distribution</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={350}>
//               <PieChart>
//                 <Pie
//                   data={distributionData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={120}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {distributionData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Productivity Insights</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div>
//               <h3 className="font-medium mb-2">Most Productive Day</h3>
//               <div className="flex items-center gap-4">
//                 <div className="text-2xl font-bold">Thursday</div>
//                 <div className="text-sm text-muted-foreground">9 tasks completed on average</div>
//               </div>
//             </div>
//             <Separator />
//             <div>
//               <h3 className="font-medium mb-2">Least Productive Day</h3>
//               <div className="flex items-center gap-4">
//                 <div className="text-2xl font-bold">Sunday</div>
//                 <div className="text-sm text-muted-foreground">3 tasks completed on average</div>
//               </div>
//             </div>
//             <Separator />
//             <div>
//               <h3 className="font-medium mb-2">Peak Productivity Hours</h3>
//               <div className="flex items-center gap-4">
//                 <div className="text-2xl font-bold">10:00 AM - 12:00 PM</div>
//                 <div className="text-sm text-muted-foreground">42% of tasks completed during this time</div>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Analytics;
