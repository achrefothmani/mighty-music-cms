"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { getUsers, createUser, updateUser, deleteUser, UserCreate } from "@/services/users.service";
import DrawerForm from "@/components/DrawerForm";
import EmptyState from "@/components/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Search, UserPlus, Trash2, Shield, Power, Mail, User as UserIcon, Lock, Save } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      await updateUser(user.id, { is_admin: !user.is_admin });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS USER?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleOpenDrawer = (user: User | null = null) => {
    setSelectedUser(user);
    setError("");
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload: UserCreate = {
      email: formData.get("email") as string,
      full_name: formData.get("full_name") as string,
      is_active: formData.get("is_active") === "on",
      is_admin: formData.get("is_admin") === "on",
    };

    const password = formData.get("password") as string;
    if (password) payload.password = password;

    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, payload);
      } else {
        if (!password) {
          setError("PASSWORD IS REQUIRED FOR NEW USERS");
          setIsSubmitting(false);
          return;
        }
        await createUser(payload);
      }
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to save user", err);
      setError("FAILED TO SAVE USER. EMAIL MIGHT BE TAKEN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stagger-in space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-2xl font-bold tracking-[0.2em] text-accent uppercase">User Management</h1>
        <button 
          onClick={() => handleOpenDrawer(null)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <UserPlus size={16} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Add New User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative border-b border-border">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          placeholder="SEARCH USERS BY EMAIL OR NAME..." 
          className="w-full bg-transparent pl-8 py-4 font-mono text-xs tracking-widest outline-none uppercase placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center font-mono py-20 animate-pulse-brutalist text-muted-foreground">
          INITIALIZING USERS...
        </div>
      ) : filteredUsers.length > 0 ? (
        <DataTable
          columns={[
            { label: "User" },
            { label: "Status" },
            { label: "Role" },
            { label: "Actions", align: "right" }
          ]}
        >
          {filteredUsers.map((u) => (
            <tr 
              key={u.id} 
              className="group border-b border-border hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => handleOpenDrawer(u)}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight uppercase group-hover:text-accent transition-colors">{u.full_name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground lowercase">{u.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
                  <span className="text-[10px] font-mono uppercase text-muted-foreground">
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                {u.is_admin ? (
                  <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 uppercase tracking-tighter">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    User
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleToggleActive(u)}
                    className={`p-2 transition-all ${u.is_active ? "text-muted-foreground hover:text-red-500" : "text-muted-foreground hover:text-green-500"}`}
                    title={u.is_active ? "Deactivate" : "Activate"}
                  >
                    <Power size={14} />
                  </button>
                  <button 
                    onClick={() => handleToggleAdmin(u)}
                    className={`p-2 transition-all ${u.is_admin ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
                    title="Toggle Admin"
                  >
                    <Shield size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState 
          message="NO USERS FOUND" 
          ctaText="＋ ADD NEW USER" 
          onCtaClick={() => handleOpenDrawer(null)}
        />
      )}

      <DrawerForm 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser ? `EDIT USER / ${selectedUser.full_name}` : "ADD NEW USER"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                name="full_name" 
                type="text" 
                className="input-brutalist pl-12" 
                defaultValue={selectedUser?.full_name} 
                placeholder="USER NAME" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                name="email" 
                type="email" 
                className="input-brutalist pl-12" 
                defaultValue={selectedUser?.email} 
                placeholder="USER@MIGHTYMUSIC.COM" 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
              {selectedUser ? "New Password (Leave blank to keep)" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                name="password" 
                type="password" 
                className="input-brutalist pl-12" 
                placeholder="••••••••" 
                required={!selectedUser} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="is_active" 
                id="is_active" 
                className="w-5 h-5 accent-accent cursor-pointer" 
                defaultChecked={selectedUser ? selectedUser.is_active : true} 
              />
              <label htmlFor="is_active" className="text-[10px] font-mono uppercase cursor-pointer tracking-widest">Active Status</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                name="is_admin" 
                id="is_admin" 
                className="w-5 h-5 accent-accent cursor-pointer" 
                defaultChecked={selectedUser?.is_admin} 
              />
              <label htmlFor="is_admin" className="text-[10px] font-mono uppercase cursor-pointer tracking-widest">Administrator Privileges</label>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-mono uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                {isSubmitting ? "PROCESSING..." : (selectedUser ? "SAVE CHANGES" : "CREATE USER")}
              </span>
            </button>
          </div>
        </form>
      </DrawerForm>
    </div>
  );
}
