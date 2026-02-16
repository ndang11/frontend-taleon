import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { autoSave } from "@/core/lib/api-client";

export type ContentFormat = "html" | "json";

export function useEditorAutosave(
  postId: string | null,
  format: ContentFormat = "json",
) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "unauthorized"
  >("idle");

  const debouncedSave = useCallback(
    debounce(
      async (content: any, title?: string) => {
        if (!postId) return;

        setSaveStatus("saving");
        try {
          // Don't save if content is empty or undefined
          if (
            !content ||
            (typeof content === "object" && Object.keys(content).length === 0)
          ) {
            console.log("[useAutoSave] Skipping autosave - content is empty");
            setSaveStatus("idle");
            return;
          }

          // Convert content to string based on format
          let contentString: string;
          if (format === "json") {
            // For JSON format, check if it's the TipTap empty document structure
            if (typeof content === "object" && content !== null) {
              // If it's an empty TipTap doc ({"type":"doc","content":[]}), don't save
              if (
                content.type === "doc" &&
                Array.isArray(content.content) &&
                content.content.length === 0
              ) {
                console.log(
                  "[useAutoSave] Skipping autosave - empty TipTap doc",
                );
                setSaveStatus("idle");
                return;
              }
              contentString = JSON.stringify(content);
            } else {
              contentString = typeof content === "string" ? content : "";
            }
          } else {
            contentString =
              typeof content === "string"
                ? content
                : (content as any)?.html ||
                  (typeof content === "object"
                    ? JSON.stringify(content, null, 2)
                    : "");
          }

          // Ensure contentString is not undefined
          if (!contentString) {
            contentString = "";
          }

          await autoSave(postId, contentString, title);
          setSaveStatus("saved");
        } catch (error: any) {
          console.error("Autosave failed", error);

          // Handle network errors gracefully
          if (
            error.message === "Failed to fetch" ||
            error.message?.includes("network") ||
            error.message?.includes("Connection")
          ) {
            // Network error - server might be asleep, don't show error to user
            setSaveStatus("idle");
          } else if (error.status === 401 || error.message?.includes("401")) {
            setSaveStatus("unauthorized");
          } else {
            setSaveStatus("error");
          }
        }
      },
      2000, // 2 seconds debounce
      { leading: false, trailing: true },
    ),
    [],
  );

  // Cleanup debounce on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return { debouncedSave, saveStatus };
}
