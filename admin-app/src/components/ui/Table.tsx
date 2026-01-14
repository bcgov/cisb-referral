import { type ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  onEdit,
  loading = false,
  emptyMessage = "No data available",
}: Readonly<TableProps<T>>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-bcgov-gray">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-bcgov-gray">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-bcgov-border">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-bcgov-gray-dark uppercase tracking-wider border-b border-bcgov-border"
              >
                {column.header}
              </th>
            ))}
            {onEdit && (
              <th className="px-6 py-3 text-left text-xs font-medium text-bcgov-gray-dark uppercase tracking-wider border-b border-bcgov-border">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-bcgov-border">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-bcgov-gray-dark"
                >
                  {column.render
                    ? column.render(item)
                    : (item[column.key as keyof T] as ReactNode)}
                </td>
              ))}
              {onEdit && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-bcgov-blue hover:text-bcgov-blue-dark font-medium"
                  >
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
