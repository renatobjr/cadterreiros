import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it.each(["primary", "ghost", "quiet", "danger", "onDeep", "light"] as const)(
    "renders variant %s with correct class",
    (variant) => {
      render(<Button variant={variant}>x</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("btn");
      expect(btn.className).toContain(`btn--${variant === "onDeep" ? "onDeep" : variant}`);
    }
  );

  it("defaults to primary variant", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn--primary");
  });

  it("disabled state sets disabled attribute", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("loading state disables and sets aria-busy", () => {
    render(<Button loading>x</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("fires onClick when not disabled", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>x</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has accessible button role by default", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
