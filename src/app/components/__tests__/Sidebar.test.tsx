import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Sidebar } from "../Sidebar";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mockPush }),
}));

// Mock auth
vi.mock("../../lib/auth", () => ({
  clearAuthData: vi.fn(),
}));

import { clearAuthData } from "../../lib/auth";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation links", () => {
    render(<Sidebar />);

    expect(
      screen.getByRole("link", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /my posts/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("highlights active link", () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).toHaveClass("bg-gray-800");
  });

  it("calls logout on logout button click", () => {
    render(<Sidebar />);

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(clearAuthData).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});
