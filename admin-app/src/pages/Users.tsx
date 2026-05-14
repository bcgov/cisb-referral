import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccessDenied } from "../components";
import { Table, Dialog } from "../components/ui";
import { useCurrentUser } from "../hooks";
import { apiService } from "../services";
import type { User, CreateUserDto, UpdateUserDto } from "../types";
import { UserRole } from "../types";

const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.ADMIN]: "Admin",
  [UserRole.SYSTEM_ADMINISTRATOR]: "System Administrator",
};

const ADMIN_ASSIGNABLE_ROLES: UserRole[] = [UserRole.USER, UserRole.ADMIN];

const SYSTEM_ADMIN_ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.USER,
  UserRole.ADMIN,
  UserRole.SYSTEM_ADMINISTRATOR,
];

export function Users() {
  const { currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<
    CreateUserDto & Partial<UpdateUserDto>
  >({
    fullName: "",
    email: "",
    role: UserRole.USER,
  });
  const [error, setError] = useState<string | null>(null);
  const isCurrentUserResolved = !isCurrentUserLoading;

  const assignableRoles =
    currentUser?.role === UserRole.SYSTEM_ADMINISTRATOR
      ? SYSTEM_ADMIN_ASSIGNABLE_ROLES
      : ADMIN_ASSIGNABLE_ROLES;

  const isUsersPageForbidden =
    isCurrentUserResolved &&
    (!currentUser || currentUser.role === UserRole.USER);

  const isRoleLocked =
    editingUser != null && !assignableRoles.includes(editingUser.role);

  const roleOptions = isRoleLocked
    ? [editingUser.role, ...assignableRoles]
    : assignableRoles;

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiService.fetchUsers(),
    enabled: isCurrentUserResolved && !isUsersPageForbidden,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: {
      editing: User | null;
      formData: CreateUserDto & Partial<UpdateUserDto>;
    }) => {
      if (data.editing) {
        const updateData: UpdateUserDto = {
          fullName: data.formData.fullName,
          email: data.formData.email,
          role: data.formData.role,
        };
        return apiService.updateUser(data.editing.id, updateData);
      }
      const createData: CreateUserDto = {
        fullName: data.formData.fullName,
        email: data.formData.email,
        role: data.formData.role,
      };
      return apiService.createUser(createData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDialogOpen(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to save user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Failed to delete user");
    },
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      role: assignableRoles[0],
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setError(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingUser) return;
    deleteMutation.mutate(deletingUser.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ editing: editingUser, formData });
  };

  const columns = [
    {
      key: "fullName",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => USER_ROLE_LABELS[user.role] || user.role,
    },
    {
      key: "isActive",
      header: "Status",
      render: (user: User) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            user.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="px-3 py-1 text-sm font-medium text-bcgov-blue
              border border-bcgov-border rounded hover:bg-blue-50
              hover:border-bcgov-blue transition-colors duration-150"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(user);
            }}
            className="px-3 py-1 text-sm font-medium text-red-600
              border border-bcgov-border rounded hover:bg-red-50
              hover:border-red-400 transition-colors duration-150"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (!isCurrentUserResolved) {
    return <div className="p-6 text-bcgov-gray-dark">Loading user...</div>;
  }

  if (isUsersPageForbidden) {
    return <AccessDenied />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 px-4 sm:px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">Users</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark self-start sm:self-auto"
        >
          Add User
        </button>
      </div>
      <div className="p-4 sm:p-6">
        <Table
          data={users}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
        />
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingUser ? "Edit User" : "Add User"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              required
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Role <span className="text-red-600">*</span>
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as UserRole })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              disabled={isRoleLocked}
              required
            >
              {roleOptions.map((value) => (
                <option
                  key={value}
                  value={value}
                  disabled={isRoleLocked && editingUser?.role === value}
                >
                  {USER_ROLE_LABELS[value]}
                </option>
              ))}
            </select>
            {isRoleLocked && (
              <p className="mt-1 text-xs text-bcgov-gray-dark">
                You cannot change the role for this user.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 border border-bcgov-border rounded hover:bg-gray-50"
              disabled={saveMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark disabled:opacity-50"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}
          <p className="text-bcgov-gray-dark">
            Are you sure you want to delete{" "}
            <strong>{deletingUser?.fullName}</strong>? This will deactivate
            their account.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 border border-bcgov-border rounded hover:bg-gray-50"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
