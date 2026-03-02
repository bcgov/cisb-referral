import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table } from "../components/ui";
import { apiService } from "../services";
import type { Region, CreateRegionDto, UpdateRegionDto } from "../types";

/** Fields that can be edited on a region row */
type RegionEditValues = {
  name: string;
  managerEmail: string;
  supervisorEmail: string;
  assistantSupervisorEmail: string;
  sharedMailboxEmail: string;
};

const INPUT_CLASS =
  "flex-1 min-w-0 px-2 py-1 border border-bcgov-blue rounded text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-bcgov-blue";

/**
 * Regions management page with row-level inline editing,
 * inline add row, and delete support.
 *
 * @returns Regions admin page component
 */
export function Regions() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newRegion, setNewRegion] = useState<CreateRegionDto>({
    name: "",
    managerEmail: "",
    supervisorEmail: "",
    assistantSupervisorEmail: "",
    sharedMailboxEmail: "",
  });

  /** ID of the row currently being edited (null = none) */
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Pending field values for the row being edited */
  const [editValues, setEditValues] = useState<RegionEditValues>({
    name: "",
    managerEmail: "",
    supervisorEmail: "",
    assistantSupervisorEmail: "",
    sharedMailboxEmail: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: () => apiService.fetchRegions(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRegionDto }) =>
      apiService.updateRegion(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["regions"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRegionDto) => apiService.createRegion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      setIsAdding(false);
      setNewRegion({
        name: "",
        managerEmail: "",
        supervisorEmail: "",
        assistantSupervisorEmail: "",
        sharedMailboxEmail: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteRegion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["regions"] }),
  });

  /** Enter edit mode for a row, pre-populating current values */
  const handleEdit = (region: Region) => {
    setEditingId(region.id);
    setEditValues({
      name: region.name,
      managerEmail: region.managerEmail || "",
      supervisorEmail: region.supervisorEmail || "",
      assistantSupervisorEmail: region.assistantSupervisorEmail || "",
      sharedMailboxEmail: region.sharedMailboxEmail || "",
    });
  };

  /** Cancel editing and discard pending changes */
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  /** Save all pending changes for the row being edited */
  const handleSaveRow = async () => {
    if (!editingId) return;
    const trimmedName = editValues.name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          name: trimmedName,
          managerEmail: editValues.managerEmail.trim() || undefined,
          supervisorEmail: editValues.supervisorEmail.trim() || undefined,
          assistantSupervisorEmail:
            editValues.assistantSupervisorEmail.trim() || undefined,
          sharedMailboxEmail: editValues.sharedMailboxEmail.trim() || undefined,
        },
      });
      setEditingId(null);
    } catch {
      // Mutation error is surfaced via updateMutation.isError;
      // keep row in editing state so the user can retry.
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = () => {
    const name = newRegion.name.trim();
    if (name) {
      createMutation.mutate({
        name,
        managerEmail: newRegion.managerEmail || undefined,
        supervisorEmail: newRegion.supervisorEmail || undefined,
        assistantSupervisorEmail:
          newRegion.assistantSupervisorEmail || undefined,
        sharedMailboxEmail: newRegion.sharedMailboxEmail || undefined,
      });
    }
  };

  const handleDelete = (region: Region) => {
    if (confirm(`Delete "${region.name}"?`)) {
      deleteMutation.mutate(region.id);
    }
  };

  /**
   * Update a single field in the edit values.
   *
   * @param field - The field key to update
   * @param value - The new value for the field
   */
  const updateField = (field: keyof RegionEditValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (region: Region) =>
        editingId === region.id ? (
          <input
            type="text"
            autoFocus
            value={editValues.name}
            onChange={(e) => updateField("name", e.target.value)}
            aria-label="Name"
            className={INPUT_CLASS}
          />
        ) : (
          <span className="px-2 py-1 inline-block">{region.name}</span>
        ),
    },
    {
      key: "managerEmail",
      header: "Manager Email",
      render: (region: Region) =>
        editingId === region.id ? (
          <input
            type="email"
            value={editValues.managerEmail}
            onChange={(e) => updateField("managerEmail", e.target.value)}
            placeholder="Manager email"
            aria-label="Manager Email"
            className={INPUT_CLASS}
          />
        ) : (
          <span className="px-2 py-1 inline-block">
            {region.managerEmail || (
              <span className="text-bcgov-gray italic">-</span>
            )}
          </span>
        ),
    },
    {
      key: "supervisorEmail",
      header: "Supervisor Email",
      render: (region: Region) =>
        editingId === region.id ? (
          <input
            type="email"
            value={editValues.supervisorEmail}
            onChange={(e) => updateField("supervisorEmail", e.target.value)}
            placeholder="Supervisor email"
            aria-label="Supervisor Email"
            className={INPUT_CLASS}
          />
        ) : (
          <span className="px-2 py-1 inline-block">
            {region.supervisorEmail || (
              <span className="text-bcgov-gray italic">-</span>
            )}
          </span>
        ),
    },
    {
      key: "assistantSupervisorEmail",
      header: "Asst. Supervisor Email",
      render: (region: Region) =>
        editingId === region.id ? (
          <input
            type="email"
            value={editValues.assistantSupervisorEmail}
            onChange={(e) =>
              updateField("assistantSupervisorEmail", e.target.value)
            }
            placeholder="Asst. supervisor email"
            aria-label="Assistant Supervisor Email"
            className={INPUT_CLASS}
          />
        ) : (
          <span className="px-2 py-1 inline-block">
            {region.assistantSupervisorEmail || (
              <span className="text-bcgov-gray italic">-</span>
            )}
          </span>
        ),
    },
    {
      key: "sharedMailboxEmail",
      header: "Shared Mailbox Email",
      render: (region: Region) =>
        editingId === region.id ? (
          <input
            type="email"
            value={editValues.sharedMailboxEmail}
            onChange={(e) => updateField("sharedMailboxEmail", e.target.value)}
            placeholder="Shared mailbox email"
            aria-label="Shared Mailbox Email"
            className={INPUT_CLASS}
          />
        ) : (
          <span className="px-2 py-1 inline-block">
            {region.sharedMailboxEmail || (
              <span className="text-bcgov-gray italic">-</span>
            )}
          </span>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (region: Region) =>
        editingId === region.id ? (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveRow}
                disabled={isSaving || !editValues.name.trim()}
                className="px-3 py-1 text-sm font-medium text-white bg-bcgov-blue
                  rounded hover:bg-bcgov-blue-dark
                  transition-colors duration-150 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3 py-1 text-sm font-medium text-bcgov-gray-dark
                  border border-bcgov-border rounded hover:bg-gray-100
                  transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {updateMutation.isError && (
              <span className="text-red-600 text-sm">
                Failed to save changes
              </span>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleEdit(region)}
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
                handleDelete(region);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 px-4 sm:px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">Regions</h1>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-4 py-2 bg-bcgov-blue text-white rounded
            hover:bg-bcgov-blue-dark disabled:opacity-50 self-start sm:self-auto"
        >
          Add Region
        </button>
      </div>
      <div className="p-4 sm:p-6">
        {isAdding && (
          <div className="mb-4 p-4 bg-white border border-bcgov-border rounded space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                autoFocus
                value={newRegion.name}
                onChange={(e) =>
                  setNewRegion({ ...newRegion, name: e.target.value })
                }
                placeholder="Region name *"
                aria-label="Region name"
                className="px-3 py-2 border border-bcgov-border rounded text-sm
                  focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
              <input
                type="email"
                value={newRegion.managerEmail}
                onChange={(e) =>
                  setNewRegion({ ...newRegion, managerEmail: e.target.value })
                }
                placeholder="Manager email"
                aria-label="Manager email"
                className="px-3 py-2 border border-bcgov-border rounded text-sm
                  focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
              <input
                type="email"
                value={newRegion.supervisorEmail}
                onChange={(e) =>
                  setNewRegion({
                    ...newRegion,
                    supervisorEmail: e.target.value,
                  })
                }
                placeholder="Supervisor email"
                aria-label="Supervisor email"
                className="px-3 py-2 border border-bcgov-border rounded text-sm
                  focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
              <input
                type="email"
                value={newRegion.assistantSupervisorEmail}
                onChange={(e) =>
                  setNewRegion({
                    ...newRegion,
                    assistantSupervisorEmail: e.target.value,
                  })
                }
                placeholder="Asst. supervisor email"
                aria-label="Assistant supervisor email"
                className="px-3 py-2 border border-bcgov-border rounded text-sm
                  focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
              <input
                type="email"
                value={newRegion.sharedMailboxEmail}
                onChange={(e) =>
                  setNewRegion({
                    ...newRegion,
                    sharedMailboxEmail: e.target.value,
                  })
                }
                placeholder="Shared mailbox email"
                aria-label="Shared mailbox email"
                className="px-3 py-2 border border-bcgov-border rounded text-sm
                  focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={!newRegion.name.trim() || createMutation.isPending}
                className="px-4 py-2 bg-bcgov-blue text-white rounded text-sm
                  hover:bg-bcgov-blue-dark disabled:opacity-50"
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewRegion({
                    name: "",
                    managerEmail: "",
                    supervisorEmail: "",
                    assistantSupervisorEmail: "",
                    sharedMailboxEmail: "",
                  });
                }}
                disabled={createMutation.isPending}
                className="px-4 py-2 border border-bcgov-border rounded text-sm
                  hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              {createMutation.isError && (
                <span className="text-red-600 text-sm">
                  Failed to create region
                </span>
              )}
            </div>
          </div>
        )}
        <Table
          data={regions}
          columns={columns}
          loading={isLoading}
          emptyMessage="No regions found"
        />
      </div>
    </div>
  );
}
