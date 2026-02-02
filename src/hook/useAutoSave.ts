import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { autoSave } from "@/core/lib/api-client";

export function useEditorAutosave(postId: string | null) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "unauthorized"
  >("idle");

  const debouncedSave = useCallback(
    debounce(async (content: any, title?: string) => {
      if (!postId) return;

      setSaveStatus("saving");
      try {
        await autoSave(postId, content, title);
        setSaveStatus("saved");
      } catch (error: any) {
        console.error("Autosave failed", error);

        if (error.status === 401) {
          setSaveStatus("unauthorized");
        } else {
          setSaveStatus("error");
        }
      }
    }, 2000),
    [], // Added postId to dependencies
  );

  // Cleanup debounce on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return { debouncedSave, saveStatus };
}
