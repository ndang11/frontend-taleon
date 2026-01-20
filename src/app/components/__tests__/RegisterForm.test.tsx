import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, vi } from "vitest";
import { RegisterForm } from "../RegisterForm";

// Mock the API functions
vi.mock("../../lib/api-client", () => ({
  register: vi.fn(),
  createBlog: vi.fn(),
  generateSlug: vi.fn((name) => name.toLowerCase().replace(/ /g, "-")),
}));

// Mock auth
vi.mock("../../lib/auth", () => ({
  setAuthData: vi.fn(),
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    set: vi.fn(),
    get: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { createBlog, register } from "../../lib/api-client";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>,
  );
};

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form fields", () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByLabelText("What should we call your blog?"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /join taleon/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderWithProviders(<RegisterForm />);

    fireEvent.click(screen.getByRole("button", { name: /join taleon/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Blog name must be at least 2 characters/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be at least 8 characters/i),
      ).toBeInTheDocument();
    });
  });

  it("submits successfully and creates blog", async () => {
    const mockUser = { id: "1", email: "john@example.com", name: "John Doe" };
    const mockToken = "token123";
    (register as Mock).mockResolvedValue({ user: mockUser, token: mockToken });
    (createBlog as Mock).mockResolvedValue({
      id: "blog1",
      name: "John Doe",
      slug: "john-doe",
      userId: "1",
    });

    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("What should we call your blog?"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /join taleon/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      expect(createBlog).toHaveBeenCalledWith(
        {
          name: "John Doe",
          slug: "john-doe",
          userId: "1",
        },
        mockToken,
      );
      expect(mockPush).toHaveBeenCalledWith("/john-doe");
    });
  });

  it("shows error on registration failure", async () => {
    (register as Mock).mockRejectedValue(new Error("Registration failed"));

    renderWithProviders(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("What should we call your blog?"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /join taleon/i }));

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });
});
