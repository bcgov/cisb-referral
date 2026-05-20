import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, EditableCell } from "../components/ui";
import { useCurrentUser } from "../hooks";
import { apiService } from "../services";
import type { Ministry } from "../types";
import { UserRole } from "../types";

/**
 * Ministries management page with inline cell editing,
 * inline add row, and delete support.
 *
 * @returns Ministries admin page component
 */
export function Ministries() {
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const canManage =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.SYSTEM_ADMINISTRATOR;
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: ministries = [], isLoading } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => apiService.fetchMinistries(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      apiService.updateMinistry(id, { name }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ministries"] }),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => apiService.createMinistry({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      setIsAdding(false);
      setNewName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteMinistry(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["ministries"] }),
  });

  const handleCreate = () => {
    const name = newName.trim();
    if (name) {
      createMutation.mutate(name);
    }
  };

  const handleDelete = (ministry: Ministry) => {
    if (confirm(`Delete "${ministry.name}"?`)) {
      deleteMutation.mutate(ministry.id);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (ministry: Ministry) =>
        canManage ? (
          <EditableCell
            value={ministry.name}
            onSave={async (name) => {
              if (!name) return;
              await updateMutation.mutateAsync({ id: ministry.id, name });
            }}
          />
        ) : (
          <span className="px-2 py-1 inline-block">{ministry.name}</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 px-4 sm:px-6 bg-white border-b border-bcgov-border">
        <h1 className="text-xl font-bold text-bcgov-gray-dark m-0">
          Ministries
        </h1>
        {canManage && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="px-4 py-2 bg-bcgov-blue text-white rounded
              hover:bg-bcgov-blue-dark disabled:opacity-50 self-start sm:self-auto"
          >
            Add Ministry
          </button>
        )}
      </div>
      <div className="p-4 sm:p-6">
        {canManage && isAdding && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white border border-bcgov-border rounded">
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter ministry name..."
              className="flex-1 max-w-md px-3 py-2 border border-bcgov-border rounded text-sm
                focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || createMutation.isPending}
              className="px-4 py-2 bg-bcgov-blue text-white rounded text-sm
                hover:bg-bcgov-blue-dark disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewName("");
              }}
              disabled={createMutation.isPending}
              className="px-4 py-2 border border-bcgov-border rounded text-sm
                hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            {createMutation.isError && (
              <span className="text-red-600 text-sm">Failed to create</span>
            )}
          </div>
        )}
        <Table
          data={ministries}
          columns={columns}
          onDelete={canManage ? handleDelete : undefined}
          loading={isLoading}
          emptyMessage="No ministries found"
        />
      </div>
    </div>
  );
}
