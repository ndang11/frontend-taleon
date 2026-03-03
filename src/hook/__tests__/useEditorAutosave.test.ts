/**
 * @vitest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Create mock functions at module scope
const mockAutoSave = vi.fn();

// Setup mocks before importing the hook
vi.doMock("@/core/lib/api-client", () => ({
  autoSave: mockAutoSave,
}));

// Import after mocking
const { useEditorAutosave } = await import("@/hook/useAutoSave");

describe("useEditorAutosave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAutoSave.mockResolvedValue({ success: true });
    vi.spyOn(window.localStorage, "getItem").mockReturnValue("mock-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("shouldSkipAutoSave for empty content", () => {
    it("should skip autosave when content is undefined", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave(undefined, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("idle");
    });

    it("should skip autosave when content is null", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave(null, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("idle");
    });

    it("should skip autosave when content is empty object", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave({}, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("idle");
    });

    it("should skip autosave when content is empty TipTap doc", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const emptyTipTapDoc = {
        type: "doc",
        content: [],
      };

      await act(async () => {
        await result.current.debouncedSave(emptyTipTapDoc, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("idle");
    });

    it("should skip autosave when content is empty array", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave([], "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("idle");
    });
  });

  describe("shouldSaveContent for valid content", () => {
    it("should save valid TipTap JSON content", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const validTipTapContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Hello World",
              },
            ],
          },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(validTipTapContent, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).toHaveBeenCalledWith(
        "test-post-id",
        JSON.stringify(validTipTapContent),
        "Test Title",
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("should save valid HTML content", async () => {
      const { result } = renderHook(() =>
        useEditorAutosave("test-post-id", "html"),
      );

      const htmlContent = "<p>Hello <strong>World</strong></p>";

      await act(async () => {
        await result.current.debouncedSave(htmlContent, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).toHaveBeenCalledWith(
        "test-post-id",
        htmlContent,
        "Test Title",
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("should save plain text content", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const textContent = "This is plain text content";

      await act(async () => {
        await result.current.debouncedSave(textContent, "Test Title");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).toHaveBeenCalledWith(
        "test-post-id",
        textContent,
        "Test Title",
      );
      expect(result.current.saveStatus).toBe("saved");
    });
  });

  describe("save status states", () => {
    it("should set status to error when autosave fails", async () => {
      mockAutoSave.mockRejectedValue(new Error("Autosave failed"));

      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const content = {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Test" }] },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(content, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(result.current.saveStatus).toBe("error");
    });

    it("should set status to unauthorized when 401 error occurs", async () => {
      const error = new Error("Unauthorized");
      (error as any).status = 401;
      mockAutoSave.mockRejectedValue(error);

      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const content = {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Test" }] },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(content, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(result.current.saveStatus).toBe("unauthorized");
    });

    it("should handle network errors gracefully", async () => {
      mockAutoSave.mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const content = {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Test" }] },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(content, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(result.current.saveStatus).toBe("idle");
    });
  });

  describe("no postId scenarios", () => {
    it("should not attempt autosave when postId is null", async () => {
      const { result } = renderHook(() => useEditorAutosave(null));

      const content = {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "Test" }] },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(content, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
    });
  });

  describe("complex TipTap content scenarios", () => {
    it("should save complex TipTap content with multiple blocks", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const complexContent = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "My Title" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a " },
              { type: "text", marks: [{ type: "bold" }], text: "bold" },
              { type: "text", text: " word" },
            ],
          },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(complexContent, "Complex Post");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).toHaveBeenCalledWith(
        "test-post-id",
        JSON.stringify(complexContent),
        "Complex Post",
      );
    });

    it("should handle content with special characters", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const specialCharContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Special chars: <>&\"'{}[]|\\/:;*?@#$%^&*()_+-=",
              },
            ],
          },
        ],
      };

      await act(async () => {
        await result.current.debouncedSave(specialCharContent, "Special Chars");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).toHaveBeenCalled();
      expect(result.current.saveStatus).toBe("saved");
    });
  });

  describe("substring error prevention", () => {
    it("should not throw when content is empty object", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave({}, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
    });

    it("should not throw when content is empty TipTap doc", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      const emptyDoc = { type: "doc", content: [] };

      await act(async () => {
        await result.current.debouncedSave(emptyDoc, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
    });

    it("should handle undefined content safely", async () => {
      const { result } = renderHook(() => useEditorAutosave("test-post-id"));

      await act(async () => {
        await result.current.debouncedSave(undefined, "Test");
      });

      await new Promise((resolve) => setTimeout(resolve, 2100));

      expect(mockAutoSave).not.toHaveBeenCalled();
    });
  });
});
