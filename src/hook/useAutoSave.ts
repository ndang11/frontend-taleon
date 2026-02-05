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
          // Convert content to string based on format
          let contentString: string;
          if (format === "json") {
            contentString =
              typeof content === "string" ? content : JSON.stringify(content);
          } else {
            contentString =
              typeof content === "string"
                ? content
                : (content as any).html || JSON.stringify(content, null, 2);
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
