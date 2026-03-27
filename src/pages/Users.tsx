import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { createUser, clearCreateError, type UserRole } from "@/store/redux/slices/usersSlice";
import type { AppDispatch, RootState } from "@/store/redux/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Users as UsersIcon, UserPlus, Lock, Ban, LogIn, Shield, Download, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import * as XLSX from "xlsx";
import CommonTable, { type ColumnDef } from "@/components/common/CommonTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import apiClient from "@/lib/axiosInstance";

const userSchema = z.object({
  email: z.string().email("Invalid email address").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().trim().min(1, "Name is required"),
  role_name: z.enum(["admin", "student", "teacher", "organization", "education"]),
});

const parseBlockedState = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value === "1";
  return false;
};

interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  is_blocked: boolean;
  user_id: string | null;
}

interface Cohort {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export default function Users() {
  const { user, isAdmin, login, refresh } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { creating, createError } = useSelector((state: RootState) => state.users);
  const [users, setUsers] = useState<User[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    password: string;
    role_name: UserRole;
  }>({
    full_name: "",
    email: "",
    password: "",
    role_name: "student",
  });
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    role: "student",
  });

  useEffect(() => {
    if (!user) return;
    // Page is already admin-protected by routing, so load immediately.
    loadUsers();
    loadCohorts();
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Fetch all pages from /v2/admin/users/staffs
      let page = 1;
      let allStaffs: User[] = [];

      while (true) {
        const response = await apiClient.get(`/v2/admin/users/staffs?page=${page}`);
        const payload = response.data;

        if (!payload?.success) {
          throw new Error(payload?.message || "Failed to load staff users");
        }

        const pageData: any[] = payload.data?.data ?? [];
        const mapped: User[] = pageData.map((s: any) => ({
          id: String(s.id),
          email: s.email ?? "",
          full_name: s.full_name ?? "",
          roles: s.role_name ? [s.role_name] : [],
          is_blocked: s.status !== "active",
          user_id: s.id ? String(s.id) : null,
        }));

        allStaffs = [...allStaffs, ...mapped];

        const lastPage: number = payload.data?.last_page ?? 1;
        if (page >= lastPage) break;
        page++;
      }

      setUsers(allStaffs);
    } catch (error: any) {
      console.error("Error loading users:", error);
      toast.error(error?.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCohorts = async () => {
    setCohorts([]); // Cohorts not supported in PHP backend yet
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = userSchema.parse(formData);
      const result = await dispatch(
        createUser({
          full_name: validated.full_name,
          email: validated.email,
          password: validated.password,
          role_name: validated.role_name,
        })
      );
      if (createUser.fulfilled.match(result)) {
        toast.success("User created successfully");
        setDialogOpen(false);
        setFormData({ full_name: "", email: "", password: "", role_name: "student" });
        dispatch(clearCreateError());
      } else {
        toast.error((result.payload as string) || "Failed to create user");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to create user");
      }
    }
  };

  const handleDeleteUser = async (_userId: string) => {
    const target = users.find((u) => u.id === _userId);
    const label = target?.full_name || target?.email || _userId;
    if (!confirm(`Delete user "${label}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/users/${_userId}`, { method: "DELETE" });
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== _userId));
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete user");
    }
  };

  const handleToggleBlock = async (target: User) => {
    try {
      await apiFetch(`/users/${target.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_blocked: !target.is_blocked,
        }),
      });
      toast.success(target.is_blocked ? "User unblocked" : "User blocked");
      await loadUsers();
      if (target.id === user?.id) {
        await refresh({ force: true });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user status");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) {
      toast.error("Select a user and enter a new password");
      return;
    }
    try {
      await apiFetch(`/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_password: newPassword }),
      });
      toast.success("Password reset successfully");
      setPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to reset password");
    }
  };

  const handleImpersonate = async (target: User) => {
    try {
      const res = await apiFetch<{ token: string }>(`/users/${target.id}/impersonate`, { method: "POST" });
      if (!res?.token) throw new Error("No token returned");
      await login(res.token);
      await refresh({ force: true });
      toast.success(`Logged in as ${target.full_name || target.email}`);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || "Failed to impersonate user");
    }
  };

  const handleEditUser = (target: User) => {
    setSelectedUser(target);
    setEditFormData({
      full_name: target.full_name,
      email: target.email,
      role: target.roles[0] || "student",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await apiFetch(`/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: editFormData.full_name,
          role: editFormData.role,
        }),
      });
      toast.success("User updated");
      setEditDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update user");
    }
  };

  const handleExportUsers = () => {
    if (users.length === 0) {
      toast.error("No users to export");
      return;
    }
    const rows = users.map((u) => [
      u.full_name,
      u.email,
      u.user_id || "",
      u.roles.join(", "),
      u.is_blocked ? "Blocked" : "Active",
    ]);

    const sheet = XLSX.utils.aoa_to_sheet([
      ["Full Name", "Email", "User ID", "Roles", "Status"],
      ...rows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Users");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `global-learning-users-${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("User data exported");
  };

  const userColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "#",
        accessor: (_row, idx) => idx + 1,
        className: "w-10 text-center text-muted-foreground",
      },
      {
        header: "User",
        accessor: (u) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {u.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{u.full_name}</span>
                {u.is_blocked && (
                  <Badge variant="destructive" className="text-xs py-0">
                    Blocked
                  </Badge>
                )}
              </div>
              {u.user_id && (
                <p className="text-xs text-muted-foreground">ID: {u.user_id}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        header: "Email",
        accessor: "email",
        className: "text-muted-foreground",
      },
      {
        header: "Roles",
        accessor: (u) => (
          <div className="flex flex-wrap gap-1">
            {u.roles.map((role) => (
              <Badge key={role} variant="secondary" className="capitalize">
                {role}
              </Badge>
            ))}
          </div>
        ),
      },
      {
        header: "Status",
        accessor: (u) => (
          <Badge variant={u.is_blocked ? "destructive" : "default"}>
            {u.is_blocked ? "Blocked" : "Active"}
          </Badge>
        ),
        className: "w-24",
      },
      {
        header: "Actions",
        accessor: (u) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditUser(u)}
              title="Edit user"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedUser(u);
                setPasswordDialogOpen(true);
              }}
              title="Reset password"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleBlock(u)}
              title={u.is_blocked ? "Unblock user" : "Block user"}
              className={u.is_blocked ? "text-green-600" : "text-orange-600"}
            >
              <Ban className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleImpersonate(u)}
              title="Login as this user"
              className="text-blue-600"
            >
              <LogIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteUser(u.id)}
              className="text-destructive hover:text-destructive"
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
        className: "w-48",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [users]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const haystack = [
      u.full_name,
      u.email,
      u.user_id || "",
      (u.roles || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_user_id">User ID</Label>
              <Input
                id="edit_user_id"
                value={selectedUser?.user_id || "Not set"}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                User ID cannot be changed once assigned
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                value={editFormData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed (linked to authentication)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select value={editFormData.role} onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="non_editing_teacher">Non-editing Teacher</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setEditDialogOpen(false);
                  setPasswordDialogOpen(true);
                }}
              >
                <Lock className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateUser} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reset password for: <strong>{selectedUser?.full_name}</strong>
            </p>
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
              />
            </div>
            <Button onClick={handleResetPassword} className="w-full">
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div>
        <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          User Management
        </h1>
        <p className="text-muted-foreground mt-1">Manage users, roles, and cohorts</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
          <CardTitle className="text-lg font-semibold">
            Users{" "}
            {users.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({users.length} total)
              </span>
            )}
          </CardTitle>

          <div className="flex flex-wrap gap-2 items-center">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchInput.trim())}
              placeholder="Search by name, email or ID"
              className="w-64"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery(searchInput.trim())}
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput("");
                  setSearchQuery("");
                }}
              >
                Clear
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role_name">Role</Label>
                    <Select
                      value={formData.role_name}
                      onValueChange={(value) => setFormData({ ...formData, role_name: value as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {createError && (
                    <p className="text-sm text-destructive">{createError}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating ? "Creating..." : "Create User"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportUsers}>
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <CommonTable<User>
                columns={userColumns}
                data={filteredUsers}
                loading={loading}
                skeletonRows={6}
                emptyMessage="No users found."
                rowKey={(u) => u.id}
              />
            </TabsContent>

            <TabsContent value="cohorts" className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Cohort Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cohort management features coming soon. You'll be able to create cohorts and automatically enroll groups of users.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
