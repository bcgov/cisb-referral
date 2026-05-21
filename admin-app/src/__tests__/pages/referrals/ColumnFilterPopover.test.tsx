import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnFilterPopover } from "../../../pages/referrals/ColumnFilterPopover";

function renderPopover(overrides = {}) {
  const props = {
    operator: "equals" as const,
    value: "",
    showClear: true,
    onOperatorChange: vi.fn(),
    onValueChange: vi.fn(),
    onApply: vi.fn(),
    onClear: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };

  render(<ColumnFilterPopover {...props} />);
  return props;
}

describe("ColumnFilterPopover", () => {
  it("renders accessible filter controls", () => {
    renderPopover();

    expect(
      screen.getByRole("combobox", { name: "Filter operator" }),
    ).toHaveValue("equals");
    expect(screen.getByLabelText("Filter value")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Close filter" }),
    ).toBeInTheDocument();
  });

  it("calls change handlers for operator and value updates", () => {
    const props = renderPopover();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "contains" },
    });
    fireEvent.change(screen.getByLabelText("Filter value"), {
      target: { value: "smith" },
    });

    expect(props.onOperatorChange).toHaveBeenCalledWith("contains");
    expect(props.onValueChange).toHaveBeenCalledWith("smith");
  });

  it("disables apply for blank values", () => {
    const blankProps = renderPopover({ value: "   " });

    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    fireEvent.keyDown(screen.getByLabelText("Filter value"), { key: "Enter" });
    expect(blankProps.onApply).not.toHaveBeenCalled();
  });

  it("applies with Enter when the filter value is valid", () => {
    const props = renderPopover({ value: "smith" });

    fireEvent.keyDown(screen.getByLabelText("Filter value"), { key: "Enter" });

    expect(props.onApply).toHaveBeenCalledOnce();
  });

  it("applies, clears, and closes through button actions", () => {
    const props = renderPopover({ value: "smith" });

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    fireEvent.click(screen.getByRole("button", { name: "Close filter" }));
    fireEvent.keyDown(screen.getByLabelText("Filter value"), { key: "Enter" });

    expect(props.onApply).toHaveBeenCalledTimes(2);
    expect(props.onClear).toHaveBeenCalledOnce();
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it("hides the clear action when no active filter exists", () => {
    renderPopover({ showClear: false });

    expect(
      screen.queryByRole("button", { name: "Clear" }),
    ).not.toBeInTheDocument();
  });

  it("hides the contains option when equalsOnly is true", () => {
    renderPopover({ equalsOnly: true });

    const select = screen.getByRole("combobox", { name: "Filter operator" });
    expect(select).toHaveValue("equals");
    expect(
      screen.queryByRole("option", { name: "Contains" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Equals" })).toBeInTheDocument();
  });

  it("shows the contains option when equalsOnly is false", () => {
    renderPopover({ equalsOnly: false });

    expect(
      screen.getByRole("option", { name: "Contains" }),
    ).toBeInTheDocument();
  });

  it("renders a date input for date columns", () => {
    renderPopover({ columnType: "date" });

    const input = screen.getByLabelText("Filter value");
    expect(input).toHaveAttribute("type", "date");
    expect(
      screen.queryByRole("option", { name: "Contains" }),
    ).not.toBeInTheDocument();
  });

  it("renders a number input for number columns", () => {
    renderPopover({ columnType: "number" });

    const input = screen.getByLabelText("Filter value");
    expect(input).toHaveAttribute("type", "number");
  });

  it("renders a Yes/No select and hides operator for boolean columns", () => {
    renderPopover({ columnType: "boolean" });

    expect(
      screen.queryByRole("combobox", { name: "Filter operator" }),
    ).not.toBeInTheDocument();
    const valueSelect = screen.getByRole("combobox", { name: "Filter value" });
    expect(screen.getByRole("option", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "No" })).toBeInTheDocument();
    expect(valueSelect).toHaveValue("");
  });

  it("enables apply when a boolean value is selected", () => {
    const props = renderPopover({ columnType: "boolean", value: "yes" });

    expect(screen.getByRole("button", { name: "Apply" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(props.onApply).toHaveBeenCalledOnce();
  });

  it("disables apply when no boolean value is selected", () => {
    renderPopover({ columnType: "boolean", value: "" });

    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
  });
});
