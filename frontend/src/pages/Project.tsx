import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash, AlertTriangle } from "lucide-react";
import Select from "react-select";

const PROJECT_API_URL = "http://localhost:5000/api/projects";
const MEMBERS_API_URL = "http://localhost:5000/api/members";

interface Project {
    _id?: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    budget: number;
    teamMembers: string[];  // Changed to array of strings
}

interface Member {
    _id: string;
    name: string;
    roles: string[];
    email: string;
    timeToday: number;
    timeThisWeek: number;
}

interface ValidationErrors {
    name?: string;
    description?: string;
    teamMembers?: string;
    startDate?: string;
    endDate?: string;
    budget?: string;
}

const ProjectManager: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [open, setOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<(Partial<Project> & { budget?: number | undefined }) | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    useEffect(() => {
        checkAuth();
        fetchProjects();
        fetchMembers();
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

    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(PROJECT_API_URL, { withCredentials: true });
            setProjects(response.data);
        } catch (error) {
            setError("Failed to fetch projects");
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(MEMBERS_API_URL, { withCredentials: true });
            setMembers(response.data);
        } catch (error) {
            console.error("Failed to fetch team members", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        }
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        let isValid = true;

        // Name validation
        if (!currentProject?.name?.trim()) {
            errors.name = "Project name is required";
            isValid = false;
        } else if (currentProject.name.length > 100) {
            errors.name = "Project name cannot exceed 100 characters";
            isValid = false;
        }

        // Description validation
        if (!currentProject?.description?.trim()) {
            errors.description = "Description is required";
            isValid = false;
        } else if (currentProject.description.length > 500) {
            errors.description = "Description cannot exceed 500 characters";
            isValid = false;
        }

        // Team members validation
        if (!currentProject?.teamMembers || currentProject.teamMembers.length === 0) {
            errors.teamMembers = "At least one team member is required";
            isValid = false;
        }

        // Date validation
        if (!currentProject?.startDate) {
            errors.startDate = "Start date is required";
            isValid = false;
        }

        if (!currentProject?.endDate) {
            errors.endDate = "End date is required";
            isValid = false;
        } else if (
            currentProject.startDate &&
            currentProject.endDate &&
            new Date(currentProject.endDate) < new Date(currentProject.startDate)
        ) {
            errors.endDate = "End date must be after start date";
            isValid = false;
        }

        // Budget validation in Rupees
        if (currentProject?.budget === undefined || currentProject.budget === null) {
            errors.budget = "Budget is required";
            isValid = false;
        } else if (isNaN(currentProject.budget) || currentProject.budget < 0) {
            errors.budget = "Budget must be a positive number";
            isValid = false;
        } else if (currentProject.budget % 1 !== 0) {
            errors.budget = "Budget must be a whole number (no decimal values)";
            isValid = false;
        } else if (currentProject.budget > 1000000000) {
            errors.budget = "Budget cannot exceed ₹1,000,000,000";
            isValid = false;
        }

        setValidationErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProject) return;

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const config = {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            };
            if (currentProject._id) {
                await axios.put(`${PROJECT_API_URL}/${currentProject._id}`, currentProject, config);
            } else {
                await axios.post(PROJECT_API_URL, currentProject, config);
            }
            await fetchProjects();
            setOpen(false);
            setCurrentProject(null);
            setValidationErrors({});
        } catch (error) {
            setError("Error saving project");
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(`${PROJECT_API_URL}/${id}`, { withCredentials: true });
            await fetchProjects();
        } catch (error) {
            setError("Error deleting project");
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: keyof Project, value: string | number | string[]) => {
        setCurrentProject(prev => {
            if (!prev) return prev;
            return { ...prev, [field]: value };
        });

        // Clear validation error when field is edited
        if (validationErrors[field as keyof ValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Format rupees with commas according to Indian numbering system (2,xx,xxx)
    const formatRupees = (amount: number): string => {
        return amount.toLocaleString('en-IN');
    };

    // Get member options for the dropdown
    const getMemberOptions = () => {
        return members.map(member => ({
            value: member.name,
            label: `${member.name} (${member.roles.join(", ")})`
        }));
    };

    // Format team members for display in the table
    const getTeamMembersString = (teamMembers: string[] | string): string => {
        if (Array.isArray(teamMembers)) {
            return teamMembers.join(", ");
        }
        return teamMembers;
    };

    return (
        <div>
            <h1>Project Manager</h1>
            <Card className="p-3 max-w-7xl mx-auto mt-6">
                <div className="flex justify-between items-center">
                    <CardHeader>
                        {/* <CardTitle>Project Manager</CardTitle> */}
                    </CardHeader>
                    <Button className="me-7" onClick={() => {
                        setCurrentProject({ name: "", description: "", teamMembers: [], startDate: "", endDate: "", status: "Not Started", budget: 0 });
                        setValidationErrors({}); setOpen(true);
                    }}> Add Project
                    </Button>
                </div>
                <CardContent>
                    {isLoading && <div className="text-center py-4">Loading projects...</div>}
                    {error && <div className="text-red-500 py-4">{error}</div>}
                    {
                        !isLoading && !error && projects.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project Name</TableHead>
                                        <TableHead>Project Description</TableHead>
                                        <TableHead>Team Members</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Budget (₹)</TableHead>
                                        <TableHead>Actions</TableHead>
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
                                                    <TableCell>{getTeamMembersString(project.teamMembers)}</TableCell>
                                                    <TableCell>{project.startDate}</TableCell>
                                                    <TableCell>{project.endDate}</TableCell>
                                                    <TableCell>₹{formatRupees(project.budget)}</TableCell>
                                                    <TableCell className="space-x-2">
                                                        <div className="flex justify-center gap-4">
                                                            <SquarePen size={18} onClick={() => {
                                                                setCurrentProject(project); setValidationErrors({});
                                                                setOpen(true);
                                                            }}
                                                                className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                                                            <Trash size={18} onClick={() => handleDelete(project._id!)}
                                                                className="text-red-500 hover:text-red-700 cursor-pointer" />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                </TableBody>
                            </Table>
                        )}
                </CardContent>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{currentProject?._id ? "Edit Project" : "New Project"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Name</Label>
                                <Input type="text" value={currentProject?.name || ""}
                                    onChange={e => handleInputChange('name', e.target.value)}
                                    className={validationErrors.name ? "border-red-500" : ""} />
                                {validationErrors.name && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Input type="text" value={currentProject?.description || ""}
                                    onChange={e => handleInputChange('description', e.target.value)}
                                    className={validationErrors.description ? "border-red-500" : ""} />
                                {validationErrors.description && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.description}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Team Members</Label>
                                <Select
                                    isMulti
                                    name="teamMembers"
                                    options={getMemberOptions()}
                                    value={
                                        Array.isArray(currentProject?.teamMembers)
                                            ? getMemberOptions().filter(option =>
                                                currentProject?.teamMembers?.includes(option.value))
                                            : []
                                    }
                                    onChange={(selectedOptions) => {
                                        const teamMembers = selectedOptions.map(option => option.value);
                                        handleInputChange('teamMembers', teamMembers);
                                    }}
                                    className={validationErrors.teamMembers ? "border-red-500" : ""}
                                />
                                {validationErrors.teamMembers && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.teamMembers}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={currentProject?.startDate || ""}
                                    onChange={e => handleInputChange('startDate', e.target.value)}
                                    className={validationErrors.startDate ? "border-red-500" : ""} />
                                {validationErrors.startDate && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.startDate}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>End Date</Label>
                                <Input type="date" value={currentProject?.endDate || ""}
                                    onChange={e => handleInputChange('endDate', e.target.value)}
                                    className={validationErrors.endDate ? "border-red-500" : ""} />
                                {validationErrors.endDate && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.endDate}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label>Budget (₹)</Label>
                                <Input type="number" value={currentProject?.budget || ""}
                                    onChange={e => handleInputChange('budget', e.target.value === "" ? undefined : Number(e.target.value))}
                                    className={validationErrors.budget ? "border-red-500" : ""}
                                    min="0" step="1" placeholder="Enter amount in rupees" />
                                {validationErrors.budget && (
                                    <div className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertTriangle size={14} className="mr-1" />
                                        {validationErrors.budget}
                                    </div>
                                )}
                                <div className="text-gray-500 text-xs mt-1">
                                    Enter whole number without commas or decimals
                                </div>
                            </div>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : (currentProject?._id ? "Update Project" : "Add Project")}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card >
        </div>
    );
};

export default ProjectManager;