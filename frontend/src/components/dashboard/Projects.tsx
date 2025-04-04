import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const API_URL = "http://localhost:5000/api/projects";

interface Project {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    budget: number;
    teamMembers: string;
}

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, { withCredentials: true });
            setProjects(response.data);
        } catch (error) {
            setError("Failed to fetch projects");
        } finally {
            setIsLoading(false);
        }
    };

    const formatRupees = (amount: number): string => {
        return amount.toLocaleString('en-IN');
    };

    return (
        <Card className="p-3 max-w-7xl w-full mx-auto mt-6">
            <CardHeader>
                <CardTitle>Project List</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <div className="text-center py-4">Loading projects...</div>}
                {error && <div className="text-red-500 py-4">{error}</div>}

                {
                    !isLoading && !error && projects.length > 0 && (
                        <Table>
                            <TableHeader className="bg-yellow-300">
                                <TableRow >
                                    <TableHead>Project Name</TableHead>
                                    <TableHead>Project Description</TableHead>
                                    <TableHead>Team Members</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Budget (₹)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    projects.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center p-4">No projects found</td>
                                        </tr>
                                    ) : (
                                        projects.map(project => (
                                            <TableRow key={project._id}>
                                                <TableCell>{project.name}</TableCell>
                                                <TableCell>{project.description}</TableCell>
                                                <TableCell>{project.teamMembers}</TableCell>
                                                <TableCell>{project.startDate}</TableCell>
                                                <TableCell>{project.endDate}</TableCell>
                                                <TableCell>₹{formatRupees(project.budget)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                            </TableBody>
                        </Table>
                    )}
            </CardContent>
        </Card>
    );
};

export default Projects;