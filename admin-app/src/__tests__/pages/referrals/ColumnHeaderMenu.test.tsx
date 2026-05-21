import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnHeaderMenu } from "../../../pages/referrals/ColumnHeaderMenu";

function renderMenu(overrides = {}) {
  const props = {
    columnKey: "individualLastName",
    label: "Last Name",
    isOpen: true,
    sortBy: undefined,
    sortOrder: undefined,
    activeFilterBy: undefined,
    activeFilterOperator: undefined,
    activeFilterValue: undefined,
    sortable: true,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onSort: vi.fn(),
    onApplyFilter: vi.fn(),
    onClearFilter: vi.fn(),
    ...overrides,
  };

  render(<ColumnHeaderMenu {...props} />);
  return props;
}

describe("ColumnHeaderMenu", () => {
  it("calls sort handlers for sortable columns", () => {
    const props = renderMenu();

    fireEvent.click(screen.getByText("A to Z"));

    expect(props.onSort).toHaveBeenCalledWith("asc");
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("hides sort actions for non-sortable columns", () => {
    const props = renderMenu({
      columnKey: "neededSupports",
      label: "Needed Supports",
      sortable: false,
    });

    expect(screen.queryByText("A to Z")).not.toBeInTheDocument();
    expect(screen.queryByText("Z to A")).not.toBeInTheDocument();
    expect(screen.getByText("Filter by")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Filter by"));

    expect(screen.getByLabelText("Filter value")).toBeInTheDocument();
    expect(props.onSort).not.toHaveBeenCalled();
  });
});
