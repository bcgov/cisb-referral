import { useState, useEffect } from "react";
import { Table, Dialog } from "../components/ui";
import { apiService } from "../services";
import type { Ministry, CreateMinistryDto, UpdateMinistryDto } from "../types";

export function Ministries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState<CreateMinistryDto>({
    name: "",
    code: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMinistries();
  }, []);

  const loadMinistries = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchMinistries();
      setMinistries(data);
    } catch (err) {
      console.error("Failed to load ministries:", err);
      setError("Failed to load ministries");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMinistry(null);
    setFormData({ name: "", code: "", isActive: true });
    setError(null);
    setDialogOpen(true);
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      code: ministry.code || "",
      isActive: ministry.isActive,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingMinistry) {
        const updateData: UpdateMinistryDto = {
          name: formData.name,
          code: formData.code || undefined,
          isActive: formData.isActive,
        };
        await apiService.updateMinistry(editingMinistry.id, updateData);
      } else {
        await apiService.createMinistry(formData);
      }
      setDialogOpen(false);
      loadMinistries();
    } catch (err: any) {
      console.error("Failed to save ministry:", err);
      setError(err.response?.data?.message || "Failed to save ministry");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "code",
      header: "Code",
      render: (ministry: Ministry) => ministry.code || "-",
    },
    {
      key: "isActive",
      header: "Status",
      render: (ministry: Ministry) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            ministry.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {ministry.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
          Ministries
        </h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark"
        >
          Add Ministry
        </button>
      </div>
      <div className="p-6">
        <Table
          data={ministries}
          columns={columns}
          onEdit={handleEdit}
          loading={loading}
          emptyMessage="No ministries found"
        />
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingMinistry ? "Edit Ministry" : "Add Ministry"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              required
            />
          </div>
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Code
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-bcgov-blue border-bcgov-border rounded focus:ring-bcgov-blue"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm text-bcgov-gray-dark"
            >
              Active
            </label>
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
    </div>
  );
}
