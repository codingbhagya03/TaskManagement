import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { SquarePen, Trash } from "lucide-react";

const API_URL = "http://localhost:5000/api/members";
const ROLES_API_URL = "http://localhost:5000/api/members/roles"; 

interface Member {
    _id?: string;
    name: string;
    roles: string[]; 
    email: string;
    timeToday: number;
    timeThisWeek: number;
}

const User: React.FC = () => {
    const navigate = useNavigate();
    const [Members, setMembers] = useState<Member[]>([]);
    const [open, setOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<Member> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roleOptions, setRoleOptions] = useState<{ value: string, label: string }[]>([]);

    // Poll for updates every 30 seconds to ensure synchronization
    useEffect(() => {
        fetchMembers();
        fetchRoles();
        
        const interval = setInterval(() => {
            fetchMembers();
            fetchRoles();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchMembers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_URL, { withCredentials: true });
            setMembers(response.data);
        } catch (error) {
            setError("Failed to fetch members");
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(ROLES_API_URL, { withCredentials: true });
            const roles = response.data;
            const formattedRoles = roles.map((role: string) => ({
                value: role,
                label: role
            }));
            setRoleOptions(formattedRoles);
        } catch (error) {
            console.error("Error fetching roles:", error);
            if (axios.isAxiosError(error)) {
                console.error("Response status:", error.response?.status);
                console.error("Response data:", error.response?.data);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentMember) {
            setIsLoading(true);
            setError(null);
            try {
                const config = {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                };
                if (currentMember._id) {
                    await axios.put(`${API_URL}/${currentMember._id}`, currentMember, config);
                } else {
                    await axios.post(API_URL, currentMember, config);
                }
                await fetchMembers();
                setOpen(false);
                setCurrentMember(null);
            } catch (error) {
                setError("Error saving member");
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
            await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
            await fetchMembers();
        } catch (error) {
            setError("Error deleting member");
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                navigate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-3 max-w-7xl mx-auto mt-6">
            <div className="flex justify-between items-center">
                <CardHeader>
                    <CardTitle>User Manager</CardTitle>
                </CardHeader>
                <Button
                    className="me-16"
                    onClick={() => {
                        setCurrentMember({ name: "", roles: [], email: "", timeToday: 0, timeThisWeek: 0 });
                        setOpen(true);
                    }}
                >
                    Add User
                </Button>
            </div>
            <CardContent>
                {isLoading && <div className="text-center py-4">Loading Members...</div>}
                {error && <div className="text-red-500 py-4">{error}</div>}

                {!isLoading && !error && Members.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Roles</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Members.map(member => (
                                <TableRow key={member._id}>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.roles.join(", ")}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell className="space-x-2">
                                        <div className="flex gap-4">
                                            <SquarePen size={18} onClick={() => {
                                                setCurrentMember(member); setOpen(true);
                                            }}
                                                className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                                            <Trash size={18} onClick={() => handleDelete(member._id!)}
                                                className="text-red-500 hover:text-red-700 cursor-pointer" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Dialog for Add/Edit Member */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{currentMember?._id ? "Edit Member" : "New Member"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Label>Name</Label>
                        <Input
                            type="text"
                            value={currentMember?.name || ""}
                            onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                            required
                        />

                        <Label>Roles</Label>
                        <Select
                            isMulti
                            name="roles"
                            options={roleOptions}
                            value={roleOptions.filter((option) => currentMember?.roles?.includes(option.value))}
                            onChange={(selectedOptions) => {
                                const roles = selectedOptions.map((option) => option.value);
                                setCurrentMember({ ...currentMember, roles });
                            }}
                        />

                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={currentMember?.email || ""}
                            onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                            required
                        />

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : currentMember?._id ? "Update Member" : "Add Member"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default User;