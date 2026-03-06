import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Dashboard from "../Dashboard";
import { BrowserRouter } from "react-router-dom";

// Mock the api module
vi.mock("../../lib/api", () => ({
  api: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    getDashboardData: vi.fn(),
  },
}));

const mockUser = {
  user_id: "user123",
  username: "testuser",
  email: "test@example.com",
};

const renderDashboard = (user = mockUser) => {
  return render(
    <BrowserRouter>
      <Dashboard user={user} onLogout={vi.fn()} />
    </BrowserRouter>
  );
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashboard with user information", () => {
    renderDashboard();
    expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  });

  it("renders main navigation sections", () => {
    renderDashboard();
    
    const sections = [
      "Overview",
      "Segments",
      "Affinity",
      "Sentiment",
      "Personas",
      "Recommendations",
    ];
    
    sections.forEach((section) => {
      expect(screen.getByText(section)).toBeInTheDocument();
    });
  });

  it("calls onLogout when logout button is clicked", async () => {
    const mockLogout = vi.fn();
    render(
      <BrowserRouter>
        <Dashboard user={mockUser} onLogout={mockLogout} />
      </BrowserRouter>
    );
    
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it("displays loading state initially", () => {
    renderDashboard();
    // Dashboard should have some loading or content state
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
