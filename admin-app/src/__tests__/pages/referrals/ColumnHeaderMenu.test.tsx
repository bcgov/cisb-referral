import { type ComponentProps, useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

function ControlledMenu(
  overrides: Partial<ComponentProps<typeof ColumnHeaderMenu>> = {},
) {
  const [isOpen, setIsOpen] = useState(false);
  const props = {
    columnKey: "individualLastName",
    label: "Last Name",
    sortBy: undefined,
    sortOrder: undefined,
    activeFilterBy: undefined,
    activeFilterOperator: undefined,
    activeFilterValue: undefined,
    sortable: true,
    onSort: vi.fn(),
    onApplyFilter: vi.fn(),
    onClearFilter: vi.fn(),
    ...overrides,
  };

  return (
    <ColumnHeaderMenu
      {...props}
      isOpen={isOpen}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
    />
  );
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

  it("returns focus to the trigger when Escape closes the menu", async () => {
    const props = renderMenu();
    const trigger = screen.getByLabelText("Open options for Last Name");
    const outsideButton = document.createElement("button");
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(props.onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());

    outsideButton.remove();
  });

  it("closes when clicking outside the trigger and menu", () => {
    const props = renderMenu();

    fireEvent.mouseDown(document.body);

    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("prefills filter drafts only for the active filter column", () => {
    render(
      <ControlledMenu
        activeFilterBy="region"
        activeFilterOperator="contains"
        activeFilterValue="Island"
      />,
    );

    fireEvent.click(screen.getByLabelText("Open options for Last Name"));
    fireEvent.click(screen.getByText("Filter by"));

    expect(
      screen.getByRole("combobox", { name: "Filter operator" }),
    ).toHaveValue("equals");
    expect(screen.getByLabelText("Filter value")).toHaveValue("");
  });

  it("prefills filter drafts for the current active filter column", () => {
    render(
      <ControlledMenu
        activeFilterBy="individualLastName"
        activeFilterOperator="contains"
        activeFilterValue="Smith"
      />,
    );

    fireEvent.click(screen.getByLabelText("Open options for Last Name"));
    fireEvent.click(screen.getByText("Filter by"));

    expect(
      screen.getByRole("combobox", { name: "Filter operator" }),
    ).toHaveValue("contains");
    expect(screen.getByLabelText("Filter value")).toHaveValue("Smith");
  });
});
