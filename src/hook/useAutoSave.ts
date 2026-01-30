import { debounce } from "lodash";
import { useCallback, useState } from "react";
import { autoSave } from "@/core/lib/api-client";

export function useEditorAutosave(postId: string | null) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const debouncedSave = useCallback(
    debounce(async (content: any, title?: string) => {
      if (!postId) return;
      setSaveStatus("saving");
      try {
        // Send both content and title to the autosave endpoint
        await autoSave(postId, content, title);
        setSaveStatus("saved");
      } catch (error) {
        console.error("Autosave failed", error);
        setSaveStatus("error");
      }
    }, 2000), // Save after 2 seconds of inactivity
    [],
  );

  return { debouncedSave, saveStatus };
}
