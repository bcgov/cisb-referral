import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, EditableCell } from "../components/ui";
import { apiService } from "../services";
import type { Region, CreateRegionDto, UpdateRegionDto } from "../types";

/**
 * Regions management page with inline cell editing,
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

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (region: Region) => (
        <EditableCell
          value={region.name}
          onSave={async (name) => {
            if (!name) return;
            await updateMutation.mutateAsync({ id: region.id, data: { name } });
          }}
        />
      ),
    },
    {
      key: "managerEmail",
      header: "Manager Email",
      render: (region: Region) => (
        <EditableCell
          value={region.managerEmail || ""}
          type="email"
          placeholder="Click to add"
          onSave={async (managerEmail) => {
            await updateMutation.mutateAsync({
              id: region.id,
              data: { managerEmail: managerEmail || undefined },
            });
          }}
        />
      ),
    },
    {
      key: "supervisorEmail",
      header: "Supervisor Email",
      render: (region: Region) => (
        <EditableCell
          value={region.supervisorEmail || ""}
          type="email"
          placeholder="Click to add"
          onSave={async (supervisorEmail) => {
            await updateMutation.mutateAsync({
              id: region.id,
              data: { supervisorEmail: supervisorEmail || undefined },
            });
          }}
        />
      ),
    },
    {
      key: "assistantSupervisorEmail",
      header: "Asst. Supervisor Email",
      render: (region: Region) => (
        <EditableCell
          value={region.assistantSupervisorEmail || ""}
          type="email"
          placeholder="Click to add"
          onSave={async (assistantSupervisorEmail) => {
            await updateMutation.mutateAsync({
              id: region.id,
              data: {
                assistantSupervisorEmail: assistantSupervisorEmail || undefined,
              },
            });
          }}
        />
      ),
    },
    {
      key: "sharedMailboxEmail",
      header: "Shared Mailbox Email",
      render: (region: Region) => (
        <EditableCell
          value={region.sharedMailboxEmail || ""}
          type="email"
          placeholder="Click to add"
          onSave={async (sharedMailboxEmail) => {
            await updateMutation.mutateAsync({
              id: region.id,
              data: { sharedMailboxEmail: sharedMailboxEmail || undefined },
            });
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">Regions</h1>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-4 py-2 bg-bcgov-blue text-white rounded
            hover:bg-bcgov-blue-dark disabled:opacity-50"
        >
          Add Region
        </button>
      </div>
      <div className="p-6">
        {isAdding && (
          <div className="mb-4 p-4 bg-white border border-bcgov-border rounded space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <input
                type="text"
                autoFocus
                value={newRegion.name}
                onChange={(e) =>
                  setNewRegion({ ...newRegion, name: e.target.value })
                }
                placeholder="Region name *"
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
          onDelete={handleDelete}
          loading={isLoading}
          emptyMessage="No regions found"
        />
      </div>
    </div>
  );
}
