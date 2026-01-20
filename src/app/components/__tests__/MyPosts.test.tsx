import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, vi } from "vitest";
import { MyPosts } from "../MyPosts";

// Mock API functions
vi.mock("../../lib/api-client", () => ({
  fetchPosts: vi.fn(),
  deletePost: vi.fn(),
  updatePostStatus: vi.fn(),
}));

// Mock auth
vi.mock("../../lib/auth", () => ({
  getToken: vi.fn(() => "token123"),
}));

import { deletePost, fetchPosts, updatePostStatus } from "../../lib/api-client";

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

const mockPosts = [
  {
    id: "1",
    title: "Test Post 1",
    content: "Content 1",
    status: "published" as const,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    slug: "test-post-1",
    userId: "user1",
    blogId: "blog1",
  },
  {
    id: "2",
    title: "Test Post 2",
    content: "Content 2",
    status: "draft" as const,
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    slug: "test-post-2",
    userId: "user1",
    blogId: "blog1",
  },
];

describe("MyPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchPosts as Mock).mockResolvedValue({
      posts: mockPosts,
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  it("renders posts list", async () => {
    renderWithProviders(<MyPosts />);

    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument();
      expect(screen.getByText("Test Post 2")).toBeInTheDocument();
    });
  });

  it("shows status filter", async () => {
    renderWithProviders(<MyPosts />);

    await waitFor(() => {
      expect(screen.getByText("Drafts")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
    });
  });

  it("handles delete with confirmation", async () => {
    (deletePost as Mock).mockResolvedValue(undefined);

    renderWithProviders(<MyPosts />);

    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument();
    });

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(deletePost).toHaveBeenCalledWith("2", "token123");
    });
  });

  it("handles status toggle with optimistic update", async () => {
    (updatePostStatus as Mock).mockResolvedValue({
      ...mockPosts[0],
      status: "unpublished",
    });

    renderWithProviders(<MyPosts />);

    await waitFor(() => {
      expect(screen.getByText("Test Post 1")).toBeInTheDocument();
    });

    const toggleButtons = screen.getAllByTitle("Move to Drafts");
    fireEvent.click(toggleButtons[0]);

    await waitFor(() => {
      expect(updatePostStatus).toHaveBeenCalledWith("1", "draft", "token123");
    });
  });

  it("shows pagination when multiple pages", async () => {
    (fetchPosts as Mock).mockResolvedValue({
      posts: mockPosts,
      total: 25,
      page: 1,
      limit: 10,
    });

    renderWithProviders(<MyPosts />);

    await waitFor(() => {
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });
  });
});
