
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, CircleUser, Shield, Ban, ShieldOff, Trash2, CheckCircle2, XCircle } from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  registrationDate: string;
}

interface UserManagementProps {
  users: User[];
  onImpersonateUser: (user: User) => void;
  onOpenUpgradeDialog: (user: User) => void;
  onOpenBanDialog: (user: User) => void;
  onDeactivateUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onImpersonateUser,
  onOpenUpgradeDialog,
  onOpenBanDialog,
  onDeactivateUser,
  onDeleteUser
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">User Management</h2>
        <div className="flex items-center space-x-2">
          <Input type="search" placeholder="Search users..." className="md:w-64" />
          <Button>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.status === "active" ? (
                    <div className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Inactive
                    </div>
                  )}
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>{user.registrationDate}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onImpersonateUser(user)}>
                        <CircleUser className="mr-2 h-4 w-4" />
                        Impersonate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenUpgradeDialog(user)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Upgrade to VIP
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenBanDialog(user)}>
                        <Ban className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeactivateUser(user)}>
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Deactivate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteUser(user)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
