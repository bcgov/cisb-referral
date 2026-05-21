import type { FilterOperator } from "../../types";

interface ColumnFilterPopoverProps {
  operator: FilterOperator;
  value: string;
  showClear: boolean;
  onOperatorChange: (operator: FilterOperator) => void;
  onValueChange: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function ColumnFilterPopover({
  operator,
  value,
  showClear,
  onOperatorChange,
  onValueChange,
  onApply,
  onClear,
  onClose,
}: Readonly<ColumnFilterPopoverProps>) {
  return (
    <div className="w-64 max-w-full rounded border border-bcgov-border bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-lg font-bold text-bcgov-gray-dark">
          Filter by
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xl leading-none text-bcgov-gray hover:text-bcgov-gray-dark"
          aria-label="Close filter"
        >
          &#x2715;
        </button>
      </div>

      <div className="space-y-3">
        <select
          className="w-full rounded border border-bcgov-border bg-white px-3 py-2 text-sm text-bcgov-gray-dark"
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value as FilterOperator)}
        >
          <option value="equals">Equals</option>
          <option value="contains">Contains</option>
        </select>

        <input
          type="text"
          className="w-full rounded border border-bcgov-border bg-white px-3 py-2 text-sm text-bcgov-gray-dark"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && value.trim()) {
              onApply();
            }
          }}
          aria-label="Filter value"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={!value.trim()}
            className="rounded bg-bcgov-blue px-4 py-2 text-sm text-white hover:bg-bcgov-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
          {showClear ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded border border-bcgov-border bg-white px-4 py-2 text-sm text-bcgov-gray hover:bg-bcgov-gray-light"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
