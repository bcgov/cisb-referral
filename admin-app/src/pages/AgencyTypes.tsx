import { useState, useEffect } from "react";
import { Table, Dialog } from "../components/ui";
import { apiService } from "../services";
import type {
  AgencyType,
  CreateAgencyTypeDto,
  UpdateAgencyTypeDto,
} from "../types";

export function AgencyTypes() {
  const [agencyTypes, setAgencyTypes] = useState<AgencyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgencyType, setEditingAgencyType] = useState<AgencyType | null>(
    null
  );
  const [formData, setFormData] = useState<CreateAgencyTypeDto>({
    name: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgencyTypes();
  }, []);

  const loadAgencyTypes = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchAgencyTypes();
      setAgencyTypes(data);
    } catch (err) {
      console.error("Failed to load agency types:", err);
      setError("Failed to load agency types");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAgencyType(null);
    setFormData({ name: "", isActive: true });
    setError(null);
    setDialogOpen(true);
  };

  const handleEdit = (agencyType: AgencyType) => {
    setEditingAgencyType(agencyType);
    setFormData({
      name: agencyType.name,
      isActive: agencyType.isActive,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingAgencyType) {
        const updateData: UpdateAgencyTypeDto = {
          name: formData.name,
          isActive: formData.isActive,
        };
        await apiService.updateAgencyType(editingAgencyType.id, updateData);
      } else {
        await apiService.createAgencyType(formData);
      }
      setDialogOpen(false);
      loadAgencyTypes();
    } catch (err: any) {
      console.error("Failed to save agency type:", err);
      setError(err.response?.data?.message || "Failed to save agency type");
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
      key: "isActive",
      header: "Status",
      render: (agencyType: AgencyType) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            agencyType.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {agencyType.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
          Agency Types
        </h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark"
        >
          Add Agency Type
        </button>
      </div>
      <div className="p-6">
        <Table
          data={agencyTypes}
          columns={columns}
          onEdit={handleEdit}
          loading={loading}
          emptyMessage="No agency types found"
        />
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingAgencyType ? "Edit Agency Type" : "Add Agency Type"}
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
