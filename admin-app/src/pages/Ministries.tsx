import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, EditableCell } from "../components/ui";
import { apiService } from "../services";
import type { Ministry } from "../types";

/**
 * Ministries management page with inline cell editing,
 * inline add row, and delete support.
 *
 * @returns Ministries admin page component
 */
export function Ministries() {
  const queryClient = useQueryClient();
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
      render: (ministry: Ministry) => (
        <EditableCell
          value={ministry.name}
          onSave={async (name) => {
            if (!name) return;
            await updateMutation.mutateAsync({ id: ministry.id, name });
          }}
        />
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
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="px-4 py-2 bg-bcgov-blue text-white rounded
            hover:bg-bcgov-blue-dark disabled:opacity-50"
        >
          Add Ministry
        </button>
      </div>
      <div className="p-6">
        {isAdding && (
          <div className="mb-4 flex items-center gap-3 p-4 bg-white border border-bcgov-border rounded">
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
          onDelete={handleDelete}
          loading={isLoading}
          emptyMessage="No ministries found"
        />
      </div>
    </div>
  );
}
