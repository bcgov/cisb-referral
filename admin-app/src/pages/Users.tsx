import { useState, useEffect } from "react";
import { Table, Dialog } from "../components/ui";
import { apiService } from "../services";
import type { User, CreateUserDto, UpdateUserDto } from "../types";
import { UserRole } from "../types";

const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.ADMIN]: "Admin",
  [UserRole.SYSTEM_ADMINISTRATOR]: "System Administrator",
};

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      role: UserRole.USER,
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
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setSubmitting(true);
    setError(null);

    try {
      await apiService.deleteUser(deletingUser.id);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingUser) {
        const updateData: UpdateUserDto = {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        };
        await apiService.updateUser(editingUser.id, updateData);
      } else {
        const createData: CreateUserDto = {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        };
        await apiService.createUser(createData);
      }
      setDialogOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error("Failed to save user:", err);
      setError(err.response?.data?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
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
      header: "",
      render: (user: User) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(user);
          }}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">Users</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark"
        >
          Add User
        </button>
      </div>
      <div className="p-6">
        <Table
          data={users}
          columns={columns}
          onEdit={handleEdit}
          loading={loading}
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
              required
            >
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 border border-bcgov-border rounded hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
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
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
