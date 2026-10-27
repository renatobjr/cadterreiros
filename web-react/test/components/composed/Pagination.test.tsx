import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../../../src/components/composed/Pagination";

describe("Pagination", () => {
  it("renders page buttons", () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });

  it("marks current page with aria-current", () => {
    render(<Pagination page={2} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("disables previous on first page", () => {
    render(<Pagination page={1} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /página anterior/i })).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination page={3} totalPages={3} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /próxima página/i })).toBeDisabled();
  });

  it("calls onChange when clicking a page", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("navigates with next/prev buttons", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /próxima página/i }));
    expect(onChange).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: /página anterior/i }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("does not call onChange when clicking current page", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={3} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});