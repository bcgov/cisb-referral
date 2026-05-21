import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FilterOperator, SortOrder } from "../../types";
import { ColumnFilterPopover } from "./ColumnFilterPopover";

const DROPDOWN_OFFSET = 4;
const VIEWPORT_PADDING = 8;

const DATE_SORT_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "individualDateOfBirth",
  "releaseDate",
  "assignedOn",
  "firstContactMadeOn",
  "followUpDate",
  "dueDate",
  "completedDate",
]);

const NUMERIC_SORT_KEYS = new Set(["lottTriage", "lottContact"]);
const BOOLEAN_SORT_KEYS = new Set(["flag"]);

function getSortLabels(columnKey: string): { asc: string; desc: string } {
  if (DATE_SORT_KEYS.has(columnKey)) {
    return { asc: "Oldest to Newest", desc: "Newest to Oldest" };
  }
  if (NUMERIC_SORT_KEYS.has(columnKey)) {
    return { asc: "Lowest to Highest", desc: "Highest to Lowest" };
  }
  if (BOOLEAN_SORT_KEYS.has(columnKey)) {
    return { asc: "No to Yes", desc: "Yes to No" };
  }
  return { asc: "A to Z", desc: "Z to A" };
}

interface ColumnHeaderMenuProps {
  columnKey: string;
  label: string;
  isOpen: boolean;
  sortBy?: string;
  sortOrder?: SortOrder;
  activeFilterBy?: string;
  activeFilterOperator?: FilterOperator;
  activeFilterValue?: string;
  sortable?: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSort: (order: SortOrder) => void;
  onApplyFilter: (operator: FilterOperator, value: string) => void;
  onClearFilter: () => void;
}

export function ColumnHeaderMenu({
  columnKey,
  label,
  isOpen,
  sortBy,
  sortOrder,
  activeFilterBy,
  activeFilterOperator,
  activeFilterValue,
  sortable = true,
  onOpen,
  onClose,
  onSort,
  onApplyFilter,
  onClearFilter,
}: Readonly<ColumnHeaderMenuProps>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [draftOperator, setDraftOperator] = useState<FilterOperator>("equals");
  const [draftValue, setDraftValue] = useState("");

  useLayoutEffect(() => {
    if (!isOpen || !dropdownRef.current || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!dropdownRef.current || !triggerRef.current) {
        return;
      }

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();

      let nextLeft = triggerRect.left;
      if (
        nextLeft + dropdownRect.width >
        window.innerWidth - VIEWPORT_PADDING
      ) {
        nextLeft = window.innerWidth - VIEWPORT_PADDING - dropdownRect.width;
      }
      if (nextLeft < VIEWPORT_PADDING) {
        nextLeft = VIEWPORT_PADDING;
      }

      let nextTop = triggerRect.bottom + DROPDOWN_OFFSET;
      if (
        nextTop + dropdownRect.height >
        window.innerHeight - VIEWPORT_PADDING
      ) {
        nextTop = Math.max(
          VIEWPORT_PADDING,
          triggerRect.top - dropdownRect.height - DROPDOWN_OFFSET,
        );
      }

      setDropdownLeft((current) => (current === nextLeft ? current : nextLeft));
      setDropdownTop((current) => (current === nextTop ? current : nextTop));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, showFilterPopover]);

  const isSorted = sortBy === columnKey;
  const sortLabels = getSortLabels(columnKey);
  const hasActiveFilter =
    activeFilterBy === columnKey && Boolean(activeFilterValue?.trim());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current?.contains(event.target as Node) ||
        dropdownRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      onClose();
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        setTimeout(() => triggerRef.current?.focus(), 0);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, onClose]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed z-30"
      style={{
        top: dropdownTop,
        left: dropdownLeft,
        maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
      }}
    >
      {showFilterPopover ? (
        <ColumnFilterPopover
          operator={draftOperator}
          value={draftValue}
          showClear={hasActiveFilter}
          onOperatorChange={setDraftOperator}
          onValueChange={setDraftValue}
          onApply={() => {
            onApplyFilter(draftOperator, draftValue.trim());
            onClose();
          }}
          onClear={() => {
            onClearFilter();
            onClose();
          }}
          onClose={onClose}
        />
      ) : (
        <div className="w-48 max-w-full rounded border border-bcgov-border bg-white py-1 shadow-xl">
          {sortable ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onSort("asc");
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bcgov-gray-dark hover:bg-bcgov-gray-light"
              >
                <span aria-hidden="true">↑</span>
                <span>{sortLabels.asc}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSort("desc");
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bcgov-gray-dark hover:bg-bcgov-gray-light"
              >
                <span aria-hidden="true">↓</span>
                <span>{sortLabels.desc}</span>
              </button>
              <div className="my-1 border-t border-bcgov-border" />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setShowFilterPopover(true)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bcgov-gray-dark hover:bg-bcgov-gray-light"
          >
            <span>Filter by</span>
          </button>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={() => {
                onClearFilter();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-bcgov-gray-dark hover:bg-bcgov-gray-light"
            >
              <span>Clear filter</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div ref={rootRef} className="relative flex items-center gap-1">
      <span>{label}</span>
      {sortable && isSorted ? (
        <span aria-hidden="true" className="text-xs text-bcgov-blue">
          {sortOrder === "asc" ? "↑" : "↓"}
        </span>
      ) : null}
      {hasActiveFilter ? (
        <span aria-hidden="true" className="text-xs text-bcgov-blue">
          ●
        </span>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (isOpen) {
            onClose();
          } else {
            const isActiveFilterForColumn = activeFilterBy === columnKey;
            setShowFilterPopover(false);
            setDraftOperator(
              isActiveFilterForColumn
                ? (activeFilterOperator ?? "equals")
                : "equals",
            );
            setDraftValue(
              isActiveFilterForColumn ? (activeFilterValue ?? "") : "",
            );
            onOpen();
          }
        }}
        className="rounded p-0.5 text-bcgov-gray-dark hover:bg-bcgov-gray-light"
        aria-label={`Open options for ${label}`}
      >
        <span aria-hidden="true" className="text-xs">
          &#x25BE;
        </span>
      </button>

      {isOpen ? createPortal(dropdownContent, document.body) : null}
    </div>
  );
}
