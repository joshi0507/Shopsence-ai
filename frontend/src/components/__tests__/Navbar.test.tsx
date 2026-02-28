import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Navbar from "../Navbar";

describe("Navbar Component", () => {
  it("renders brand name correctly", () => {
    const onOpenAuth = vi.fn();
    render(<Navbar onOpenAuth={onOpenAuth} />);
    expect(screen.getByText("ShopSense")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    const onOpenAuth = vi.fn();
    render(<Navbar onOpenAuth={onOpenAuth} />);
    const links = ["Features", "Analytics", "Personas", "Network", "Reviews"];
    links.forEach((link) => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it("calls onOpenAuth when Sign In button is clicked", () => {
    const onOpenAuth = vi.fn();
    render(<Navbar onOpenAuth={onOpenAuth} />);
    const signInButton = screen.getByText("Sign In");
    fireEvent.click(signInButton);
    expect(onOpenAuth).toHaveBeenCalledWith("login");
  });

  it("calls onOpenAuth when Get Started button is clicked", () => {
    const onOpenAuth = vi.fn();
    render(<Navbar onOpenAuth={onOpenAuth} />);
    const getStartedButton = screen.getByText("Get Started");
    fireEvent.click(getStartedButton);
    expect(onOpenAuth).toHaveBeenCalledWith("signup");
  });
});
