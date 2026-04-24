import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import { Button } from "./button";
import userEvent from "@testing-library/user-event";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled")).toBeDisabled();
  });

  it("renders different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    const button = screen.getByText("Default");
    expect(button.className).toContain("bg-primary");

    rerender(<Button variant="outline">Outline</Button>);
    const outlineButton = screen.getByText("Outline");
    expect(outlineButton.className).toContain("border");

    rerender(<Button variant="ghost">Ghost</Button>);
    const ghostButton = screen.getByText("Ghost");
    expect(ghostButton.tagName).toBe("BUTTON");
  });

  it("renders as button element", () => {
    render(<Button>Test</Button>);
    expect(screen.getByText("Test").tagName).toBe("BUTTON");
  });
});
