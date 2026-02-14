import { useState } from "react";

interface EditableCellProps {
  /** Current display value */
  value: string;
  /** Called with the new value when Save is clicked */
  onSave: (value: string) => Promise<void>;
  /** Input type (default: 'text') */
  type?: "text" | "email";
  /** Placeholder shown when value is empty */
  placeholder?: string;
  /** Whether the field is required (prevents saving empty values) */
  required?: boolean;
}

/**
 * An inline-editable cell with explicit Edit / Save / Cancel buttons.
 * Displays the current value with an Edit button. Clicking Edit reveals
 * an input with Save and Cancel controls.
 */
export function EditableCell({
  value,
  onSave,
  type = "text",
  placeholder = "-",
  required = false,
}: Readonly<EditableCellProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (required && !trimmed) return;
    if (trimmed === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  /** Save on Enter, cancel on Escape */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 min-w-0 px-2 py-1 border border-bcgov-blue rounded text-sm
            focus:outline-none focus:ring-2 focus:ring-bcgov-blue"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || (required && !editValue.trim())}
          className="px-2 py-1 bg-bcgov-blue text-white rounded text-xs
            hover:bg-bcgov-blue-dark disabled:opacity-50 whitespace-nowrap"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSaving}
          className="px-2 py-1 border border-bcgov-border rounded text-xs
            hover:bg-gray-50 disabled:opacity-50 whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="px-2 py-1 inline-block min-w-[60px]">
        {value || <span className="text-bcgov-gray italic">{placeholder}</span>}
      </span>
      <button
        type="button"
        onClick={handleEdit}
        className="px-2 py-1 text-bcgov-blue text-xs border border-bcgov-border
          rounded hover:border-bcgov-blue hover:bg-blue-50 whitespace-nowrap"
      >
        Edit
      </button>
    </div>
  );
}
