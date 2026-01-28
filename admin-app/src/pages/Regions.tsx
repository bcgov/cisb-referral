import { useState, useEffect } from "react";
import { Table, Dialog } from "../components/ui";
import { apiService } from "../services";
import type { Region, CreateRegionDto } from "../types";

export function Regions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<CreateRegionDto>({
    name: "",
    managerEmail: "",
    supervisorEmail: "",
    assistantSupervisorEmail: "",
    sharedMailboxEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const data = await apiService.fetchRegions();
      setRegions(data);
    } catch {
      setError("Failed to load regions");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRegion(null);
    setFormData({
      name: "",
      managerEmail: "",
      supervisorEmail: "",
      assistantSupervisorEmail: "",
      sharedMailboxEmail: "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      managerEmail: region.managerEmail || "",
      supervisorEmail: region.supervisorEmail || "",
      assistantSupervisorEmail: region.assistantSupervisorEmail || "",
      sharedMailboxEmail: region.sharedMailboxEmail || "",
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        managerEmail: formData.managerEmail || undefined,
        supervisorEmail: formData.supervisorEmail || undefined,
        assistantSupervisorEmail:
          formData.assistantSupervisorEmail || undefined,
        sharedMailboxEmail: formData.sharedMailboxEmail || undefined,
      };

      if (editingRegion) {
        await apiService.updateRegion(editingRegion.id, submitData);
      } else {
        await apiService.createRegion(submitData);
      }
      setDialogOpen(false);
      loadRegions();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save region");
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
      key: "managerEmail",
      header: "Manager Email",
      render: (region: Region) => region.managerEmail || "-",
    },
    {
      key: "supervisorEmail",
      header: "Supervisor Email",
      render: (region: Region) => region.supervisorEmail || "-",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">Regions</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-bcgov-blue text-white rounded hover:bg-bcgov-blue-dark"
        >
          Add Region
        </button>
      </div>
      <div className="p-6">
        <Table
          data={regions}
          columns={columns}
          onEdit={handleEdit}
          loading={loading}
          emptyMessage="No regions found"
        />
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingRegion ? "Edit Region" : "Add Region"}
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
              htmlFor="managerEmail"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Manager Email
            </label>
            <input
              type="email"
              id="managerEmail"
              value={formData.managerEmail}
              onChange={(e) =>
                setFormData({ ...formData, managerEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label
              htmlFor="supervisorEmail"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Supervisor Email
            </label>
            <input
              type="email"
              id="supervisorEmail"
              value={formData.supervisorEmail}
              onChange={(e) =>
                setFormData({ ...formData, supervisorEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label
              htmlFor="assistantSupervisorEmail"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Assistant Supervisor Email
            </label>
            <input
              type="email"
              id="assistantSupervisorEmail"
              value={formData.assistantSupervisorEmail}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  assistantSupervisorEmail: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
          </div>
          <div>
            <label
              htmlFor="sharedMailboxEmail"
              className="block text-sm font-medium text-bcgov-gray-dark mb-1"
            >
              Shared Mailbox Email
            </label>
            <input
              type="email"
              id="sharedMailboxEmail"
              value={formData.sharedMailboxEmail}
              onChange={(e) =>
                setFormData({ ...formData, sharedMailboxEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-bcgov-border rounded focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
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
