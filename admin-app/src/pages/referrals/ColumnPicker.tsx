import { useState } from "react";
import { Dialog } from "../../components/ui/Dialog";
import { DEFAULT_REFERRAL_COLUMNS, REFERRAL_COLUMNS } from "./columns";

interface ColumnPickerProps {
  selectedKeys: string[];
  onSave: (keys: string[]) => void;
  onClose: () => void;
  saving?: boolean;
}

export function ColumnPicker({
  selectedKeys,
  onSave,
  onClose,
  saving = false,
}: Readonly<ColumnPickerProps>) {
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selectedKeys));

  const toggle = (key: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = () => {
    const ordered = REFERRAL_COLUMNS.filter((c) => draft.has(c.key)).map(
      (c) => c.key,
    );
    onSave(ordered);
  };

  const handleReset = () => {
    setDraft(new Set(DEFAULT_REFERRAL_COLUMNS));
  };

  const noneSelected = draft.size === 0;

  return (
    <Dialog open onClose={onClose} title="Choose columns" size="lg">
      <p className="text-sm text-bcgov-gray-dark mb-4">
        Select the columns visible on the referrals table. This change is shared
        with all admins.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-[50vh] overflow-y-auto pr-2">
        {REFERRAL_COLUMNS.map((col) => (
          <label
            key={col.key}
            className="flex items-center gap-2 text-sm text-bcgov-gray-dark cursor-pointer py-1"
          >
            <input
              type="checkbox"
              checked={draft.has(col.key)}
              onChange={() => toggle(col.key)}
            />
            <span>{col.label}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-6 pt-4 border-t border-bcgov-border">
        <button
          type="button"
          onClick={handleReset}
          className="py-2 px-4 border border-bcgov-border rounded text-sm
            bg-white hover:bg-bcgov-gray-light text-bcgov-gray-dark
            focus:outline-none focus:ring-2 focus:ring-bcgov-blue/20"
        >
          Reset to default
        </button>
        <div className="flex gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-bcgov-border rounded text-sm
              bg-white hover:bg-bcgov-gray-light text-bcgov-gray-dark
              focus:outline-none focus:ring-2 focus:ring-bcgov-blue/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || noneSelected}
            className="py-2 px-4 rounded text-sm bg-bcgov-blue text-white
              hover:bg-bcgov-blue-dark disabled:opacity-50
              disabled:cursor-not-allowed focus:outline-none focus:ring-2
              focus:ring-bcgov-blue/30"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
